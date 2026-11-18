import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import {
  ApprovalStatusEnum,
  AuthorizationStatusEnum,
  CurrencyCodeEnum,
  CustomerManagementIdTypeEnum,
  RegulatoryFormStatusEnum,
  RegulatoryFormMValidationCheckEnum,
  GetAllFormMRecordsStatusCountIdentifierEnum,
  GetFormMRecordIdentifierEnum,
  GetFormNCXRecordIdentifierEnum,
  GetFormNXPRecordIdentifierEnum,
  IANATimeZoneDatabaseEnum,
  RecordsStatusTypeEnum,
  LetterOfCreditStatusTypeToColumnMappingEnum,
  ProductFactoryProductTypeEnum,
  RequestStatusEnum,
  StpExceptionResolveTypeEnum,
  StpExceptionTypeEnum,
  TradeGovActionEnum,
  RegulatoryFormTypeEnum,
  TrmsActionEnum,
} from 'src/common/enums';
import * as moment from 'moment-timezone';
import { Op, QueryTypes } from 'sequelize';
import {
  RegulatoryFormChargesAndTaxesRepository,
  FormARepository,
  FormMRepository,
  FormNXPRepository,
  FormNCXRepository,
} from './regulatory-form.repository';
import { GetFormMRecordsResponse } from './interfaces/get-form-m-records';
import { GetFormNCXRecordsResponse } from './interfaces/get-form-ncx-records';
import { GetFormNXPRecordsResponse } from './interfaces/get-form-nxp-records';
import { FormM } from './models/form-m.model';
import { FormA } from './models/form-a.model';
import { FormNCX } from './models/form-ncx.model';
import { FormNXP } from './models/form-nxp.model';
import { GetFormMRecordsDto } from './dto/get-form-m-records.dto';
import { GetFormNCXRecordsDto } from './dto/get-form-ncx-records.dto';
import { GetFormNXPRecordsDto } from './dto/get-form-nxp-records.dto';
import { InjectQueue } from '@nestjs/bullmq';
import {
  TRADE_API_REGULATORY_FORM_CHARGES_QUEUE_NAME,
  TRADE_API_REGULATORY_FORM_VALIDATION_QUEUE_NAME,
  TRADE_API_TRADE_GOV_FORM_M_QUEUE_NAME,
  TRADE_API_TRMS_FORM_A_QUEUE_NAME,
  TRADE_API_TRMS_FORM_NCX_QUEUE_NAME,
  TRADE_API_TRMS_FORM_NXP_QUEUE_NAME,
} from 'src/common/constants';
import { Queue } from 'bullmq';
import { AppRedisService } from 'src/services/redis/redis.service';
import {
  TradeGovSingleWindowResponse,
  TrmsFormNXPApplicationResponse,
  TrmsFormNXPApplication,
  FormMDocument,
  TrmsFormAApplicationResponse,
  TrmsFormAApplication,
  TrmsFormNCXApplicationResponse,
  TrmsFormNCXApplication,
} from 'src/common/interfaces';
import { GetStpExceptionsResponse } from './interfaces/get-stp-exceptions';
import { StpException } from './models/stp-exception.model';
import { StpExceptionRepository } from './stp-exception.repository';
import { ResolveStpExceptionDto } from './dto/resolve-stp-exception.dto';
import { CamsService } from 'src/services/cams/cams.service';
import { CustomerManagementService } from 'src/services/customer-management/customer-management.service';
import { GetFormMRecordDto } from './dto/get-form-m-record.dto';
import { GetFormNCXRecordDto } from './dto/get-form-ncx-record.dto';
import { GetFormNXPRecordDto } from './dto/get-form-nxp-record.dto';
import { AuthorizeActionDto } from 'src/common/dto/authorize-action.dto';
import { StpExceptionRequestRepository } from './stp-exception-request.repository';
import { StpExceptionRequest } from './models/stp-exception-request.model';
import { GetStpExceptionRequestsResponse } from './interfaces/get-stp-exception-requests.dto';
import { Sequelize } from 'sequelize-typescript';
import { AuthService } from 'src/services/auth/auth.service';
import { ComplianceService } from 'src/services/compliance/compliance.service';
import { OnePlugService } from 'src/services/one-plug/one-plug.service';
import { ProductManagementService } from 'src/services/product-management/product-management.service';
import createJournalPostingRequestBody from 'src/common/utils/create-journal-posting-request-body.util';
import { customAlphabet } from 'nanoid';
import { CreateRegulatoryFormChargesAndTaxesDto } from './dto/regulatory-form-charges-and-taxes.dto';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cron } from '@nestjs/schedule';
import { TRMSService } from 'src/services/trms/trms.service';
import { GetStpExceptionsDto } from './dto/get-stp-exceptions.dto';
import { GetStpExceptionRequestsDto } from './dto/get-stp-exception-requests.dto';
import { SafeCron } from 'src/common/decorators/safecron.decorator';

@Injectable()
export class RegulatoryFormService {
  private readonly nanoid = customAlphabet('1234567890abcdef', 10);

  constructor(
    private readonly authService: AuthService,
    private readonly sequelize: Sequelize,
    private readonly camsService: CamsService,
    private readonly customerManagementService: CustomerManagementService,
    private readonly formMRepository: FormMRepository,
    private readonly formNXPRepository: FormNXPRepository,
    private readonly formNCXRepository: FormNCXRepository,
    private readonly formARepository: FormARepository,
    private readonly appRedisService: AppRedisService,
    @Inject(Logger) private readonly loggerService: LoggerService,
    private readonly stpExceptionRepository: StpExceptionRepository,
    private readonly stpExceptionRequestRepository: StpExceptionRequestRepository,
    private readonly complianceService: ComplianceService,
    private readonly onePlugService: OnePlugService,
    private readonly trmsService: TRMSService,
    private readonly productManagementService: ProductManagementService,
    private readonly regulatoryFormChargesAndTaxesRepository: RegulatoryFormChargesAndTaxesRepository,
    @InjectQueue(TRADE_API_TRADE_GOV_FORM_M_QUEUE_NAME)
    private readonly tradeGovFormMQueue: Queue,
    @InjectQueue(TRADE_API_TRMS_FORM_NXP_QUEUE_NAME)
    private readonly trmsFormNXPQueue: Queue,
    @InjectQueue(TRADE_API_TRMS_FORM_NCX_QUEUE_NAME)
    private readonly trmsFormNCXQueue: Queue,
    @InjectQueue(TRADE_API_TRMS_FORM_A_QUEUE_NAME)
    private readonly trmsFormAQueue: Queue,
    @InjectQueue(TRADE_API_REGULATORY_FORM_CHARGES_QUEUE_NAME)
    private readonly formMChargesQueue: Queue,
    @InjectQueue(TRADE_API_REGULATORY_FORM_VALIDATION_QUEUE_NAME)
    private readonly formMValidationQueue: Queue,
  ) {}

  private async generateStpExceptionRequestId(
    stpExceptionRequestType: StpExceptionResolveTypeEnum,
  ): Promise<string> {
    const result = await this.sequelize.query(
      `SELECT nextval('stp_exception_req_seq') AS nextval`,
      { type: QueryTypes.SELECT },
    );

    const prefix =
      stpExceptionRequestType === StpExceptionResolveTypeEnum.EXEMPT
        ? 'EX'
        : 'RE';

    const nextVal = result[0]['nextval'];
    return `${prefix}-${String(nextVal).padEnd(10, '0')}`;
  }

  private getRepository(regulatoryFormType: RegulatoryFormTypeEnum) {
    switch (regulatoryFormType) {
      case RegulatoryFormTypeEnum.FORM_M:
        return this.formMRepository;
      case RegulatoryFormTypeEnum.FORM_NXP:
        return this.formNXPRepository;
      case RegulatoryFormTypeEnum.FORM_NCX:
        return this.formNCXRepository;
      case RegulatoryFormTypeEnum.FORM_A:
        return this.formARepository;
      default:
        throw new BadRequestException(
          `Unsupported regulatory form type: ${regulatoryFormType}`,
        );
    }
  }

  async getRegulatoryFormRecord(
    applicationNumber: string,
    regulatoryFormType: RegulatoryFormTypeEnum,
  ): Promise<FormM | FormNXP | FormNCX | FormA> {
    const baseWhere = { where: { applicationNumber } };

    switch (regulatoryFormType) {
      case RegulatoryFormTypeEnum.FORM_M: {
        const record = await this.formMRepository.findOne({
          ...baseWhere,
          attributes: [
            'formMId',
            'applicationNumber',
            'customerAccount',
            'totalCAndF',
            'applicantTINNumber',
            'currencyCode',
            'status',
            'isCustomerAccountValid',
            'isAccountRestrictionValid',
            'isWatchlistStatusValid',
            'isBalanceEnquiryValid',
            'isChargeTaken',
          ],
        });
        if (!record) {
          throw new NotFoundException(
            `Regulatory form record with application number ${applicationNumber} not found`,
          );
        }
        return record;
      }
      case RegulatoryFormTypeEnum.FORM_NXP: {
        const record = await this.formNXPRepository.findOne({
          ...baseWhere,
          attributes: [
            'formNXPId',
            'applicationNumber',
            'customerAccount',
            'totalCF',
            'tin',
            'currencyCode',
            'status',
            'isCustomerAccountValid',
            'isAccountRestrictionValid',
            'isWatchlistStatusValid',
            'isBalanceEnquiryValid',
            'isChargeTaken',
          ],
        });
        if (!record) {
          throw new NotFoundException(
            `Regulatory form record with application number ${applicationNumber} not found`,
          );
        }
        return record;
      }
      case RegulatoryFormTypeEnum.FORM_NCX: {
        const record = await this.formNCXRepository.findOne({
          ...baseWhere,
          attributes: [
            'formNCXId',
            'applicationNumber',
            'customerAccount',
            'totalCF',
            'tin',
            'currencyCode',
            'status',
            'isCustomerAccountValid',
            'isAccountRestrictionValid',
            'isWatchlistStatusValid',
            'isBalanceEnquiryValid',
            'isChargeTaken',
          ],
        });
        if (!record) {
          throw new NotFoundException(
            `Regulatory form record with application number ${applicationNumber} not found`,
          );
        }
        return record;
      }
      case RegulatoryFormTypeEnum.FORM_A: {
        const record = await this.formARepository.findOne({
          ...baseWhere,
          attributes: [
            'formAId',
            'applicationNumber',
            'customerAccount',
            'applicantTINBVN',
            'currencyCode',
            'status',
            'isCustomerAccountValid',
            'isAccountRestrictionValid',
            'isWatchlistStatusValid',
            'isBalanceEnquiryValid',
            'isChargeTaken',
          ],
        });
        if (!record) {
          throw new NotFoundException(
            `Regulatory form record with application number ${applicationNumber} not found`,
          );
        }
        return record;
      }
      default:
        throw new BadRequestException(
          `Unsupported regulatory form type: ${regulatoryFormType}`,
        );
    }
  }

  private getTINNumber(record: FormM | FormNXP | FormNCX | FormA): string {
    if ('applicantTINNumber' in record) {
      return (record as FormM).applicantTINNumber;
    }
    if ('applicantTINBVN' in record) {
      return (record as FormA).applicantTINBVN;
    }
    return (record as FormNXP | FormNCX).tin;
  }

  private getTotalCF(record: FormM | FormNXP | FormNCX | FormA): number {
    if ('totalCAndF' in record) {
      return (record as FormM).totalCAndF;
    }
    return (record as FormNXP | FormNCX).totalCF;
  }

  private async buildFormMChargeAndTaxEntries(
    record: FormM | FormNXP | FormNCX | FormA,
    token: string,
  ): Promise<{ debitEntries: any[]; creditEntries: any[] }> {
    const regulatoryFormChargesAndTaxesConfigArray =
      await this.getRegulatoryFormChargesAndTaxes();

    const { regulatoryFormCharges, regulatoryFormTaxes } =
      regulatoryFormChargesAndTaxesConfigArray[0];

    const debitEntries = [];
    const creditEntries = [];

    const totalCF = this.getTotalCF(record);

    for (const formMCharge of regulatoryFormCharges) {
      const chargeData =
        await this.productManagementService.calculateChargeEntries(
          formMCharge?.chargeId,
          totalCF,
          CurrencyCodeEnum.NGN,
          token,
          record?.customerAccount,
        );

      if (!chargeData) {
        throw new BadRequestException('Invalid charge data');
      }

      const {
        charge_name,
        charge,
        charge_impacted_ledger,
        chargeApplicableTaxLedgerEntries,
      } = chargeData;

      debitEntries.push({
        debitAccountNumber: record?.customerAccount,
        debitAmount: parseFloat(charge),
        debitNarration: `${charge_name}`,
      });

      creditEntries.push({
        creditAccountNumber: charge_impacted_ledger.ledger_code,
        creditAmount: parseFloat(charge),
        creditNarration: `${charge_name}`,
      });

      if (
        chargeApplicableTaxLedgerEntries &&
        chargeApplicableTaxLedgerEntries.length > 0
      ) {
        for (const taxEntry of chargeApplicableTaxLedgerEntries) {
          if (taxEntry.chargeApplicableTaxDebitLedgers) {
            for (const taxDebitLedger of taxEntry.chargeApplicableTaxDebitLedgers) {
              debitEntries.push({
                debitAccountNumber: record?.customerAccount,
                debitAmount: taxDebitLedger.amount,
                debitNarration: `${taxDebitLedger.tax_name}`,
              });
            }
          }

          if (taxEntry.chargeApplicableTaxCreditLedgers) {
            for (const taxCreditLedger of taxEntry.chargeApplicableTaxCreditLedgers) {
              creditEntries.push({
                creditAccountNumber: taxCreditLedger.ledger_code,
                creditAmount: taxCreditLedger.amount,
                creditNarration: `${taxCreditLedger.tax_name}`,
              });
            }
          }
        }
      }
    }

    for (const formMTax of regulatoryFormTaxes) {
      const taxDeductions =
        await this.productManagementService.calculateTaxEntries(
          formMTax?.taxId,
          totalCF,
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
        debitAccountNumber: record?.customerAccount,
        debitAmount: tax,
        debitNarration: `${tax_name}`,
      });

      creditEntries.push({
        creditAccountNumber: ledgerCode,
        creditAmount: tax,
        creditNarration: `${tax_name}`,
      });
    }

    return { debitEntries, creditEntries };
  }

  @SafeCron('*/5 * * * *')
  private async retrieveAndEnqueueFormMData() {
    let pageNumber = 1;
    const pageSize = 50;
    const documents = [];

    const onePlugloginresponse = await this.onePlugService.login();

    const onePlugToken = onePlugloginresponse?.value?.accessToken;

    const parsedOnePlugBodogwuLoginResponse =
      await this.onePlugService.onePlugBodogwuLogin(onePlugToken);

    const onePlugBodogwuToken = parsedOnePlugBodogwuLoginResponse?.token;

    const parsedDecryptedOnePlugBodogwuGetByCriteriaResponse: TradeGovSingleWindowResponse =
      await this.onePlugService.onePlugBodogwuGetByCriteria(
        onePlugToken,
        onePlugBodogwuToken,
        pageNumber,
        pageSize,
      );

    if (!parsedDecryptedOnePlugBodogwuGetByCriteriaResponse) {
      this.loggerService.debug(
        'No response from OnePlug Bodogwu GetByCriteria',
        RegulatoryFormService.name,
      );
      return;
    }

    documents.push(
      ...(parsedDecryptedOnePlugBodogwuGetByCriteriaResponse?.data || []),
    );

    while (
      documents.length <
      parsedDecryptedOnePlugBodogwuGetByCriteriaResponse?.totalRecords
    ) {
      pageNumber++;
      this.loggerService.debug(
        `Retrieving documents from page ${pageNumber}`,
        RegulatoryFormService.name,
      );
      const parsedDecryptedOnePlugBodogwuGetByCriteriaResponse: TradeGovSingleWindowResponse =
        await this.onePlugService.onePlugBodogwuGetByCriteria(
          onePlugToken,
          onePlugBodogwuToken,
          pageNumber,
          pageSize,
        );

      documents.push(
        ...(parsedDecryptedOnePlugBodogwuGetByCriteriaResponse?.data || []),
      );

      this.loggerService.debug(
        `Retrieved documents from page ${pageNumber}`,
        RegulatoryFormService.name,
      );
    }

    const validatedDocuments = documents.filter(
      (document: FormMDocument) =>
        document.status.toLowerCase() ===
        RegulatoryFormStatusEnum.VALIDATED.toLowerCase(),
    );

    for (const document of validatedDocuments) {
      const { applicationNumber } = document;

      const isCached =
        await this.appRedisService.checkCurrentDayRegulatoryFormApplicationNumber(
          applicationNumber,
          RegulatoryFormTypeEnum.FORM_M,
        );

      if (!isCached) {
        await this.tradeGovFormMQueue.add(
          TradeGovActionEnum.TRADE_GOV_TO_TRADE_API,
          document,
        );
        this.loggerService.debug(
          `Enqueued document with application number ${applicationNumber} to ${TRADE_API_TRADE_GOV_FORM_M_QUEUE_NAME}`,
          RegulatoryFormService.name,
        );
      } else {
        this.loggerService.debug(
          `Document already processed: ${applicationNumber}`,
          RegulatoryFormService.name,
        );
      }
    }
  }

  @SafeCron('*/5 * * * *')
  private async retrieveAndEnqueueFormNXPData() {
    let pageNumber = 0;
    const pageSize = 50;
    const documents: TrmsFormNXPApplication[] = [];

    const trmsToken = await this.trmsService.login();

    let last = false;

    while (!last) {
      const trmsPendingFormNXPApplications: TrmsFormNXPApplicationResponse =
        await this.trmsService.getPendingFormNXPApplications(
          trmsToken,
          'createdAt',
          'DESC',
          pageSize,
          pageNumber,
        );

      if (trmsPendingFormNXPApplications?.content) {
        documents.push(...trmsPendingFormNXPApplications.content);
      }

      last = trmsPendingFormNXPApplications?.last ?? true;
      pageNumber++;
    }

    for (const document of documents) {
      const { applicationNumber } = document;

      const formNXP = await this.formNXPRepository.findOne({
        where: { applicationNumber },
        attributes: ['applicationNumber'],
      });

      if (!formNXP) {
        const trmsFormNXPDetails = await this.trmsService.getFormNXPDetails(
          trmsToken,
          document.id,
        );

        if (
          trmsFormNXPDetails?.status?.toLowerCase() ===
          RegulatoryFormStatusEnum.SUBMITTED.toLowerCase()
        ) {
          await this.trmsFormNXPQueue.add(
            TrmsActionEnum.TRMS_TO_TRADE_API,
            trmsFormNXPDetails,
          );
          this.loggerService.debug(
            `Enqueued document with application number ${applicationNumber} to ${TRADE_API_TRMS_FORM_NXP_QUEUE_NAME}`,
          );
        }
      } else {
        this.loggerService.debug(
          `Document already processed: ${applicationNumber}`,
          RegulatoryFormService.name,
        );
      }
    }
  }

  @SafeCron('*/5 * * * *')
  private async retrieveAndEnqueueFormNCXData() {
    let pageNumber = 0;
    const pageSize = 50;
    const documents: TrmsFormNCXApplication[] = [];

    const trmsToken = await this.trmsService.login();

    let last = false;

    while (!last) {
      const trmsPendingFormNCXApplications: TrmsFormNCXApplicationResponse =
        await this.trmsService.getPendingFormNCXApplications(
          trmsToken,
          'createdAt',
          'DESC',
          pageSize,
          pageNumber,
        );

      if (trmsPendingFormNCXApplications?.content) {
        documents.push(...trmsPendingFormNCXApplications.content);
      }

      last = trmsPendingFormNCXApplications?.last ?? true;
      pageNumber++;
    }

    for (const document of documents) {
      const { applicationNumber } = document;

      const formNCX = await this.formNCXRepository.findOne({
        where: { applicationNumber },
        attributes: ['applicationNumber'],
      });

      if (!formNCX) {
        const trmsFormNCXDetails = await this.trmsService.getFormNCXDetails(
          trmsToken,
          document.id,
        );

        if (
          trmsFormNCXDetails?.status?.toLowerCase() ===
          RegulatoryFormStatusEnum.SUBMITTED.toLowerCase()
        ) {
          await this.trmsFormNCXQueue.add(
            TrmsActionEnum.TRMS_TO_TRADE_API,
            trmsFormNCXDetails,
          );
          this.loggerService.debug(
            `Enqueued document with application number ${applicationNumber} to ${TRADE_API_TRMS_FORM_NCX_QUEUE_NAME}`,
            RegulatoryFormService.name,
          );
        }
      } else {
        this.loggerService.debug(
          `Document already processed: ${applicationNumber}`,
          RegulatoryFormService.name,
        );
      }
    }
  }

  @SafeCron('*/5 * * * *')
  private async retrieveAndEnqueueFormAData() {
    let pageNumber = 0;
    const pageSize = 50;
    const documents: TrmsFormAApplication[] = [];

    const trmsToken = await this.trmsService.login();

    let last = false;

    while (!last) {
      const trmsPendingFormAApplications: TrmsFormAApplicationResponse =
        await this.trmsService.getPendingFormAApplications(
          trmsToken,
          'createdAt',
          'DESC',
          pageSize,
          pageNumber,
        );

      if (trmsPendingFormAApplications?.content) {
        documents.push(...trmsPendingFormAApplications.content);
      }

      last = trmsPendingFormAApplications?.last ?? true;
      pageNumber++;
    }

    for (const document of documents) {
      const { applicationNumber } = document;

      const formA = await this.formARepository.findOne({
        where: { applicationNumber },
        attributes: ['applicationNumber'],
      });

      if (!formA) {
        const trmsFormADetails = await this.trmsService.getFormADetails(
          trmsToken,
          document.id,
        );

        if (
          trmsFormADetails?.status?.toLowerCase() ===
          RegulatoryFormStatusEnum.SUBMITTED.toLowerCase()
        ) {
          await this.trmsFormAQueue.add(
            TrmsActionEnum.TRMS_TO_TRADE_API,
            trmsFormADetails,
          );
          this.loggerService.debug(
            `Enqueued document with application number ${applicationNumber} to ${TRADE_API_TRMS_FORM_A_QUEUE_NAME}`,
            RegulatoryFormService.name,
          );
        }
      } else {
        this.loggerService.debug(
          `Document already processed: ${applicationNumber}`,
          RegulatoryFormService.name,
        );
      }
    }
  }

  /**
   * account that these next validation checks are to be done on has to be the
   * preferred debit account of the customer. if no preferred account is set,
   * any account (some form of corporate account) with enough balance can be
   * used. customer accounts are fetched using the TIN associated with them
   */
  async validateCustomerAccount(
    applicationNumber: string,
    regulatoryFormType: RegulatoryFormTypeEnum,
  ) {
    const record = await this.getRegulatoryFormRecord(
      applicationNumber,
      regulatoryFormType,
    );
    const repository = this.getRepository(regulatoryFormType);

    const token = await this.authService.getSystemUserToken();

    const tinNumber = this.getTINNumber(record);

    if (tinNumber) {
      const customerProfile =
        await this.customerManagementService.getCustomerById(
          token,
          CustomerManagementIdTypeEnum.TAX_IDENTIFICATION_NUMBER,
          tinNumber,
        );

      const customerProducts = customerProfile?.data?.customer_products;

      const currentCustomerProduct = customerProducts.find(
        (customerProduct: any) =>
          customerProduct.productType?.toLowerCase() ===
            ProductFactoryProductTypeEnum.CURRENT.toLowerCase() &&
          customerProduct?.currency?.toLowerCase() ===
            CurrencyCodeEnum.NGN.toLowerCase(),
      );

      const customerAccount = currentCustomerProduct?.accountNumber;

      if (customerAccount) {
        await repository.update(
          {
            customerAccount: customerAccount,
            isCustomerAccountValid: true,
          },
          {
            where: { applicationNumber: record.applicationNumber },
          },
        );

        this.formMValidationQueue.add(
          RegulatoryFormMValidationCheckEnum.ACCOUNT_RESTRICTION,
          { applicationNumber, regulatoryFormType },
        );

        this.loggerService.debug(
          `Enqueued ${RegulatoryFormMValidationCheckEnum.ACCOUNT_RESTRICTION} validation job for ${applicationNumber}`,
          RegulatoryFormService.name,
        );
      } else {
        await this.stpExceptionRepository.create({
          applicationNumber: record.applicationNumber,
          stpExceptionReason: `Application is on exception queue because no Current Customer Account can be tied to the TIN provided`,
          stpExceptionType: StpExceptionTypeEnum.CUSTOMER_ACCOUNT_VALIDATION,
          regulatoryFormType: regulatoryFormType,
        });
      }
    } else {
      await this.stpExceptionRepository.create({
        applicationNumber: record.applicationNumber,
        stpExceptionReason: `Application is on exception queue because no TIN is provided`,
        stpExceptionType: StpExceptionTypeEnum.CUSTOMER_ACCOUNT_VALIDATION,
        regulatoryFormType: regulatoryFormType,
      });
    }
  }

  async validateAccountRestriction(
    applicationNumber: string,
    regulatoryFormType: RegulatoryFormTypeEnum,
  ) {
    const record = await this.getRegulatoryFormRecord(
      applicationNumber,
      regulatoryFormType,
    );
    const repository = this.getRepository(regulatoryFormType);

    const token = await this.authService.getSystemUserToken();

    const accountDetails = await this.camsService.getAccountDetails(
      record?.customerAccount,
      token,
    );

    const restrictions = [];

    if (accountDetails?.freezeCode === '001') {
      restrictions.push('Account has a total freeze on it');
    } else if (accountDetails?.freezeCode === '002') {
      restrictions.push('Account has a post no debit on it');
    } else if (accountDetails?.freezeCode === '003') {
      restrictions.push('Account has a no post no credit on it');
    }

    if (accountDetails?.lienAmount > 0) {
      restrictions.push(
        `Account has a lien amount of ${accountDetails.lienAmount}`,
      );
    }

    if (restrictions.length > 0) {
      await this.stpExceptionRepository.create({
        stpExceptionType: StpExceptionTypeEnum.ACCOUNT_RESTRICTION,
        applicationNumber: applicationNumber,
        stpExceptionReason: `Application is on exception queue due to ${restrictions.join(
          ', ',
        )}`,
        regulatoryFormType: regulatoryFormType,
      });

      this.loggerService.debug(
        `Customer account ${record?.customerAccount} has account restrictions: ${restrictions.join(
          ', ',
        )}`,
        RegulatoryFormService.name,
      );

      return;
    }

    await repository.update(
      { isAccountRestrictionValid: true },
      {
        where: { applicationNumber },
      },
    );

    await this.formMValidationQueue.add(
      RegulatoryFormMValidationCheckEnum.BALANCE_ENQUIRY,
      { applicationNumber, regulatoryFormType },
    );

    this.loggerService.debug(
      `Enqueued ${RegulatoryFormMValidationCheckEnum.BALANCE_ENQUIRY} validation job for ${applicationNumber}`,
      RegulatoryFormService.name,
    );
  }

  /**
   * check if the balance is sufficient enough to take a pre-defined charge (set up in charge module) from it.
   * if concession charge defined, take concession charge. if not, take actual charge. prefered account has to
   * be in naira. Enqueue to another queue dedicated to taking a charge from the account if balance is sufficient
   */
  async validateBalanceEnquiry(
    applicationNumber: string,
    regulatoryFormType: RegulatoryFormTypeEnum,
  ) {
    const record = await this.getRegulatoryFormRecord(
      applicationNumber,
      regulatoryFormType,
    );
    const repository = this.getRepository(regulatoryFormType);

    const token = await this.authService.getSystemUserToken();

    const { debitEntries } = await this.buildFormMChargeAndTaxEntries(
      record,
      token,
    );

    const totalChargesAndTaxes = debitEntries.reduce(
      (sum, entry) => sum + (entry.debitAmount || 0),
      0,
    );

    const accountDetails = await this.camsService.getAccountDetails(
      record?.customerAccount,
      token,
    );

    if (accountDetails?.clearedBalance < totalChargesAndTaxes) {
      await this.stpExceptionRepository.create({
        stpExceptionType: StpExceptionTypeEnum.BALANCE_ENQUIRY,
        applicationNumber: applicationNumber,
        stpExceptionReason: `Application is on exception queue due to insufficient balance in account ${record?.customerAccount} for charges and taxes totaling ${accountDetails?.currencyCode.toUpperCase()}${totalChargesAndTaxes}`,
        regulatoryFormType: regulatoryFormType,
      });

      this.loggerService.debug(
        `Customer account ${record?.customerAccount} has insufficient balance for charges and taxes totaling ${accountDetails?.currencyCode.toUpperCase()}${totalChargesAndTaxes}`,
        RegulatoryFormService.name,
      );

      return;
    }

    await repository.update(
      { isBalanceEnquiryValid: true },
      {
        where: { applicationNumber },
      },
    );

    await this.formMChargesQueue.add(`${applicationNumber} charge deduction`, {
      applicationNumber,
      regulatoryFormType,
    });

    this.loggerService.debug(
      `Enqueued job for ${TRADE_API_REGULATORY_FORM_CHARGES_QUEUE_NAME} for ${applicationNumber}`,
      RegulatoryFormService.name,
    );

    await this.formMValidationQueue.add(
      RegulatoryFormMValidationCheckEnum.WATCHLIST,
      {
        applicationNumber,
        regulatoryFormType,
      },
    );

    this.loggerService.debug(
      `Enqueued ${RegulatoryFormMValidationCheckEnum.WATCHLIST} validation job for ${applicationNumber}`,
      RegulatoryFormService.name,
    );
  }

  /**
   * add to STP Exception queue if watchlist status fails
   */
  async validateWatchlistStatus(
    applicationNumber: string,
    regulatoryFormType: RegulatoryFormTypeEnum,
  ) {
    const record = await this.getRegulatoryFormRecord(
      applicationNumber,
      regulatoryFormType,
    );
    const repository = this.getRepository(regulatoryFormType);

    const token = await this.authService.getSystemUserToken();

    const tinNumber = this.getTINNumber(record);

    const customerProfile =
      await this.customerManagementService.getCustomerById(
        token,
        CustomerManagementIdTypeEnum.TAX_IDENTIFICATION_NUMBER,
        tinNumber,
      );

    const bvn = customerProfile?.data?.customer_profiles[0]?.bvn;
    const email = customerProfile?.data?.customer_profiles[0]?.email;

    const [isBvnBlackListed, isBvnWatchListed] = await Promise.all([
      this.complianceService.isBvnBlackListed(bvn, email),
      this.complianceService.isBvnWatchListed(bvn, email),
    ]);

    const watchListArray = [];

    if (isBvnBlackListed?.responseCode === '302') {
      watchListArray.push(isBvnBlackListed?.responseMessage);
    }

    if (isBvnWatchListed?.responseCode === '302') {
      watchListArray.push(isBvnWatchListed?.responseMessage);
    }

    if (watchListArray.length !== 0) {
      await this.stpExceptionRepository.create({
        stpExceptionType: StpExceptionTypeEnum.WATCHLIST,
        applicationNumber: applicationNumber,
        stpExceptionReason: watchListArray.join(', '),
        regulatoryFormType: regulatoryFormType,
      });

      this.loggerService.debug(
        `Customer account ${record?.customerAccount} has been watchlisted`,
        RegulatoryFormService.name,
      );

      await repository.update(
        { isWatchlistStatusValid: false },
        {
          where: { applicationNumber },
        },
      );

      return;
    }

    await repository.update(
      { isWatchlistStatusValid: true },
      {
        where: { applicationNumber },
      },
    );
  }

  /**
   * replace with a proper charge taking service
   */
  async processRegulatoryFormCharge(
    applicationNumber: string,
    regulatoryFormType: RegulatoryFormTypeEnum,
  ) {
    const record = await this.getRegulatoryFormRecord(
      applicationNumber,
      regulatoryFormType,
    );
    const repository = this.getRepository(regulatoryFormType);

    const token = await this.authService.getSystemUserToken();

    const { debitEntries, creditEntries } =
      await this.buildFormMChargeAndTaxEntries(record, token);

    const formTypeLabel =
      regulatoryFormType === RegulatoryFormTypeEnum.FORM_M
        ? 'Form M'
        : 'Form NXP';

    const journalPostingRequestBody = createJournalPostingRequestBody({
      userId: 'System User',
      branchCode: 'System Branch',
      currencyShortCode: CurrencyCodeEnum.NGN,
      requestId: `${moment.utc().format('YYMMDD')}${this.nanoid()}`,
      debitEntries: debitEntries,
      creditEntries: creditEntries,
      initiatedBy: 'System User',
      approvedByBranchCode: 'System Branch',
      reconciliationRemarks: `${formTypeLabel} ${record?.applicationNumber} Charges And Taxes`,
    });

    const journalPostingResponse = await this.camsService.postToJournal(
      journalPostingRequestBody,
      token,
    );

    await repository.update(
      {
        isChargeTaken: true,
        chargesAndTaxesTransactionId:
          journalPostingResponse?.value?.transactionId,
      },
      {
        where: { applicationNumber },
      },
    );
  }

  async getFormMRecord(id: string, options: GetFormMRecordDto): Promise<FormM> {
    const query: { where: Partial<FormM> } = {
      where: {},
    };

    switch (options?.identifier) {
      case GetFormMRecordIdentifierEnum.FORM_M_ID:
        query.where.formMId = id;
        break;
      case GetFormMRecordIdentifierEnum.APPLICATION_NUMBER:
        query.where.applicationNumber = id;
        break;
      case GetFormMRecordIdentifierEnum.FORM_NUMBER:
        query.where.formNumber = id;
        break;
      default:
        throw new NotFoundException(
          `Invalid identifier: ${options?.identifier}`,
        );
    }

    const formMRecord = await this.formMRepository.findOne({
      ...query,
    });

    if (!formMRecord) {
      throw new NotFoundException(
        `Form M record with ${options?.identifier}: ${id} not found`,
      );
    }

    const onePlugloginresponse = await this.onePlugService.login();

    const onePlugToken = onePlugloginresponse?.value?.accessToken;

    const parsedOnePlugBodogwuLoginResponse =
      await this.onePlugService.onePlugBodogwuLogin(onePlugToken);

    const onePlugBodogwuToken = parsedOnePlugBodogwuLoginResponse?.token;

    const formMDocument =
      await this.onePlugService.onePlugBodogwuGetByReferenceNumber(
        onePlugToken,
        onePlugBodogwuToken,
        formMRecord?.formNumber,
      );

    if (!formMDocument) {
      throw new BadRequestException(
        `Form M with the application number ${formMRecord?.applicationNumber} not found in the B-Odogwu System`,
      );
    }

    await this.formMRepository.update(formMDocument?.documents, {
      where: { formMId: formMRecord?.formMId },
    });

    return this.formMRepository.findByPk(formMRecord?.formMId, {});
  }

  async getFormMRecords(
    options: GetFormMRecordsDto,
  ): Promise<GetFormMRecordsResponse> {
    const {
      page = 1,
      size = 10,
      startDate,
      endDate,
      validOnly,
      applicantName,
      applicationNumber,
      status,
    } = options;

    const query: { where: Partial<FormM> | any } = {
      where: {},
    };

    if (validOnly) {
      query.where.isCustomerAccountValid = true;
      query.where.isAccountRestrictionValid = true;
      query.where.isBalanceEnquiryValid = true;
      query.where.isWatchlistStatusValid = true;
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

    if (status) {
      query.where.status = status;
    }

    if (applicantName) {
      query.where.applicantName = {
        [Op.iLike]: `%${applicantName}%`,
      };
    }

    if (applicationNumber) {
      query.where.applicationNumber = {
        [Op.iLike]: `%${applicationNumber}%`,
      };
    }

    const { count: totalRecords, rows: formMRecords } =
      await this.formMRepository.findAndCountAll({
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
      formMRecords,
    };
  }

  async getRegulatoryFormRecordsStatusCount(
    recordType: GetAllFormMRecordsStatusCountIdentifierEnum,
  ): Promise<number> {
    let count: number;

    switch (recordType) {
      case GetAllFormMRecordsStatusCountIdentifierEnum.FORM_M:
        ({ count } = await this.formMRepository.findAndCountAll({
          where: {
            // isAccountRestrictionValid: true,
            // isBalanceEnquiryValid: true,
            // isCustomerAccountValid: true,
            // isWatchlistStatusValid: true,
          },
        }));
        return count;

      case GetAllFormMRecordsStatusCountIdentifierEnum.FORM_NXP:
        ({ count } = await this.formNXPRepository.findAndCountAll({
          where: {
            // isAccountRestrictionValid: true,
            // isBalanceEnquiryValid: true,
            // isCustomerAccountValid: true,
            // isWatchlistStatusValid: true,
          },
        }));
        return count;

      case GetAllFormMRecordsStatusCountIdentifierEnum.FORM_NCX:
        ({ count } = await this.formNCXRepository.findAndCountAll({
          where: {
            // isAccountRestrictionValid: true,
            // isBalanceEnquiryValid: true,
            // isCustomerAccountValid: true,
            // isWatchlistStatusValid: true,
          },
        }));
        return count;

      case GetAllFormMRecordsStatusCountIdentifierEnum.STP_EXCEPTION:
        ({ count } = await this.stpExceptionRepository.findAndCountAll({}));
        return count;
    }
  }

  async getFormNXPRecord(
    id: string,
    options: GetFormNXPRecordDto,
  ): Promise<FormNXP> {
    const query: { where: Partial<FormNXP> } = {
      where: {},
    };

    switch (options?.identifier) {
      case GetFormNXPRecordIdentifierEnum.FORM_NXP_ID:
        query.where.formNXPId = id;
        break;
      case GetFormNXPRecordIdentifierEnum.APPLICATION_NUMBER:
        query.where.applicationNumber = id;
        break;
      case GetFormNXPRecordIdentifierEnum.FORM_NUMBER:
        query.where.formNumber = id;
        break;
      default:
        throw new NotFoundException(
          `Invalid identifier: ${options?.identifier}`,
        );
    }

    const formNXPRecord = await this.formNXPRepository.findOne({
      ...query,
    });

    if (!formNXPRecord) {
      throw new NotFoundException(
        `Form NXP record with ${options?.identifier}: ${id} not found`,
      );
    }

    const trmsToken = await this.trmsService.login();

    const trmsFormNXPDetails = await this.trmsService.getFormNXPDetails(
      trmsToken,
      formNXPRecord.id,
    );

    await this.formNXPRepository.update(trmsFormNXPDetails, {
      where: { formNXPId: formNXPRecord.formNXPId },
    });

    return this.formNXPRepository.findByPk(formNXPRecord.formNXPId, {});
  }

  async getFormNXPRecords(
    options: GetFormNXPRecordsDto,
  ): Promise<GetFormNXPRecordsResponse> {
    const {
      page = 1,
      size = 10,
      startDate,
      endDate,
      validOnly,
      applicantName,
      applicationNumber,
      status,
    } = options;

    const query: { where: Partial<FormNXP> | any } = {
      where: {},
    };

    if (validOnly) {
      query.where.isCustomerAccountValid = true;
      query.where.isAccountRestrictionValid = true;
      query.where.isBalanceEnquiryValid = true;
      query.where.isWatchlistStatusValid = true;
    }

    if (startDate && endDate) {
      query.where.dateCreated = {
        [Op.between]: [
          moment
            .tz(startDate, IANATimeZoneDatabaseEnum.LAGOS)
            .startOf('day')
            .toDate(),
          moment
            .tz(endDate, IANATimeZoneDatabaseEnum.LAGOS)
            .endOf('day')
            .toDate(),
        ],
      };
    } else if (startDate) {
      query.where.createdAt = {
        [Op.gte]: moment
          .tz(startDate, IANATimeZoneDatabaseEnum.LAGOS)
          .startOf('day')
          .toDate(),
      };
    } else if (endDate) {
      query.where.createdAt = {
        [Op.lte]: moment
          .tz(endDate, IANATimeZoneDatabaseEnum.LAGOS)
          .endOf('day')
          .toDate(),
      };
    }

    if (status) {
      query.where.status = status;
    }

    if (applicantName) {
      query.where.exporterName = {
        [Op.iLike]: `%${applicantName}%`,
      };
    }

    if (applicationNumber) {
      query.where.applicationNumber = {
        [Op.iLike]: `%${applicationNumber}%`,
      };
    }

    const { count: totalRecords, rows: formNXPRecords } =
      await this.formNXPRepository.findAndCountAll({
        ...query,
        offset: (page - 1) * size,
        limit: size,
        order: [['dateCreated', 'DESC']],
      });

    const totalPages = Math.ceil(totalRecords / size);

    return {
      page,
      totalPages,
      totalRecords,
      size,
      formNXPRecords,
    };
  }

  async getFormNCXRecord(
    id: string,
    options: GetFormNCXRecordDto,
  ): Promise<FormNCX> {
    const query: { where: Partial<FormNCX> } = {
      where: {},
    };

    switch (options?.identifier) {
      case GetFormNCXRecordIdentifierEnum.FORM_NCX_ID:
        query.where.formNCXId = id;
        break;
      case GetFormNCXRecordIdentifierEnum.APPLICATION_NUMBER:
        query.where.applicationNumber = id;
        break;
    }

    const formNCXRecord = await this.formNCXRepository.findOne({
      ...query,
    });

    if (!formNCXRecord) {
      throw new NotFoundException(
        `Form NCX record with ${options?.identifier}: ${id} not found`,
      );
    }

    const trmsToken = await this.trmsService.login();

    const trmsFormNCXDetails = await this.trmsService.getFormNCXDetails(
      trmsToken,
      formNCXRecord.id,
    );

    await this.formNCXRepository.update(trmsFormNCXDetails, {
      where: { formNCXId: formNCXRecord.formNCXId },
    });

    return this.formNCXRepository.findByPk(formNCXRecord.formNCXId, {});
  }

  async getFormNCXRecords(
    options: GetFormNCXRecordsDto,
  ): Promise<GetFormNCXRecordsResponse> {
    const {
      page = 1,
      size = 10,
      startDate,
      endDate,
      validOnly,
      applicantName,
      applicationNumber,
      status,
    } = options;

    const query: { where: Partial<FormNCX> | any } = {
      where: {},
    };

    if (validOnly) {
      query.where.isCustomerAccountValid = true;
      query.where.isAccountRestrictionValid = true;
      query.where.isBalanceEnquiryValid = true;
      query.where.isWatchlistStatusValid = true;
    }

    if (startDate && endDate) {
      query.where.dateCreated = {
        [Op.between]: [
          moment
            .tz(startDate, IANATimeZoneDatabaseEnum.LAGOS)
            .startOf('day')
            .toDate(),
          moment
            .tz(endDate, IANATimeZoneDatabaseEnum.LAGOS)
            .endOf('day')
            .toDate(),
        ],
      };
    } else if (startDate) {
      query.where.createdAt = {
        [Op.gte]: moment
          .tz(startDate, IANATimeZoneDatabaseEnum.LAGOS)
          .startOf('day')
          .toDate(),
      };
    } else if (endDate) {
      query.where.createdAt = {
        [Op.lte]: moment
          .tz(endDate, IANATimeZoneDatabaseEnum.LAGOS)
          .endOf('day')
          .toDate(),
      };
    }

    if (status) {
      query.where.status = status;
    }

    if (applicantName) {
      query.where.applicantName = {
        [Op.iLike]: `%${applicantName}%`,
      };
    }

    if (applicationNumber) {
      query.where.applicationNumber = {
        [Op.iLike]: `%${applicationNumber}%`,
      };
    }

    const { count: totalRecords, rows: formNCXRecords } =
      await this.formNCXRepository.findAndCountAll({
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
      formNCXRecords,
    };
  }

  async getStpException(stpExceptionId: string): Promise<StpException> {
    const stpException = await this.stpExceptionRepository.findOne({
      where: { stpExceptionId },
    });

    if (!stpException) {
      throw new NotFoundException('No matching STP Exception found');
    }

    return stpException;
  }

  async getStpRequestsStatusCount(
    id: string,
    branch: string,
    statusType: RecordsStatusTypeEnum,
    regulatoryFormType: RegulatoryFormTypeEnum,
    recordScope: AuthorizationStatusEnum,
    requestStatus: RequestStatusEnum,
  ) {
    const query: { where: Partial<StpExceptionRequest> } = {
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

    if (requestStatus) {
      query.where.requestStatus = requestStatus;
    }

    if (regulatoryFormType) {
      query.where.stpException.regulatoryFormType = regulatoryFormType;
    }

    const stpExceptionRequestsStatusCount =
      await this.stpExceptionRequestRepository.scope(null).findAll({
        where: query.where,
        attributes: [
          [LetterOfCreditStatusTypeToColumnMappingEnum[statusType], 'status'],
          [this.sequelize.fn('COUNT', this.sequelize.literal('*')), 'count'],
        ],
        group: [LetterOfCreditStatusTypeToColumnMappingEnum[statusType]],
        raw: true,
      });

    return stpExceptionRequestsStatusCount.map((record: any) => ({
      status: record.status,
      count: parseInt(record.count, 10),
    }));
  }

  async initiateStpExceptionRequest(data: ResolveStpExceptionDto) {
    const { userPermissions } = data;

    const resolvedStpException = await this.stpExceptionRepository.findOne({
      where: {
        stpExceptionId: data?.stpExceptionId,
        isStpExceptionResolved: true,
      },
    });

    if (resolvedStpException) {
      throw new BadRequestException('STP Exception has already been resolved!');
    }

    const existingStpExceptionRequest =
      await this.stpExceptionRequestRepository.findOne({
        where: {
          stpExceptionId: data?.stpExceptionId,
          requestStatus: {
            [Op.in]: [RequestStatusEnum.IN_REVIEW, RequestStatusEnum.APPROVED],
          },
        },
      });

    if (existingStpExceptionRequest) {
      throw new BadRequestException(
        `${existingStpExceptionRequest?.requestStatus} STP Exception Request record already exists`,
      );
    }

    const stpExceptionResolveRequest =
      await this.stpExceptionRequestRepository.create({
        generatedRequestId: await this.generateStpExceptionRequestId(
          data?.stpExceptionResolveType,
        ),
        stpExceptionId: data?.stpExceptionId,
        stpExceptionResolveType: data?.stpExceptionResolveType,
        customerAccount: data?.customerAccount,
        addTinToCustomerAccount: data?.addTinToCustomerAccount,
        initiator: data?.initiator,
        initiatorId: data?.initiatorId,
        initiatorBranchCode: data?.initiatorBranchCode,
        initiatorDepartment: data?.initiatorDepartment,
        tenantId: data?.tenantId,
      });

    if (userPermissions.includes('')) {
      await this.handleResolveStpException(stpExceptionResolveRequest);
      await this.stpExceptionRequestRepository.update(
        {
          approver: data?.initiator,
          approverId: data?.initiatorId,
          approverBranchCode: data?.initiatorBranchCode,
          approverDepartment: data?.initiatorDepartment,
          requestStatus: RequestStatusEnum.APPROVED,
          approvalStatus: ApprovalStatusEnum.APPROVED,
        },
        { where: { requestId: stpExceptionResolveRequest?.requestId } },
      );
    }

    return stpExceptionResolveRequest;
  }

  async authorizeStpExceptionRequest(data: AuthorizeActionDto) {
    const {
      id,
      approver,
      approverId,
      approverBranchCode,
      approverDepartment,
      approvalStatus,
      reasonForRejection,
    } = data;

    const stpExceptionResolveRequest =
      await this.stpExceptionRequestRepository.findOne({
        where: { requestId: id },
      });

    if (!stpExceptionResolveRequest) {
      throw new NotFoundException('No matching STP Exception found');
    }

    let valueToUpdate: Partial<StpExceptionRequest>;

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
      requestId: id,
    };

    if (
      approvalStatus.toLowerCase() === ApprovalStatusEnum.APPROVED.toLowerCase()
    ) {
      await this.handleResolveStpException(stpExceptionResolveRequest);
    }

    await this.stpExceptionRequestRepository.update(valueToUpdate, {
      where: whereToUpdate,
    });

    return this.stpExceptionRequestRepository.findOne({
      where: { requestId: whereToUpdate.requestId },
    });
  }

  async handleResolveStpException(
    stpExceptionResolveRequest: StpExceptionRequest,
  ) {
    switch (stpExceptionResolveRequest?.stpExceptionResolveType) {
      case StpExceptionResolveTypeEnum.RESOLVE:
        await this.handleResolveStpExceptionResolve(stpExceptionResolveRequest);
        break;
      case StpExceptionResolveTypeEnum.EXEMPT:
        await this.handleResolveStpExceptionExempt(stpExceptionResolveRequest);
        break;
    }

    await this.stpExceptionRepository.update(
      { isStpExceptionResolved: true },
      {
        where: {
          stpExceptionId:
            stpExceptionResolveRequest?.stpException?.stpExceptionId,
        },
      },
    );
  }

  async handleResolveStpExceptionResolve(
    stpExceptionResolveRequest: StpExceptionRequest,
  ) {
    switch (stpExceptionResolveRequest?.stpException?.stpExceptionType) {
      case StpExceptionTypeEnum.CUSTOMER_ACCOUNT_VALIDATION:
        if (stpExceptionResolveRequest.addTinToCustomerAccount) {
          /**
           * update the customer account in customer management with the TIN
           */
          // const stpException = await this.stpExceptionRepository.findOne({
          //   where: {
          //     stpExceptionId: stpExceptionResolveRequest?.stpExceptionId,
          //   },
          // });
        }

        await this.validateCustomerAccount(
          stpExceptionResolveRequest?.stpException?.applicationNumber,
          stpExceptionResolveRequest?.stpException?.regulatoryFormType,
        );
        break;
      case StpExceptionTypeEnum.ACCOUNT_RESTRICTION:
        await this.validateAccountRestriction(
          stpExceptionResolveRequest?.stpException?.applicationNumber,
          stpExceptionResolveRequest?.stpException?.regulatoryFormType,
        );
        break;
      case StpExceptionTypeEnum.BALANCE_ENQUIRY:
        await this.validateBalanceEnquiry(
          stpExceptionResolveRequest?.stpException?.applicationNumber,
          stpExceptionResolveRequest?.stpException?.regulatoryFormType,
        );
        break;
      case StpExceptionTypeEnum.WATCHLIST:
        await this.validateWatchlistStatus(
          stpExceptionResolveRequest?.stpException?.applicationNumber,
          stpExceptionResolveRequest?.stpException?.regulatoryFormType,
        );
        break;
    }
  }

  async handleResolveStpExceptionExempt(
    stpExceptionResolveRequest: StpExceptionRequest,
  ) {
    await this.stpExceptionRepository.update(
      { isStpExceptionResolved: true },
      {
        where: {
          stpExceptionId:
            stpExceptionResolveRequest?.stpException?.stpExceptionId,
        },
      },
    );

    const regulatoryFormType =
      stpExceptionResolveRequest?.stpException?.regulatoryFormType;
    const repository = this.getRepository(regulatoryFormType);

    await repository.update(
      {
        isCustomerAccountValid: true,
        isAccountRestrictionValid: true,
        isBalanceEnquiryValid: true,
        isWatchlistStatusValid: true,
      },
      {
        where: {
          applicationNumber:
            stpExceptionResolveRequest?.stpException.applicationNumber,
        },
      },
    );
  }

  async getStpExceptions(
    options: GetStpExceptionsDto,
  ): Promise<GetStpExceptionsResponse> {
    const { page = 1, size = 10 } = options;

    const query: { where: any } = {
      where: {},
    };

    if (options?.applicationNumber) {
      query.where.applicationNumber = {
        [Op.iLike]: `%${options?.applicationNumber}%`,
      };
    }

    if (options?.regulatoryFormType) {
      query.where.regulatoryFormType = options?.regulatoryFormType;
    }

    const { count: totalRecords, rows: stpExceptions } =
      await this.stpExceptionRepository.findAndCountAll({
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
      stpExceptions,
    };
  }

  async getStpExceptionRequests(
    options: GetStpExceptionRequestsDto,
  ): Promise<GetStpExceptionRequestsResponse> {
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
      regulatoryFormType,
    } = options;

    const query: { where: Partial<StpExceptionRequest> } = {
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

    if (regulatoryFormType) {
      query.where.stpException.regulatoryFormType = regulatoryFormType;
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

    const { count: totalRecords, rows: stpExceptionRequests } =
      await this.stpExceptionRequestRepository.findAndCountAll({
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
      stpExceptionRequests,
    };
  }

  async getStpExceptionRequest(
    requestId: string,
  ): Promise<StpExceptionRequest> {
    const stpExceptionRequest =
      await this.stpExceptionRequestRepository.findOne({
        where: { requestId },
      });

    if (!stpExceptionRequest) {
      throw new NotFoundException('No matching STP Exception found');
    }

    return stpExceptionRequest;
  }

  async withdraw(id: string, initiatorId: string) {
    const stpExceptionRequest =
      await this.stpExceptionRequestRepository.findOne({
        where: {
          requestId: id,
          initiatorId,
          approvalStatus: ApprovalStatusEnum.PENDING,
        },
      });

    if (!stpExceptionRequest) {
      throw new NotFoundException(
        'No Matching request with that Request Id initiated by this user found',
      );
    }

    await this.stpExceptionRequestRepository.update(
      {
        approvalStatus: null,
        requestStatus: RequestStatusEnum.DRAFT,
      },
      { where: { requestId: stpExceptionRequest?.requestId } },
    );

    return this.stpExceptionRequestRepository.findOne({
      where: { requestId: stpExceptionRequest?.requestId },
    });
  }

  async delete(id: string, initiatorId: string) {
    const stpExceptionRequest =
      await this.stpExceptionRequestRepository.findOne({
        where: {
          requestId: id,
          initiatorId,
          approvalStatus: ApprovalStatusEnum.PENDING,
        },
      });

    if (!stpExceptionRequest) {
      throw new NotFoundException(
        'No Matching request with that Request Id initiated by this user found',
      );
    }

    const deletedStpExceptionRequestCount =
      await this.stpExceptionRequestRepository.delete({
        where: { requestId: stpExceptionRequest?.requestId },
      });

    return deletedStpExceptionRequestCount;
  }

  async saveRegulatoryFormChargesAndTaxes(
    data: CreateRegulatoryFormChargesAndTaxesDto,
  ) {
    const existingConfig =
      await this.regulatoryFormChargesAndTaxesRepository.findOne({});
    if (existingConfig) {
      await this.regulatoryFormChargesAndTaxesRepository.update(data, {
        where: {
          regulatoryFormChargesAndTaxesId:
            existingConfig.regulatoryFormChargesAndTaxesId,
        },
      });
      return;
    }

    await this.regulatoryFormChargesAndTaxesRepository.create(data);
    return;
  }

  async getRegulatoryFormChargesAndTaxes() {
    return await this.regulatoryFormChargesAndTaxesRepository.findAll({});
  }
}
