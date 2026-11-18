import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ChargesAndTaxesAmountTypeEnum,
  ChargeTypeEnum,
  CompareChargeParameterEnum,
  CompareTaxParameterEnum,
  HttpRequestMethodEnum,
  TaxTypeEnum,
} from 'src/common/enums';
import {
  ApplicableTaxLedgerEntry,
  ChargeData,
  ChargeLedger,
  ChargeObject,
  ConcessionGroup,
  CustomerSearchResponse,
  TaxData,
  TaxEntry,
} from 'src/common/interfaces';
import { ConcessionGroupService } from '../concession-group/concession-group.service';
import { HttpClientService } from '../http-client/http-client.service';
import { CustomerManagementService } from '../customer-management/customer-management.service';

@Injectable()
export class ProductManagementService {
  private readonly productManagementBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpClientService: HttpClientService,
    private readonly concessionGroupService: ConcessionGroupService,
    private readonly customerManagementService: CustomerManagementService,
  ) {
    this.productManagementBaseUrl = this.configService.get<string>(
      'baseUrl.productManagement',
    );
  }

  async getChargeByChargeId(chargeId: string, token: string) {
    const url = `${this.productManagementBaseUrl}/v1/charges/${chargeId}/entities`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: token,
      },
    });

    return data;
  }

  private checkNullValues(data: ChargeData): void {
    if (!data?.charge_value?.length) {
      throw new BadRequestException(
        'Selected charge has a null or empty charge value',
      );
    }

    if (!data?.charge_impacted_ledgers?.length) {
      throw new BadRequestException('Selected charge has no impacted ledgers');
    }

    if (!Array.isArray(data?.charge_applicable_tax)) {
      throw new BadRequestException(
        'Selected charge has an invalid charge applicable tax array',
      );
    }
  }

  private async getChargeApplicableTaxLedgerEntries(
    chargeObj: ChargeObject,
    token: string,
  ): Promise<ApplicableTaxLedgerEntry[]> {
    const { charge_applicable_tax, charge, charge_impacted_ledger } = chargeObj;

    const chargeApplicableTaxDetail: TaxEntry[] = await Promise.all(
      charge_applicable_tax.flatMap((item) => {
        if (Array.isArray(item.charge_applicable_taxes)) {
          return item.charge_applicable_taxes.map(async (tax: any) => {
            return await this.calculateTaxEntries(tax.tax_id, charge, token);
          });
        } else if (item.tax_id) {
          return [this.calculateTaxEntries(item.tax_id, charge, token)];
        } else if (item.charge_applicable_tax_id) {
          return [
            this.calculateTaxEntries(
              item.charge_applicable_tax_id,
              charge,
              token,
            ),
          ];
        }
        return [];
      }),
    );

    const validTaxes = chargeApplicableTaxDetail.filter((tax) => tax !== null);
    if (!validTaxes.length) {
      return [];
    }

    const debitLedgers: ChargeLedger[] = [];

    const creditLedgers: ChargeLedger[] = [];

    validTaxes.forEach((tax) => {
      const taxLedgerAndAmount = Array.isArray(tax.tax_impacted_ledgers)
        ? tax.tax_impacted_ledgers.map((ledgerDetails) => ({
            ledger: ledgerDetails.ledger_id,
            ledger_code: ledgerDetails.ledger_code,
            amount: parseFloat(
              (tax.tax * (parseFloat(ledgerDetails.allocation) / 100)).toFixed(
                2,
              ),
            ),
            tax_name: tax.tax_name,
          }))
        : [
            {
              ledger: tax.tax_impacted_ledgers.ledger_id,
              ledger_code: tax.tax_impacted_ledgers.ledger_code,
              amount: parseFloat(
                (
                  tax.tax *
                  (parseFloat(tax.tax_impacted_ledgers.allocation) / 100)
                ).toFixed(2),
              ),
              tax_name: tax.tax_name,
            },
          ];

      const chargeLedgerAndAmount = {
        ledger: charge_impacted_ledger.ledger_id,
        ledger_code: charge_impacted_ledger.ledger_code,
        amount: parseFloat(
          (
            tax.tax *
            (parseFloat(charge_impacted_ledger.allocation || '100') / 100)
          ).toFixed(2),
        ),
        tax_name: tax.tax_name,
      };

      debitLedgers.push(chargeLedgerAndAmount);
      creditLedgers.push(...taxLedgerAndAmount);
    });

    return [
      {
        chargeApplicableTaxDebitLedgers: debitLedgers,
        chargeApplicableTaxCreditLedgers: creditLedgers,
      },
    ];
  }

  async calculateChargeEntries(
    chargeId: string,
    amount: number,
    currencyCode: string,
    token: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    debitAccountNo?: string,
  ): Promise<any> {
    if (!chargeId || !amount) {
      throw new BadRequestException('chargeId and amount are required');
    }

    const { data: chargeData } = await this.getChargeByChargeId(
      chargeId,
      token,
    );

    if (!chargeData) {
      throw new Error('Charge not found');
    }

    if (currencyCode !== chargeData.currency) {
      throw new BadRequestException(
        'Currency code of charge does not match with debit account currency code',
      );
    }

    this.checkNullValues(chargeData);

    if (isNaN(amount)) {
      throw new BadRequestException('Invalid transaction amount');
    }

    let concessionGroup: ConcessionGroup | null = null;

    if (debitAccountNo) {
      const customerData: CustomerSearchResponse =
        await this.customerManagementService.searchCustomerByAccountNumber(
          token,
          debitAccountNo,
        );

      if (!customerData) {
        throw new NotFoundException(
          `Debit Account No ${debitAccountNo} Customer Data not found.`,
        );
      }

      const customerId =
        customerData?.data?.customers[0]?.customer_profiles[0]?.customerNumber;

      const concessionGroups =
        await this.concessionGroupService.getConcessionGroupsByChargeId(
          chargeId,
          token,
          customerId,
        );

      concessionGroup = concessionGroups.find((group) =>
        group.configuration.find((item) => item.chargeId === chargeId),
      );
    }

    const concessionConfigurationItem = concessionGroup?.configuration?.find(
      (item) => item.chargeId === chargeId,
    );
    let chargeObj: ChargeObject;

    const firstChargeValue = chargeData.charge_value[0];

    switch (firstChargeValue.charge_type.toLowerCase()) {
      case ChargeTypeEnum.FIXED_CHARGE.toLowerCase(): {
        let charge = 0;
        const intervalValue = parseFloat(
          firstChargeValue.charge_interval_value || '0',
        );

        if (
          firstChargeValue.charge_amount_type ===
          ChargesAndTaxesAmountTypeEnum.CURRENCY
        ) {
          if (firstChargeValue.charge_interval && amount >= intervalValue) {
            charge =
              parseFloat(
                concessionConfigurationItem?.concessionValue ||
                  firstChargeValue.charge_amount,
              ) * Math.floor(amount / intervalValue);
          } else if (!firstChargeValue.charge_interval) {
            charge = parseFloat(
              concessionConfigurationItem?.concessionValue ||
                firstChargeValue.charge_amount,
            );
          }
        } else if (
          firstChargeValue.charge_amount_type ===
          ChargesAndTaxesAmountTypeEnum.PERCENT
        ) {
          if (firstChargeValue.charge_interval && amount >= intervalValue) {
            charge =
              amount *
              (parseFloat(
                concessionConfigurationItem?.concessionValue ||
                  firstChargeValue.charge_amount,
              ) /
                100) *
              Math.floor(amount / intervalValue);
          } else if (!firstChargeValue.charge_interval) {
            charge =
              amount *
              (parseFloat(
                concessionConfigurationItem?.concessionValue ||
                  firstChargeValue.charge_amount,
              ) /
                100);
          }
        }

        chargeObj = {
          charge_name: chargeData.name,
          charge: parseFloat(charge.toFixed(2)),
          charge_impacted_ledger: chargeData.charge_impacted_ledgers[0],
          charge_applicable_tax: chargeData.charge_applicable_tax || [],
          code: chargeData.code,
          charge_value: chargeData.charge_value,
        };
        break;
      }
      case ChargeTypeEnum.VARIABLE_CHARGE.toLowerCase(): {
        const concessionRanges =
          concessionConfigurationItem?.transactionValueRanges;

        const charges = await Promise.all(
          chargeData.charge_value.map(async (charge) => {
            const minValue = parseFloat(
              charge.minimum_transaction_value || '0',
            );
            const maxValue = parseFloat(
              charge.maximum_transaction_value || 'Infinity',
            );
            const intervalValue = parseFloat(
              charge.charge_interval_value || '0',
            );

            let chargeAmount: number;
            if (
              Array.isArray(concessionRanges) &&
              concessionRanges.length > 0
            ) {
              const matchingRange = concessionRanges.find(
                (r) => Number(r.min) === minValue && Number(r.max) === maxValue,
              );
              if (matchingRange != null) {
                chargeAmount = parseFloat(
                  matchingRange.concessionValue.toString(),
                );
              } else {
                chargeAmount = parseFloat(charge.charge_amount);
              }
            } else {
              chargeAmount = parseFloat(charge.charge_amount);
            }

            if (
              charge.charge_amount_type ===
              ChargesAndTaxesAmountTypeEnum.CURRENCY
            ) {
              if (amount >= minValue && amount <= maxValue) {
                if (charge.charge_interval && amount >= intervalValue) {
                  return chargeAmount * Math.floor(amount / intervalValue);
                } else if (!charge.charge_interval) {
                  return chargeAmount;
                }
              }
            } else if (
              charge.charge_amount_type ===
              ChargesAndTaxesAmountTypeEnum.PERCENT
            ) {
              if (amount >= minValue && amount <= maxValue) {
                if (charge.charge_interval && amount >= intervalValue) {
                  return (
                    amount *
                    (chargeAmount / 100) *
                    Math.floor(amount / intervalValue)
                  );
                } else if (!charge.charge_interval) {
                  return amount * (chargeAmount / 100);
                }
              }
            }
            return 0;
          }),
        );

        const totalCharge = charges.reduce((sum, val) => sum + val, 0);
        if (totalCharge === 0) {
          return null;
        }

        chargeObj = {
          charge_name: chargeData.name,
          charge: parseFloat(totalCharge.toFixed(2)),
          charge_impacted_ledger: chargeData.charge_impacted_ledgers[0],
          charge_applicable_tax: chargeData.charge_applicable_tax || [],
          code: chargeData.code,
          charge_value: chargeData.charge_value,
        };
        break;
      }
      case ChargeTypeEnum.COMPARE_CHARGE.toLowerCase(): {
        const {
          compare_charge_percentage_value,
          compare_charge_currency_value,
          compare_charge_parameter,
        } = firstChargeValue;

        const concessionPercentageCompareValue =
          concessionConfigurationItem?.concessionPercentageCompareValue;
        const concessionCurrencyCompareValue =
          concessionConfigurationItem?.concessionCurrencyCompareValue;

        const percentageValue = parseFloat(
          concessionPercentageCompareValue ||
            compare_charge_percentage_value ||
            '0',
        );
        const currencyValue = parseFloat(
          concessionCurrencyCompareValue ||
            compare_charge_currency_value ||
            '0',
        );
        const comparePercentage = (percentageValue / 100) * amount;
        let charge = 0;

        switch (compare_charge_parameter.toLowerCase()) {
          case CompareChargeParameterEnum.SMALLEST_OF.toLowerCase():
            charge = Math.min(comparePercentage, currencyValue);
            break;
          case CompareChargeParameterEnum.LARGEST_OF.toLowerCase():
            charge = Math.max(comparePercentage, currencyValue);
            break;
          case CompareChargeParameterEnum.AVERAGE_OF.toLowerCase():
            charge = (comparePercentage + currencyValue) / 2;
            break;
          case CompareChargeParameterEnum.SUM_OF.toLowerCase():
            charge = comparePercentage + currencyValue;
            break;
          default:
            charge = 0;
        }

        chargeObj = {
          charge_name: chargeData.name,
          charge: parseFloat(charge.toFixed(2)),
          charge_impacted_ledger: chargeData.charge_impacted_ledgers[0],
          charge_applicable_tax: chargeData.charge_applicable_tax || [],
          code: chargeData.code,
          charge_value: chargeData.charge_value,
        };
        break;
      }
    }

    if (chargeObj?.charge_applicable_tax?.length) {
      const chargeApplicableTaxLedgerEntries =
        await this.getChargeApplicableTaxLedgerEntries(chargeObj, token);
      chargeObj.chargeApplicableTaxLedgerEntries =
        chargeApplicableTaxLedgerEntries;
    }

    return chargeObj;
  }

  async getTaxByTaxId(taxId: string, token: string) {
    const url = `${this.productManagementBaseUrl}/v1/tax/${taxId}`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: token,
      },
    });

    return data;
  }

  private async calculateTaxAmount(
    tax: TaxData['tax_values'][0],
    taxAmountType: ChargesAndTaxesAmountTypeEnum,
    min: number,
    max: number,
    interval: boolean,
    intervalValue: number,
    amount: number,
  ): Promise<number> {
    const taxAmount = parseFloat(tax.tax_amount);

    if (isNaN(taxAmount) || isNaN(amount)) {
      throw new BadRequestException(
        'Invalid numeric values provided for Tax Amount or Amount',
      );
    }

    if (
      taxAmountType.toLowerCase() ===
        ChargesAndTaxesAmountTypeEnum.CURRENCY.toLowerCase() &&
      min <= amount &&
      amount <= max
    ) {
      return interval
        ? taxAmount * Math.floor(amount / intervalValue)
        : taxAmount;
    }

    if (
      taxAmountType.toLowerCase() ===
        ChargesAndTaxesAmountTypeEnum.PERCENT.toLowerCase() &&
      min <= amount &&
      amount <= max
    ) {
      const percentage = taxAmount / 100;
      return interval
        ? amount * percentage * Math.floor(amount / intervalValue)
        : amount * percentage;
    }

    return 0;
  }

  async calculateTaxEntries(
    taxId: string,
    amount: number,
    token: string,
  ): Promise<TaxEntry | null> {
    if (isNaN(amount)) {
      throw new BadRequestException('Invalid Amount for Tax calculation');
    }

    const { data }: { data: TaxData } = await this.getTaxByTaxId(taxId, token);

    if (!data) {
      throw new BadRequestException('Tax data not provided');
    }

    const firstTaxValue = data.tax_values[0];
    if (!firstTaxValue?.tax_type) {
      return null;
    }

    try {
      switch (firstTaxValue.tax_type.toLowerCase()) {
        case TaxTypeEnum.FIXED_TAX.toLowerCase(): {
          const tax = await this.calculateTaxAmount(
            firstTaxValue,
            firstTaxValue.tax_amount_type,
            0,
            Infinity,
            firstTaxValue.tax_interval,
            parseFloat(firstTaxValue.tax_interval_value || '0'),
            amount,
          );

          return {
            tax_name: data.name,
            tax: parseFloat(tax.toFixed(2)),
            tax_impacted_ledgers: data.tax_impacted_ledgers[0],
          };
        }
        case TaxTypeEnum.VARIABLE_TAX.toLowerCase(): {
          const taxes = await Promise.all(
            data.tax_values.map((tax) =>
              this.calculateTaxAmount(
                tax,
                tax.tax_amount_type,
                parseFloat(tax.minimum_transaction_value || '0'),
                parseFloat(tax.maximum_transaction_value || 'Infinity'),
                tax.tax_interval,
                parseFloat(tax.tax_interval_value || '0'),
                amount,
              ),
            ),
          );

          const totalTax = taxes.reduce((sum, tax) => sum + tax, 0);

          if (totalTax === 0) {
            return null;
          }

          return {
            tax_name: data.name,
            tax: parseFloat(totalTax.toFixed(2)),
            tax_impacted_ledgers: data.tax_impacted_ledgers[0],
          };
        }
        case TaxTypeEnum.COMPARE_TAX.toLowerCase(): {
          const {
            compare_tax_percentage_value,
            compare_tax_currency_value,
            compare_tax_parameter,
          } = firstTaxValue;

          const percentageValue = parseFloat(
            compare_tax_percentage_value || '0',
          );
          const currencyValue = parseFloat(compare_tax_currency_value || '0');
          const comparePercentage = (percentageValue / 100) * amount;

          let tax = 0;
          switch (compare_tax_parameter.toLowerCase()) {
            case CompareTaxParameterEnum.SMALLEST_OF.toLowerCase():
              tax = Math.min(comparePercentage, currencyValue);
              break;
            case CompareTaxParameterEnum.LARGEST_OF.toLowerCase():
              tax = Math.max(comparePercentage, currencyValue);
              break;
            case CompareTaxParameterEnum.AVERAGE_OF.toLowerCase():
              tax = (comparePercentage + currencyValue) / 2;
              break;
            case CompareTaxParameterEnum.SUM_OF.toLowerCase():
              tax = comparePercentage + currencyValue;
              break;
            default:
              throw new BadRequestException('Invalid compare tax parameter');
          }

          return {
            tax_name: data.name,
            tax: parseFloat(tax.toFixed(2)),
            tax_impacted_ledgers: data.tax_impacted_ledgers[0],
          };
        }

        default:
          return null;
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Tax calculation failed: ${errorMessage}`,
      );
    }
  }
}
