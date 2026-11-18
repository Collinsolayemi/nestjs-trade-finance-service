import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TradeJournalPostingRepository } from './trade-journal-posting.repository';
import { isEmpty } from 'lodash';
import {
  AccountAccessRestrictionTypeEnum,
  AccountCategoryEnum,
  AccountCategoryTitleEnum,
  ApprovalStatusEnum,
  AuthorizationStatusEnum,
  FreezeCodeEnum,
  IANATimeZoneDatabaseEnum,
  PermissionEnum,
  RequestStatusEnum,
  TradeJournalPostingReversalStatusEnum,
  TransactionSubSourceEnum,
} from 'src/common/enums';
import {
  AccountEnquiry,
  AccountRestriction,
  CreditEntry,
  DebitEntry,
} from 'src/common/interfaces';
import { CamsService } from 'src/services/cams/cams.service';
import { UserDetails } from 'src/common/types';
import { FiscalPeriodService } from 'src/services/fiscal-period/fiscal-period.service';
import {
  TradeJournalPosting,
  TradeJournalPosting as TradeJournalPostingModel,
} from './models/trade-journal-posting.model';
import { InitiateTradeJournalPostingDto } from './dto/initiate-trade-journal-posting.dto';
import { AuthorizeActionDto } from 'src/common/dto/authorize-action.dto';
import { ProductManagementService } from 'src/services/product-management/product-management.service';
import { HelperService } from 'src/helpers/helper.service';
import * as moment from 'moment-timezone';
import { Op } from 'sequelize';
import { GetRecordsDto } from 'src/common/dto/get-records.dto';
import { GetTradeJournalPostingResponse } from './interfaces/get-trade-journal-posting-records';
import createJournalPostingRequestBody from 'src/common/utils/create-journal-posting-request-body.util';

@Injectable()
export class TradeJournalPostingService {
  constructor(
    private readonly tradeJournalPostingRepository: TradeJournalPostingRepository,
    private readonly camsService: CamsService,
    private readonly fiscalPeriodService: FiscalPeriodService,
    private readonly productManagementService: ProductManagementService,
    private readonly helperService: HelperService,
  ) {}

  private checkCurrencyMatch(
    accountCurrencyCode: string,
    currencyCode: string,
  ) {
    if (accountCurrencyCode !== currencyCode) {
      throw new BadRequestException(
        'Account Currency does not match the selected currency code for this transaction',
      );
    }
  }

  private checkFreezeCode(accountFreezeCode: string, isDebit: boolean) {
    if (isDebit && accountFreezeCode === FreezeCodeEnum.DEBIT_FREEZE) {
      throw new BadRequestException('Debit Account has a post no debit flag');
    } else if (!isDebit && accountFreezeCode === FreezeCodeEnum.CREDIT_FREEZE) {
      throw new BadRequestException('Credit Account has a post no credit flag');
    }
  }

  private getAccountType(accountCategory: number) {
    const accountTypeMap = {
      [AccountCategoryEnum.INTERNAL]: AccountCategoryTitleEnum.INTERNAL,
      [AccountCategoryEnum.CASA]: AccountCategoryTitleEnum.CASA,
      [AccountCategoryEnum.TILL]: AccountCategoryTitleEnum.TILL,
      [AccountCategoryEnum.VAULT]: AccountCategoryTitleEnum.VAULT,
      [AccountCategoryEnum.MASTER_TILL]: AccountCategoryTitleEnum.MASTER_TILL,
    };
    return accountTypeMap[accountCategory] || null;
  }

  private checkPermissionsForAccountType(
    accountType: AccountCategoryTitleEnum,
    accountAvailabilityToAllbranches: boolean,
    accountBranchCode: string,
    userBranchCode: string,
    userPermissions: string[],
  ) {
    const hasInterbranchPermission = userPermissions.includes(
      PermissionEnum.INITIATE_INTERBRANCH_TRADE_POSTING,
    );
    const hasInternalPermission = userPermissions.includes(
      PermissionEnum.INITIATE_TRADE_JOURNAL_POSTING_TRANSACTION_ON_INTERNAL_LEDGERS,
    );
    const hasCasaPermission = userPermissions.includes(
      PermissionEnum.INITIATE_TRADE_JOURNAL_POSTING_TRANSACTION_ON_CASA_ACCOUNTS,
    );
    const hasCasaInternalPermission = userPermissions.includes(
      PermissionEnum.INITIATE_TRADE_JOURNAL_POSTING_TRANSACTIONS_BETWEEN_CASA_AND_INTERNAL_ACCOUNTS,
    );

    const internalTypes = [
      AccountCategoryTitleEnum.INTERNAL,
      AccountCategoryTitleEnum.TILL,
      AccountCategoryTitleEnum.VAULT,
      AccountCategoryTitleEnum.MASTER_TILL,
    ];

    if (internalTypes.includes(accountType)) {
      if (
        !hasInternalPermission &&
        !hasInterbranchPermission &&
        !hasCasaInternalPermission
      ) {
        throw new BadRequestException(
          `User does not have permission to post to ${accountType} Accounts`,
        );
      }
      if (
        !accountAvailabilityToAllbranches &&
        accountBranchCode !== userBranchCode &&
        !hasInterbranchPermission
      ) {
        throw new BadRequestException(
          `Please input a ${accountType} Account available to all branches or your branch specific ${accountType.toLowerCase()} account`,
        );
      }
    } else if (accountType === AccountCategoryTitleEnum.CASA) {
      if (!hasCasaPermission && !hasCasaInternalPermission) {
        throw new BadRequestException(
          'User does not have permission to post to CASA Accounts',
        );
      }
    } else {
      throw new BadRequestException('Invalid account type');
    }
  }

  private async checkAccountRestrictions(
    token: string,
    accountNumber: string,
    userId?: string,
    userBranchCode?: string,
    userDepartment?: string,
    userChannels?: string,
    userSystem?: string,
  ) {
    const { value: accountRestrictions }: { value: AccountRestriction[] } =
      await this.camsService.getAccountRestrictions(accountNumber, token);

    if (isEmpty(accountRestrictions) || accountRestrictions === null) {
      throw new BadRequestException(
        'Account is flagged as restricted in the system but no restriction details found for the same account.',
      );
    }

    let isRestricted = true;

    accountRestrictions.some(({ accessType, accessValuesList }) => {
      /**
       * @TBR clarify what channels and system mean in Account Access Restrictions
       */
      return accessValuesList.some(({ name, id }) => {
        if (
          (accessType === AccountAccessRestrictionTypeEnum.INDIVIDUAL &&
            id === userId) ||
          (accessType === AccountAccessRestrictionTypeEnum.BRANCH &&
            id === userBranchCode) ||
          (accessType === AccountAccessRestrictionTypeEnum.DEPARTMENT &&
            name.toLowerCase() === (userDepartment ?? '').toLowerCase()) ||
          (accessType === AccountAccessRestrictionTypeEnum.CHANNELS &&
            name.toLowerCase() === (userChannels ?? '').toLowerCase()) ||
          (accessType === AccountAccessRestrictionTypeEnum.SYSTEM &&
            name.toLowerCase() === (userSystem ?? '').toLowerCase())
        ) {
          isRestricted = false;
          return true;
        }
        return false;
      });
    });

    if (isRestricted) {
      throw new BadRequestException(
        'Account is flagged as restricted in the system.',
      );
    }
  }

  async validateValueDate(valueDate: Date, token: string) {
    const formattedDate = moment(valueDate)
      .tz(IANATimeZoneDatabaseEnum.LAGOS)
      .format('YYYY-MM-DD');
    const response = await this.fiscalPeriodService.dateInfo(
      formattedDate,
      token,
    );
    return response?.is_within_current_fiscal;
  }

  private validateAccountNumbers(
    debitAccountNumber: string,
    creditAccountNumber: string,
  ) {
    if (debitAccountNumber === creditAccountNumber) {
      return {
        isValid: false,
        reason: 'Debit and Credit Account Numbers cannot be the same',
      };
    }
    return { isValid: true };
  }

  private validateAccountExistence(
    accountDetails: AccountEnquiry,
    accountType: string,
  ) {
    if (!accountDetails) {
      return {
        isValid: false,
        reason: `${accountType} Account does not exist`,
      };
    }
    return { isValid: true };
  }

  private isInternal(category: AccountCategoryEnum): boolean {
    return [
      AccountCategoryEnum.INTERNAL,
      AccountCategoryEnum.TILL,
      AccountCategoryEnum.VAULT,
      AccountCategoryEnum.MASTER_TILL,
    ].includes(category);
  }

  private validatePermissionsForAccounts(
    userPermissions: string[],
    debitAccountCategory: number,
    creditAccountCategory: number,
  ) {
    const hasInterbranch =
      userPermissions.includes(
        PermissionEnum.INITIATE_INTERBRANCH_TRADE_POSTING,
      ) ||
      userPermissions.includes(
        PermissionEnum.APPROVE_INTERBRANCH_TRADE_POSTING,
      );
    const hasInternal =
      userPermissions.includes(
        PermissionEnum.INITIATE_TRADE_JOURNAL_POSTING_TRANSACTION_ON_INTERNAL_LEDGERS,
      ) ||
      userPermissions.includes(
        PermissionEnum.APPROVE_TRADE_JOURNAL_POSTING_TRANSACTION_ON_INTERNAL_LEDGERS,
      );
    const hasCasa =
      userPermissions.includes(
        PermissionEnum.INITIATE_TRADE_JOURNAL_POSTING_TRANSACTION_ON_CASA_ACCOUNTS,
      ) ||
      userPermissions.includes(
        PermissionEnum.APPROVE_TRADE_JOURNAL_POSTING_TRANSACTION_ON_CASA_ACCOUNTS,
      );
    const hasCasaInternal =
      userPermissions.includes(
        PermissionEnum.INITIATE_TRADE_JOURNAL_POSTING_TRANSACTIONS_BETWEEN_CASA_AND_INTERNAL_ACCOUNTS,
      ) ||
      userPermissions.includes(
        PermissionEnum.APPROVE_TRADE_JOURNAL_POSTING_TRANSACTIONS_BETWEEN_CASA_AND_INTERNAL_ACCOUNTS,
      );

    const isDebitInternal = this.isInternal(debitAccountCategory);
    const isCreditInternal = this.isInternal(creditAccountCategory);
    const isDebitCasa = debitAccountCategory === AccountCategoryEnum.CASA;
    const isCreditCasa = creditAccountCategory === AccountCategoryEnum.CASA;

    if (!hasInterbranch) {
      if (hasInternal && !hasCasa && !hasCasaInternal) {
        if (!isDebitInternal) {
          return {
            isValid: false,
            reason:
              'Debit Account is not an Internal Account and User lacks CASA permissions',
          };
        }
        if (!isCreditInternal) {
          return {
            isValid: false,
            reason:
              'Credit Account is not an Internal Account and User lacks CASA permissions',
          };
        }
      } else if (!hasInternal && hasCasa && !hasCasaInternal) {
        if (!isDebitCasa) {
          return {
            isValid: false,
            reason:
              'Debit Account is not a CASA Account and User lacks Internal permissions',
          };
        }
        if (!isCreditCasa) {
          return {
            isValid: false,
            reason:
              'Credit Account is not a CASA Account and User lacks Internal permissions',
          };
        }
      } else if (hasInternal && hasCasa && !hasCasaInternal) {
        if (
          (isDebitInternal && isCreditCasa) ||
          (isDebitCasa && isCreditInternal)
        ) {
          return {
            isValid: false,
            reason:
              'User lacks permission for transactions between Internal and CASA Accounts',
          };
        }
      } else if (hasCasaInternal && !hasInternal && !hasCasa) {
        if (
          (isDebitInternal && isCreditInternal) ||
          (isDebitCasa && isCreditCasa)
        ) {
          return {
            isValid: false,
            reason:
              'User only has permission for transactions between Internal and CASA Accounts',
          };
        }
      }
    }

    return { isValid: true };
  }

  private validateBranchAvailability(
    debitAccountDetails: AccountEnquiry,
    creditAccountDetails: AccountEnquiry,
    userBranchCode: string,
    userPermissions: string[],
  ) {
    const hasInterbranch =
      userPermissions.includes(
        PermissionEnum.INITIATE_INTERBRANCH_TRADE_POSTING,
      ) ||
      userPermissions.includes(
        PermissionEnum.APPROVE_INTERBRANCH_TRADE_POSTING,
      );

    if (!hasInterbranch) {
      if (
        this.isInternal(debitAccountDetails?.accountCategory) &&
        !debitAccountDetails?.availableToAllBranches &&
        debitAccountDetails?.branchCode !== userBranchCode
      ) {
        return {
          isValid: false,
          reason: 'Debit Account is not available to this branch',
        };
      }
      if (
        this.isInternal(creditAccountDetails?.accountCategory) &&
        !creditAccountDetails?.availableToAllBranches &&
        creditAccountDetails?.branchCode !== userBranchCode
      ) {
        return {
          isValid: false,
          reason: 'Credit Account is not available to this branch',
        };
      }
    }
    return { isValid: true };
  }

  private validateCurrencies(
    debitAccountCurrencyCode: string,
    creditAccountCurrencyCode: string,
    debitInputCurrencyCode: string,
    creditInputCurrencyCode: string,
    isSameCurrency: boolean,
  ) {
    if (debitAccountCurrencyCode !== debitInputCurrencyCode) {
      return {
        isValid: false,
        reason:
          'Debit Account currency code does not match the selected currency code',
      };
    }
    if (creditAccountCurrencyCode !== creditInputCurrencyCode) {
      return {
        isValid: false,
        reason:
          'Credit Account currency code does not match the selected currency code',
      };
    }
    if (
      isSameCurrency &&
      debitAccountCurrencyCode !== creditAccountCurrencyCode
    ) {
      return {
        isValid: false,
        reason:
          'Debit and Credit Accounts must be in the same currency for same-currency posting',
      };
    }
    if (
      !isSameCurrency &&
      debitAccountCurrencyCode === creditAccountCurrencyCode
    ) {
      return {
        isValid: false,
        reason:
          'Debit and Credit Accounts must differ in currency for cross-currency posting',
      };
    }
    return { isValid: true };
  }

  private validateAccountConstraints(
    debitAccountDetails: AccountEnquiry,
    creditAccountDetails: AccountEnquiry,
    transactionAmount: number,
  ) {
    const debitAccountCategory = debitAccountDetails.accountCategory;
    const creditAccountCategory = creditAccountDetails.accountCategory;

    if (this.isInternal(debitAccountCategory)) {
      if (debitAccountDetails.freezeCode === FreezeCodeEnum.DEBIT_FREEZE) {
        return {
          isValid: false,
          reason: 'Debit Account has a post no debit flag',
        };
      }
      if (debitAccountDetails.isSystemEntryOnly) {
        return {
          isValid: false,
          reason: 'Debit Account is a System Entry Only Account',
        };
      }
      if (debitAccountDetails.isProductLedger) {
        return {
          isValid: false,
          reason: 'Debit Account is a Product Ledger Account',
        };
      }
    } else if (debitAccountCategory === AccountCategoryEnum.CASA) {
      if (![1, 4].includes(debitAccountDetails.accountStatus)) {
        return {
          isValid: false,
          reason:
            'Debit Customer Account is not in active or interim closure state',
        };
      }
      if (debitAccountDetails.availableBalance < transactionAmount) {
        return {
          isValid: false,
          reason: 'Debit Customer Account does not have sufficient balance',
        };
      }
    }

    if (this.isInternal(creditAccountCategory)) {
      if (creditAccountDetails.freezeCode === FreezeCodeEnum.CREDIT_FREEZE) {
        return {
          isValid: false,
          reason: 'Credit Account has a post no credit flag',
        };
      }
      if (creditAccountDetails.isSystemEntryOnly) {
        return {
          isValid: false,
          reason: 'Credit Account is a System Entry Only Account',
        };
      }
      if (creditAccountDetails.isProductLedger) {
        return {
          isValid: false,
          reason: 'Credit Account is a Product Ledger Account',
        };
      }
    }

    return { isValid: true };
  }

  async validateAccountAccess(
    user: UserDetails,
    currencyCode: string,
    isDebit: boolean,
    accountNumber: string,
  ) {
    const { token, id, branch, department, channels, system, userPermissions } =
      user;

    const accountDetails = (await this.camsService.getAccountDetails(
      accountNumber,
      token,
    )) as AccountEnquiry;

    if (!accountDetails) {
      throw new NotFoundException(
        'No applicable account found for transaction.',
      );
    }

    if (accountDetails?.isRestricted) {
      await this.checkAccountRestrictions(
        token,
        accountNumber,
        id,
        branch,
        department,
        channels,
        system,
      );
    }

    this.checkCurrencyMatch(accountDetails?.currencyCode, currencyCode);

    const accountType = this.getAccountType(accountDetails?.accountCategory);
    if (!accountType) {
      throw new BadRequestException(
        'No applicable account found for transaction.',
      );
    }

    this.checkPermissionsForAccountType(
      accountType,
      accountDetails?.availableToAllBranches,
      accountDetails?.branchCode,
      branch,
      userPermissions,
    );
    this.checkFreezeCode(accountDetails?.freezeCode, isDebit);

    if (accountDetails?.isSystemEntryOnly) {
      throw new BadRequestException('Account is a System Entry Only Account');
    }
    if (accountDetails?.isProductLedger) {
      throw new BadRequestException('Account is a Product Ledger Account');
    }

    return accountDetails;
  }

  async validateSingleEntryPosting(
    user: UserDetails,
    transactionAmount: number,
    debitAccountNumber: string,
    debitInputCurrencyCode: string,
    creditAccountNumber: string,
    creditInputCurrencyCode: string,
    isSameCurrency: boolean,
    valueDate: Date,
  ) {
    const { token, branch, userPermissions } = user;

    let result = this.validateAccountNumbers(
      debitAccountNumber,
      creditAccountNumber,
    );
    if (!result.isValid) return result;

    const [debitAccountDetails, creditAccountDetails]: [
      AccountEnquiry,
      AccountEnquiry,
    ] = await Promise.all([
      this.camsService.getAccountDetails(debitAccountNumber, token),
      this.camsService.getAccountDetails(creditAccountNumber, token),
    ]);

    result = this.validateAccountExistence(debitAccountDetails, 'Debit');
    if (!result.isValid) return result;
    result = this.validateAccountExistence(creditAccountDetails, 'Credit');
    if (!result.isValid) return result;

    result = this.validatePermissionsForAccounts(
      userPermissions,
      debitAccountDetails?.accountCategory,
      creditAccountDetails?.accountCategory,
    );
    if (!result.isValid) return result;

    result = this.validateBranchAvailability(
      debitAccountDetails,
      creditAccountDetails,
      branch,
      userPermissions,
    );
    if (!result.isValid) return result;

    result = this.validateCurrencies(
      debitAccountDetails?.currencyCode,
      creditAccountDetails?.currencyCode,
      debitInputCurrencyCode,
      creditInputCurrencyCode,
      isSameCurrency,
    );
    if (!result.isValid) return result;

    result = this.validateAccountConstraints(
      debitAccountDetails,
      creditAccountDetails,
      transactionAmount,
    );
    if (!result.isValid) return result;

    if (valueDate) {
      const isValidDate = await this.validateValueDate(valueDate, token);
      if (!isValidDate) {
        return {
          isValid: false,
          reason: 'Value Date is not within the current fiscal period',
        };
      }
    }

    return { isValid: true };
  }

  async initiate(data: InitiateTradeJournalPostingDto) {
    const { token, userPermissions, ...filterData } = data;

    const existingTradeJournalPostingRequest =
      await this.tradeJournalPostingRepository.findOne({
        where: { referenceId: data?.referenceId },
      });

    if (existingTradeJournalPostingRequest && !data?.isDraft) {
      throw new BadRequestException(
        'Trade Journal Posting Request with the same reference ID already exists',
      );
    }

    if (!existingTradeJournalPostingRequest && data?.isDraft) {
      throw new BadRequestException(
        'Trade Journal Posting Request is marked as draft but no existing matching record with the same reference ID exists.',
      );
    }

    let savedTradeJournalPostingRequest: TradeJournalPostingModel;

    if (data?.isDraft) {
      [, [savedTradeJournalPostingRequest]] =
        await this.tradeJournalPostingRepository.update(
          {
            ...filterData,
          },
          {
            where: {
              referenceId: data?.referenceId,
            },
            returning: true,
          },
        );
    } else {
      savedTradeJournalPostingRequest =
        await this.tradeJournalPostingRepository.create(filterData);
    }

    if (userPermissions.includes('')) {
      const journalPostingResponse =
        await this.handleTradeJournalPostingApproval(
          token,
          filterData?.initiatorId,
          savedTradeJournalPostingRequest,
          { valueDate: data?.valueDate },
        );

      await this.tradeJournalPostingRepository.update(
        {
          approverId: data?.initiatorId,
          approver: data?.approver,
          approverBranchCode: data?.approverBranchCode,
          approvalStatus: ApprovalStatusEnum.APPROVED,
          requestStatus: RequestStatusEnum.APPROVED,
          postingDate: moment().tz(IANATimeZoneDatabaseEnum.LAGOS).toDate(),
          transactionId: journalPostingResponse?.value?.transactionId,
        },
        { where: { referenceId: data?.referenceId }, returning: true },
      );
    }

    return savedTradeJournalPostingRequest;
  }

  private async handleTradeJournalPostingApproval(
    token: string,
    userId: string,
    tradeJournalPostingRequest: TradeJournalPostingModel,
    {
      valueDate,
      approvedByBranchCode,
    }: { valueDate?: Date; approvedByBranchCode?: string },
  ): Promise<any> {
    let journalPostingResponse: any;
    let debitEntries: DebitEntry[];
    let creditEntries: CreditEntry[];

    if (tradeJournalPostingRequest.isReversalPosting) {
      const reverseJournalPostingRequestBody = {
        transactionId: tradeJournalPostingRequest?.transactionId,
        modifiedBy: userId,
      };

      journalPostingResponse = await this.camsService.reverseJournalPosting(
        reverseJournalPostingRequestBody,
        token,
      );
    } else {
      if (
        tradeJournalPostingRequest?.isSameCurrency &&
        (tradeJournalPostingRequest?.taxId ||
          tradeJournalPostingRequest?.chargeId)
      ) {
        debitEntries = [
          {
            debitAccountNumber: tradeJournalPostingRequest?.debitAccountNo,
            debitAmount: tradeJournalPostingRequest?.postingAmount,
            debitNarration:
              tradeJournalPostingRequest?.postingNarration ??
              `Debiting ${tradeJournalPostingRequest?.debitAccountNo} with  ${tradeJournalPostingRequest?.debitCurrencyCode}${tradeJournalPostingRequest?.postingAmount} for ${tradeJournalPostingRequest?.creditAccountNo}`,
          },
        ];

        creditEntries = [
          {
            creditAccountNumber: tradeJournalPostingRequest?.creditAccountNo,
            creditAmount: tradeJournalPostingRequest?.postingAmount,
            creditNarration:
              tradeJournalPostingRequest?.postingNarration ??
              `Crediting ${tradeJournalPostingRequest?.creditAccountNo} with ${tradeJournalPostingRequest?.debitCurrencyCode}${tradeJournalPostingRequest?.postingAmount} from ${tradeJournalPostingRequest?.debitAccountNo}`,
          },
        ];

        if (tradeJournalPostingRequest?.taxId) {
          const taxDeductions =
            await this.productManagementService.calculateTaxEntries(
              tradeJournalPostingRequest?.taxId,
              tradeJournalPostingRequest?.postingAmount,
              token,
            );

          if (!taxDeductions) {
            throw new BadRequestException('Invalid tax data');
          }

          const { tax_name, tax, tax_impacted_ledgers } = taxDeductions;

          const ledgerCode = Array.isArray(tax_impacted_ledgers)
            ? tax_impacted_ledgers[0].ledger_code
            : tax_impacted_ledgers.ledger_code;

          debitEntries.push({
            debitAccountNumber: tradeJournalPostingRequest?.debitAccountNo,
            debitAmount: tax,
            debitNarration: `${tradeJournalPostingRequest?.postingNarration} - Debiting account ${tradeJournalPostingRequest?.debitAccountNo} with tax amount ${tradeJournalPostingRequest?.debitCurrencyCode}${tax} for ${tax_name} tax`,
          });

          creditEntries.push({
            creditAccountNumber: ledgerCode,
            creditAmount: tax,
            creditNarration: `${tradeJournalPostingRequest?.postingNarration} - Crediting account ${ledgerCode} with tax amount ${tradeJournalPostingRequest?.debitCurrencyCode}${tax} for ${tax_name} tax`,
          });
        }

        if (tradeJournalPostingRequest?.chargeId) {
          const chargeData =
            await this.productManagementService.calculateChargeEntries(
              tradeJournalPostingRequest?.chargeId,
              tradeJournalPostingRequest?.postingAmount,
              tradeJournalPostingRequest?.debitCurrencyCode,
              token,
            );

          if (!chargeData) {
            throw new BadRequestException('Invalid charge data');
          }

          const { charge_name, charge, charge_impacted_ledger } = chargeData;

          debitEntries.push({
            debitAccountNumber: tradeJournalPostingRequest?.debitAccountNo,
            debitAmount: parseFloat(charge),
            debitNarration: `${tradeJournalPostingRequest?.postingNarration} - Debiting account ${tradeJournalPostingRequest?.debitAccountNo} with charge amount ${tradeJournalPostingRequest?.debitCurrencyCode}${parseFloat(charge)} for ${charge_name}`,
          });

          creditEntries.push({
            creditAccountNumber: charge_impacted_ledger.ledger_code,
            creditAmount: parseFloat(charge),
            creditNarration: `${tradeJournalPostingRequest?.postingNarration} - Crediting account ${charge_impacted_ledger.ledger_code} with charge amount ${tradeJournalPostingRequest?.debitCurrencyCode}${parseFloat(charge)} for ${charge_name}`,
          });
        }
      }
    }

    const journalPostingRequestBody = createJournalPostingRequestBody({
      debitAccount: tradeJournalPostingRequest?.debitAccountNo,
      transactionAmount: tradeJournalPostingRequest?.postingAmount,
      creditAccount: tradeJournalPostingRequest?.creditAccountNo,
      userId,
      branchCode: tradeJournalPostingRequest?.initiatorBranchCode,
      currencyShortCode: tradeJournalPostingRequest?.debitCurrencyCode,
      isCrossCurrency: !tradeJournalPostingRequest.isSameCurrency
        ? true
        : false,
      requestId: tradeJournalPostingRequest?.referenceId,
      creditEntries,
      debitEntries,
      initiatedBy: tradeJournalPostingRequest?.initiatorId,
      approvedByBranchCode,
      narration: tradeJournalPostingRequest?.postingNarration,
      transactionSubSource: TransactionSubSourceEnum.WITHIN_BANK_TRANSFER,
    });

    if (valueDate) {
      const valueDateMoment = moment(valueDate).tz(
        IANATimeZoneDatabaseEnum.LAGOS,
      );
      const now = moment().tz(IANATimeZoneDatabaseEnum.LAGOS);

      if (now.isBefore(valueDateMoment, 'day')) {
        journalPostingRequestBody.isFuture = true;
        journalPostingRequestBody.valueDate = valueDateMoment.toISOString();
      }
    }

    if (!tradeJournalPostingRequest.isSameCurrency) {
      journalPostingRequestBody.exchangeRate =
        tradeJournalPostingRequest?.computationRate;
    }

    if (tradeJournalPostingRequest.daoCode) {
      journalPostingRequestBody.daoCode = tradeJournalPostingRequest?.daoCode;
    }

    if (tradeJournalPostingRequest.canBeCharged) {
      journalPostingRequestBody.waveCharge =
        tradeJournalPostingRequest?.canBeCharged;
    }

    journalPostingResponse = await this.camsService.postToJournal(
      journalPostingRequestBody,
      token,
    );

    const { postingNarration } = tradeJournalPostingRequest || {};

    if (postingNarration) {
      const parts = postingNarration.split(' ');

      if (parts[0] === 'RVSAL' && parts.length > 2) {
        const referenceId = parts[2];

        await this.tradeJournalPostingRepository.update(
          {
            postingReversalStatus:
              TradeJournalPostingReversalStatusEnum.SUCCESSFUL,
          },
          { where: { referenceId }, returning: true },
        );
      }
    }

    return journalPostingResponse;
  }

  async authorize(data: AuthorizeActionDto): Promise<TradeJournalPostingModel> {
    const {
      id,
      approver,
      approverId,
      approverBranchCode,
      approverDepartment,
      token,
      userPermissions,
      approvalStatus,
      reasonForRejection,
    } = data;

    const tradeJournalPostingRequest =
      await this.tradeJournalPostingRepository.findOne({
        where: {
          tradeJournalPostingId: id,
          approvalStatus: ApprovalStatusEnum.PENDING,
        },
      });

    if (!tradeJournalPostingRequest) {
      throw new NotFoundException(
        'No Matching Trade Journal Posting Request found',
      );
    }

    if (
      tradeJournalPostingRequest?.initiatorDepartment !== approverDepartment
    ) {
      throw new BadRequestException(
        `Authorizer's department is not the same as department of the initiator!`,
      );
    }

    const isValid = await this.validateSingleEntryPosting(
      { token, branch: approverBranchCode, userPermissions },
      tradeJournalPostingRequest?.postingAmount,
      tradeJournalPostingRequest?.debitAccountNo,
      tradeJournalPostingRequest?.debitCurrencyCode,
      tradeJournalPostingRequest?.creditAccountNo,
      tradeJournalPostingRequest?.creditCurrencyCode,
      tradeJournalPostingRequest?.isSameCurrency,
      tradeJournalPostingRequest?.valueDate,
    );

    if (!isValid.isValid) {
      throw new BadRequestException(
        'Trade Journal Posting Request is no longer valid.',
      );
    }

    let valueToUpdate: Partial<TradeJournalPostingModel>;

    switch (approvalStatus.toLowerCase()) {
      case ApprovalStatusEnum.APPROVED.toLowerCase():
        valueToUpdate = {
          approvalStatus: ApprovalStatusEnum.APPROVED,
          requestStatus: RequestStatusEnum.APPROVED,
          approverId,
          approver,
          approverBranchCode,
          approverDepartment,
        };
        break;
      case ApprovalStatusEnum.REJECTED.toLowerCase():
        valueToUpdate = {
          approvalStatus: ApprovalStatusEnum.REJECTED,
          requestStatus: RequestStatusEnum.IN_ISSUE,
          approverId,
          approver,
          approverBranchCode,
          approverDepartment,
          reasonForRejection,
        };
        break;
    }

    const whereToUpdate = {
      tradeJournalPostingId: id,
    };

    if (
      approvalStatus.toLowerCase() === ApprovalStatusEnum.APPROVED.toLowerCase()
    ) {
      const journalPostingResponse =
        await this.handleTradeJournalPostingApproval(
          token,
          tradeJournalPostingRequest?.initiatorId,
          tradeJournalPostingRequest,
          {
            valueDate: tradeJournalPostingRequest?.valueDate,
            approvedByBranchCode: approverBranchCode,
          },
        );

      valueToUpdate.postingDate = moment()
        .tz(IANATimeZoneDatabaseEnum.LAGOS)
        .toDate();
      valueToUpdate.transactionId =
        journalPostingResponse?.value?.transactionId;
    }

    const [, [authorizedTradeJournalPostingRequest]] =
      await this.tradeJournalPostingRepository.update(valueToUpdate, {
        where: whereToUpdate,
        returning: true,
      });

    return authorizedTradeJournalPostingRequest;
  }

  async modify(id: string, userId: string): Promise<TradeJournalPostingModel> {
    const tradeJournalPostingRequest =
      await this.tradeJournalPostingRepository.findOne({
        where: { tradeJournalPostingId: id },
      });

    if (
      !tradeJournalPostingRequest ||
      tradeJournalPostingRequest?.requestStatus !== RequestStatusEnum.IN_REVIEW
    ) {
      throw new NotFoundException(
        'No Matching Trade Journal Posting Request found',
      );
    }

    if (
      tradeJournalPostingRequest?.approvalStatus ===
        ApprovalStatusEnum.REJECTED &&
      tradeJournalPostingRequest?.isRerouted === false
    ) {
      throw new NotFoundException(
        'Only REROUTED REJECTED or IN-REVIEW requests can be withdrawn and modified',
      );
    }

    if (tradeJournalPostingRequest.initiatorId !== userId) {
      throw new BadRequestException(
        'You are not permitted to withdraw and modify this request as you are not the initiator',
      );
    }

    const [, [updatedTradeJournalPostingRequest]] =
      await this.tradeJournalPostingRepository.update(
        {
          requestStatus: RequestStatusEnum.DRAFT,
          approvalStatus: null,
        },
        { where: { tradeJournalPostingId: id }, returning: true },
      );

    return updatedTradeJournalPostingRequest;
  }

  async delete(id: string, userId: string): Promise<number> {
    const tradeJournalPostingRequest =
      await this.tradeJournalPostingRepository.findOne({
        where: {
          tradeJournalPostingId: id,
          requestStatus: {
            [Op.or]: [
              RequestStatusEnum.IN_REVIEW,
              RequestStatusEnum.DRAFT,
              RequestStatusEnum.IN_ISSUE,
            ],
          },
        },
      });

    if (!tradeJournalPostingRequest) {
      throw new NotFoundException(
        'No Matching Trade Journal Posting Request found',
      );
    }

    if (tradeJournalPostingRequest.initiatorId !== userId) {
      throw new BadRequestException(
        'You are not permitted to withdraw and delete this request as you are not the initiator',
      );
    }

    const deletedTradeJournalPostingRequestCount =
      await this.tradeJournalPostingRepository.delete({
        where: { tradeJournalPostingId: id },
      });

    return deletedTradeJournalPostingRequestCount;
  }

  async getTradeJournalPostingRecords(
    options: GetRecordsDto,
  ): Promise<GetTradeJournalPostingResponse> {
    const {
      id,
      branch,
      page = 1,
      size = 10,
      startDate,
      endDate,
      requestStatus,
      approvalStatus,
      recordScope = AuthorizationStatusEnum.CREATED_BY_ME,
      isAuthorizer,
    } = options;

    const query: { where: Partial<TradeJournalPosting> } = {
      where: {},
    };

    switch (recordScope) {
      case AuthorizationStatusEnum.CREATED_BY_ME:
      case AuthorizationStatusEnum.INITIATED_BY_ME:
        query.where.initiatorId = id;
        break;
      case AuthorizationStatusEnum.APPROVED_BY_ME:
      case AuthorizationStatusEnum.SENT_TO_ME:
        query.where.approverId = id;
        break;
      case AuthorizationStatusEnum.CREATED_BY_MY_BRANCH:
      case AuthorizationStatusEnum.INITIATED_BY_MY_BRANCH:
        query.where.initiatorBranchCode = branch;
        break;
      case AuthorizationStatusEnum.APPROVED_BY_MY_BRANCH:
      case AuthorizationStatusEnum.SENT_TO_MY_BRANCH:
        query.where.approverBranchCode = branch;
        break;
      case AuthorizationStatusEnum.CREATED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.INITIATED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.APPROVED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.SENT_SYSTEM_WIDE:
        break;
      default:
        throw new BadRequestException('Invalid Authorization Status');
    }

    if (isAuthorizer === 'true' && approvalStatus) {
      query.where.approvalStatus = approvalStatus;
    } else if (requestStatus) {
      query.where.requestStatus = requestStatus;
    }

    if (startDate && endDate) {
      query.where.createdAt = {
        [Op.between]: [
          moment
            .tz(startDate, IANATimeZoneDatabaseEnum.LAGOS)
            .startOf('day')
            .toISOString(),
          moment
            .tz(endDate, IANATimeZoneDatabaseEnum.LAGOS)
            .endOf('day')
            .toISOString(),
        ],
      };
    } else if (startDate) {
      query.where.createdAt = {
        [Op.gte]: moment
          .tz(startDate, IANATimeZoneDatabaseEnum.LAGOS)
          .startOf('day')
          .toISOString(),
      };
    } else if (endDate) {
      query.where.createdAt = {
        [Op.lte]: moment
          .tz(endDate, IANATimeZoneDatabaseEnum.LAGOS)
          .endOf('day')
          .toISOString(),
      };
    }

    const { count: totalRecords, rows: tradeJournalPostingRecords } =
      await this.tradeJournalPostingRepository.findAndCountAll({
        ...query,
        offset: (page - 1) * size,
        limit: size,
        order: [['createdAt', 'DESC']],
      });

    const totalPages = Math.ceil(totalRecords / size);

    return {
      page,
      totalPages,
      totalRecords,
      size,
      tradeJournalPostingRecords,
    };
  }
}
