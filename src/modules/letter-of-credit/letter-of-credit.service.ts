import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import {
  ApplicationRulesEnum,
  ApprovalStatusEnum,
  AuthorizationStatusEnum,
  ChargeAmountFieldEnum,
  ConfirmationInstructionEnum,
  CreditAvailableByEnum,
  CreditAvailableWithEnum,
  DraftModeEnum,
  DraweeEnum,
  EntryPartyEnum,
  EntryTypeEnum,
  RegulatoryFormStatusEnum,
  GetFormMRecordIdentifierEnum,
  IANATimeZoneDatabaseEnum,
  LetterOfCreditActionTypeEnum,
  LetterOfCreditActionTypeToTradeProductFactoryChargesAndTaxesTypeEnum,
  LetterOfCreditAmountChangeEnum,
  RecordsStatusTypeEnum,
  LetterOfCreditStateEnum,
  LetterOfCreditStatusTypeToColumnMappingEnum,
  PaymentActionTypeEnum,
  PaymentTransferMethodEnum,
  PostingAmountFieldEnum,
  RequestedConfirmationPartyEnum,
  RequestStatusEnum,
  SwiftBICEnum,
  SwiftMessageJobActionEnum,
  TradeAccountTypeEnum,
  TradeProductFactoryLetterOfCreditChargesAndTaxesTypeEnum,
  LetterOfCreditProductTypeEnum,
  RegulatoryFormTypeEnum,
  GetFormNXPRecordIdentifierEnum,
  MarginTypeEnum,
  LetterOfCreditFreeFormaSwifttMessageTypeEnum,
  ContingencyTypeEnum,
  PermissionEnum,
  RegulatoryFormRequiredEnum,
} from 'src/common/enums';
import {
  LetterOfCreditAssignmentOfProceedRepository,
  LetterOfCreditAdjustmentRepository,
  LetterOfCreditAmendmentRepository,
  LetterOfCreditCancellationRepository,
  LetterOfCreditDocumentLodgementRepository,
  LetterOfCreditFreeFormatMessageRepository,
  LetterOfCreditPaymentRepository,
  LetterOfCreditRepository,
  LetterOfCreditRequestRepository,
  LetterOfCreditTemplateRepository,
} from './letter-of-credit.repository';
import { IssueLetterOfCreditDto } from './dto/issue-letter-of-credit.dto';
import { AuthorizeLetterOfCreditDto } from './dto/authorize-letter-of-credit.dto';
import { LetterOfCreditRequest } from './models/letter-of-credit-request.model';
import { LetterOfCredit } from './models/letter-of-credit.model';
import { Sequelize } from 'sequelize-typescript';
import * as moment from 'moment-timezone';
import { Op, QueryTypes, Transaction } from 'sequelize';
import {
  LETTER_OF_CREDIT_EXPIRY_QUEUE_NAME,
  LETTER_OF_CREDIT_PENDING_REQUEST_JOURNAL_REVERSAL_QUEUE_NAME,
  TRADE_API_LETTER_OF_CREDIT_SWIFT_MESSAGE_QUEUE_NAME,
} from 'src/common/constants';
import { Queue } from 'bullmq';
import { GetLetterOfCreditRequestResponse } from './interfaces/get-letter-of-credit-records';
import { GetLetterOfCreditRecordsDto } from './dto/get-letter-of-credit-records.dto';
import { FormMRepository } from '../regulatory-form/regulatory-form.repository';
import { AmendLetterOfCreditDto } from './dto/amend-letter-of-credit.dto';
import { LetterOfCreditAmendment } from './models/letter-of-credit-amendment.model';
import { CamsService } from 'src/services/cams/cams.service';
import { customAlphabet } from 'nanoid';
import { TradeProductFactoryService } from 'src/services/trade-product-factory/trade-product-factory.service';
import { CreditLineService } from '../credit-line/credit-line.service';
import {
  AccountingEntry,
  ApplicableTaxLedgerEntry,
  ChargeAndTax,
  CounterParty,
  CounterPartyAccount,
  CustomerSearchResponse,
  Mt707MessageData,
  TradeAccount,
  TradeProductData,
  TransactionReversal,
} from 'src/common/interfaces';
import createJournalPostingRequestBody from 'src/common/utils/create-journal-posting-request-body.util';
import generateRandomNumberWithDigits from 'src/common/utils/generate-random-number-with-digits.util';
import generateMt202Message from 'src/common/utils/generate-mt-202-message.util';
import generateMt700Message from 'src/common/utils/generate-mt-700-message.util';
import generateMt707Message from 'src/common/utils/generate-mt-707-message.utiil';
import compareLetterOfCreditAmendmentChanges from 'src/common/utils/compare-letter-of-credit-amendment-changes.util';
import { AdjustLetterOfCreditDto } from './dto/adjust-letter-of-credit.dto';
import { CancelLetterOfCreditDto } from './dto/cancel-letter-of-credit.dto';
import { LetterOfCreditFreeFormatMessageDto } from './dto/letter-of-credit-free-format-message.dto';
import { SearchLetterOfCreditTemplateRecordsDto } from './dto/get-letter-of-credit-template-records.dto';
import { LetterOfCreditTemplate } from './models/letter-of-credit-template.model';
import { LetterOfCreditAdjustment } from './models/letter-of-credit-adjustment.model';
import { LetterOfCreditCancellation } from './models/letter-of-credit-cancellation.model';
import { LetterOfCreditFreeFormatMessage } from './models/letter-of-credit-free-format-message.model';
import generateMtn99Message from 'src/common/utils/generate-mt-n99-message.util';
import { TreasuryTradeService } from 'src/services/treasury-trade/treasury-trade.service';
import { uuidv7 } from 'uuidv7';
import { LetterOfCreditPaymentDto } from './dto/letter-of-credit-payment.dto';
import { LetterOfCreditPayment } from './models/letter-of-credit-payment.model';
import { LetterOfCreditDocumentLodgmentDto } from './dto/letter-of-credit-document-lodgment.dto';
import generateMt752Message from 'src/common/utils/generate-mt-752-message.util';
import { AdviseLetterOfCreditDto } from './dto/advise-letter-of-credit.dto';
import generateMt730Message from 'src/common/utils/generate-mt-730-message';
import { LetterOfCreditDocumentLodgement } from './models/letter-of-credit-document-lodgement.model';
import { ProductManagementService } from 'src/services/product-management/product-management.service';
import { InjectQueue } from '@nestjs/bullmq';
import { RegulatoryFormService } from '../regulatory-form/regulatory-form.service';
import { LetterOfCreditAssignmentOfProceed } from './models/letter-of-credit-assignment-of-proceed.model';
import { LetterOfCreditAssignmentOfProceedDto } from './dto/add-letter-of-credit-assignment-of-proceed.dto';
import { FormM } from '../regulatory-form/models/form-m.model';
import { CustomerManagementService } from 'src/services/customer-management/customer-management.service';
import { FormNXP } from '../regulatory-form/models/form-nxp.model';
import { FormA } from '../regulatory-form/models/form-a.model';
import { FormNCX } from '../regulatory-form/models/form-ncx.model';
import { RulesConfigurationService } from 'src/services/rules-configuration/rules-configuration.service';
import { LetterOfCreditDebitAndCreditEntriesPayload } from './types/letter-of-credit-debit-and-credit-entries-payload.type';

@Injectable()
export class LetterOfCreditService {
  private readonly nanoid = customAlphabet('1234567890abcdef', 10);

  constructor(
    private readonly formMRepository: FormMRepository,
    private readonly sequelize: Sequelize,
    private readonly letterOfCreditRequestRepository: LetterOfCreditRequestRepository,
    private readonly letterOfCreditRepository: LetterOfCreditRepository,
    private readonly letterOfCreditAmendmentRepository: LetterOfCreditAmendmentRepository,
    private readonly letterOfCreditCancellationRepository: LetterOfCreditCancellationRepository,
    private readonly letterOfCreditAdjustmentRepository: LetterOfCreditAdjustmentRepository,
    private readonly letterOfCreditDocumentLodgementRepository: LetterOfCreditDocumentLodgementRepository,
    private readonly letterOfCreditFreeFormatRepository: LetterOfCreditFreeFormatMessageRepository,
    private readonly letterOfCreditTemplateRepository: LetterOfCreditTemplateRepository,
    private readonly letterOfCreditPaymentRepository: LetterOfCreditPaymentRepository,
    private readonly letterOfCreditAssignmentOfProceedRepository: LetterOfCreditAssignmentOfProceedRepository,
    private readonly camsService: CamsService,
    private readonly tradeProductFactoryService: TradeProductFactoryService,
    private readonly creditLineService: CreditLineService,
    private readonly treasuryTradeService: TreasuryTradeService,
    private readonly productManagementService: ProductManagementService,
    private readonly regulatoryFormService: RegulatoryFormService,
    private readonly customerManagementService: CustomerManagementService,
    private readonly rulesConfigurationService: RulesConfigurationService,
    @InjectQueue(TRADE_API_LETTER_OF_CREDIT_SWIFT_MESSAGE_QUEUE_NAME)
    private readonly swiftMessageQueue: Queue,
    @InjectQueue(LETTER_OF_CREDIT_PENDING_REQUEST_JOURNAL_REVERSAL_QUEUE_NAME)
    private readonly letterOfCreditPendingRequestJournalReversalQueue: Queue,
    @InjectQueue(LETTER_OF_CREDIT_EXPIRY_QUEUE_NAME)
    private readonly letterOfCreditExpiryQueue: Queue,
    @Inject(Logger) private readonly loggerService: LoggerService,
  ) {}

  async generateReferenceNumber(
    letterOfCreditProductType: LetterOfCreditProductTypeEnum,
    slogan?: string,
  ): Promise<string> {
    const sequence = await this.sequelize.query(
      `SELECT nextval('reference_number_seq') AS nextval`,
      { type: QueryTypes.SELECT },
    );

    const creationYear = moment().format('YY');

    const nextVal = sequence[0]['nextval'];
    return `SB/${letterOfCreditProductType === LetterOfCreditProductTypeEnum.IMPORT ? 'ILC' : 'ELC'}${creationYear}${String(nextVal).padStart(4, '0')}${slogan ? slogan : ''}`;
  }

  async generatePreAdvicereferenceNumber(): Promise<string> {
    const sequence = await this.sequelize.query(
      `SELECT nextval('pre_advice_reference_number_seq') AS nextval`,
      { type: QueryTypes.SELECT },
    );

    const creationYear = moment().format('YY');

    const nextVal = sequence[0]['nextval'];
    return `SB/ILC${creationYear}${String(nextVal).padStart(4, '0')}CULC`;
  }

  async getDebitAndCreditEntries(data: any, token: string) {
    let tradeProductData: TradeProductData;
    let letterOfCredit: LetterOfCredit;

    if (data?.tradeProductId) {
      tradeProductData =
        await this.tradeProductFactoryService.getProductDetails(
          data?.tradeProductId,
          token,
        );
    } else {
      letterOfCredit = await this.letterOfCreditRepository.findOne({
        where: { referenceNumber: data?.lcReferenceNumber },
      });

      tradeProductData =
        await this.tradeProductFactoryService.getProductDetails(
          letterOfCredit?.tradeProductId,
          token,
        );
    }

    const debitAndCreditEntries = await this.handleDebitAndCreditEntries({
      letterOfCreditActionType: data?.letterOfCreditActionType,
      tradeProductData,
      chargeType:
        TradeProductFactoryLetterOfCreditChargesAndTaxesTypeEnum[
          LetterOfCreditActionTypeToTradeProductFactoryChargesAndTaxesTypeEnum[
            data?.letterOfCreditActionType
          ]
        ],
      token,
      previewData: data,
    });

    return debitAndCreditEntries;
  }

  async saveLetterOfCreditAsDraft(data: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userPermissions, token, ...filterData } = data;

    const existingLetterOfCreditRequest =
      await this.letterOfCreditRequestRepository.findOne({
        where: {
          requestId: data?.requestId,
        },
      });

    if (!existingLetterOfCreditRequest && data?.isDraft) {
      throw new BadRequestException(
        'Letter of Credit is marked as draft but no existing matching record with the same reference ID exists.',
      );
    }

    data.requestStatus = RequestStatusEnum.DRAFT;
    data.approvalStatus = null;

    let savedLetterOfCredit: any;

    if (data?.isDraft) {
      [, [savedLetterOfCredit]] =
        await this.letterOfCreditRequestRepository.update(
          {
            letterOfCreditActionType: data?.letterOfCreditActionType,
            letterOfCreditProductType: data?.letterOfCreditProductType,
            initiator: data?.initiator,
            initiatorId: data?.initiatorId,
            initiatorBranchCode: data?.initiatorBranchCode,
            initiatorDepartment: data?.initiatorDepartment,
            tenantId: data?.tenantId,
            applicationNumber: data?.applicationNumber,
            requestStatus: RequestStatusEnum.DRAFT,
            approvalStatus: null,
            metadata: filterData,
          },
          {
            where: {
              requestId: data?.requestId,
            },
          },
        );

      return savedLetterOfCredit;
    }

    savedLetterOfCredit = await this.letterOfCreditRequestRepository.create({
      letterOfCreditActionType: data?.letterOfCreditActionType,
      letterOfCreditProductType: data?.letterOfCreditProductType,
      initiator: data?.initiator,
      initiatorId: data?.initiatorId,
      initiatorBranchCode: data?.initiatorBranchCode,
      initiatorDepartment: data?.initiatorDepartment,
      tenantId: data?.tenantId,
      applicationNumber: data?.applicationNumber,
      requestStatus: RequestStatusEnum.DRAFT,
      approvalStatus: null,
      metadata: filterData,
    });

    return savedLetterOfCredit;
  }

  async validateLetterOfCredit(
    requestData: IssueLetterOfCreditDto | AdviseLetterOfCreditDto,
    tradeProductData: TradeProductData,
    token: string,
    letterOfCreditActionType: LetterOfCreditActionTypeEnum,
  ) {
    const letterOfCredit = requestData;
    const maxTolerance = letterOfCredit.maxCreditAmountTolerance ?? 0;

    if (
      tradeProductData?.regulatoryFormRequired !==
      RegulatoryFormRequiredEnum.NONE
    ) {
      const regulatoryForm =
        await this.regulatoryFormService.getRegulatoryFormRecord(
          letterOfCredit?.applicationNumber,
          LetterOfCreditProductTypeEnum.IMPORT ===
            letterOfCredit?.letterOfCreditProductType
            ? RegulatoryFormTypeEnum.FORM_M
            : RegulatoryFormTypeEnum.FORM_NXP,
        );

      if (!regulatoryForm) {
        throw new BadRequestException(
          `${LetterOfCreditProductTypeEnum.IMPORT === letterOfCredit?.letterOfCreditProductType ? 'Form M' : 'Form NXP'} with application number ${letterOfCredit.applicationNumber} not found.`,
        );
      }

      const maxLcAmount =
        'totalCAndF' in regulatoryForm
          ? regulatoryForm.totalCAndF * 1.1
          : (regulatoryForm as FormNXP | FormNCX).totalCF * 1.1;

      const lcAmountWithMaxTolerance =
        letterOfCredit.lcAmount * (1 + maxTolerance / 100);

      if (maxLcAmount < letterOfCredit.lcAmount) {
        throw new BadRequestException(
          `LC Amount cannot be greater than 110% of the Form M Amount.`,
        );
      }

      if (maxLcAmount < lcAmountWithMaxTolerance) {
        throw new BadRequestException(
          `LC Amount (Max Credit Tolerance Inclusive) cannot be greater than 110% of the Form M Amount.`,
        );
      }
    }

    const applicantAccountDetails = await this.camsService.getAccountDetails(
      letterOfCredit?.applicantAccount,
      '',
    );

    if (!applicantAccountDetails) {
      throw new NotFoundException(
        'Applicant Account not found in Central Account Management System',
      );
    }

    const { chargesAndTaxesDebitEntries } =
      await this.handleDebitAndCreditEntries({
        letterOfCreditActionType,
        tradeProductData,
        chargeType:
          TradeProductFactoryLetterOfCreditChargesAndTaxesTypeEnum[
            LetterOfCreditActionTypeToTradeProductFactoryChargesAndTaxesTypeEnum[
              requestData?.letterOfCreditActionType
            ]
          ],
        token,
        previewData: requestData,
      });

    const grandTotal = chargesAndTaxesDebitEntries.reduce(
      (sum, entry) => sum + entry.debitAmount,
      0,
    );

    if (grandTotal > applicantAccountDetails?.availableBalance) {
      throw new BadRequestException(
        'Applicant Account Balance Insufficient for Charges',
      );
    }

    if (
      letterOfCredit?.applicableRules === ApplicationRulesEnum.OTHER &&
      !letterOfCredit?.otherApplicableRules
    ) {
      throw new BadRequestException(
        'Other Applicable Rules must be specified when Applicable Rules is OTHER',
      );
    }

    if (
      letterOfCredit?.confirmationInstruction ===
        ConfirmationInstructionEnum.CONFIRM ||
      letterOfCredit?.confirmationInstruction ===
        ConfirmationInstructionEnum.MAY_ADD
    ) {
      if (!letterOfCredit?.confirmationAmount) {
        throw new BadRequestException(
          'Confirmation Amount must be specified when Confirmation Instruction is CONFIRM or MAY ADD',
        );
      }

      if (!letterOfCredit?.requestedConfirmationParty) {
        throw new BadRequestException(
          'Requested Confirmation Party must be specified when Confirmation Instruction is CONFIRM or MAY ADD',
        );
      }

      if (
        letterOfCredit?.requestedConfirmationBankName ===
        RequestedConfirmationPartyEnum.NAMED_BANK
      ) {
        if (!letterOfCredit?.requestedConfirmationBankBicCode) {
          throw new BadRequestException(
            'Requested Confirmation Bank BIC Code must be specified when Requested Confirmation Party is NAMED BANK',
          );
        }

        if (!letterOfCredit?.requestedConfirmationBankName) {
          throw new BadRequestException(
            'Requested Confirmation Bank Name must be specified when Requested Confirmation Party is NAMED BANK',
          );
        }

        if (!letterOfCredit?.requestedConfirmationBankAddress) {
          throw new BadRequestException(
            'Requested Confirmation Bank Address must be specified when Requested Confirmation Party is NAMED BANK',
          );
        }
      }
    }

    if (
      letterOfCredit?.creditAvailableWith === CreditAvailableWithEnum.NAMED_BANK
    ) {
      if (!letterOfCredit?.creditAvailableWithBankSwiftCode) {
        throw new BadRequestException(
          'Credit Available With Bank SWIFT Code must be specified when Credit Available With is NAMED BANK',
        );
      }

      if (!letterOfCredit?.creditAvailableWithBankName) {
        throw new BadRequestException(
          'Credit Available With Bank Name must be specified when Credit Available With is NAMED BANK',
        );
      }

      if (!letterOfCredit?.creditAvailableWithBankAddress) {
        throw new BadRequestException(
          'Credit Available With Bank Address must be specified when Credit Available With is NAMED BANK',
        );
      }
    }

    if (letterOfCredit?.creditAvailableBy) {
      if (
        letterOfCredit?.creditAvailableBy ===
          CreditAvailableByEnum.BY_NEGOTIATION ||
        letterOfCredit?.creditAvailableBy ===
          CreditAvailableByEnum.BY_DEF_PAYMENT
      ) {
        if (!letterOfCredit?.paymentDate) {
          throw new BadRequestException(
            `Payment Date must be specified when Credit Available By is ${letterOfCredit?.creditAvailableBy}`,
          );
        }

        if (!letterOfCredit?.paymentMethod) {
          throw new BadRequestException(
            `Payment Method must be specified when Credit Available By is ${letterOfCredit?.creditAvailableBy}`,
          );
        }
      }

      if (
        letterOfCredit?.creditAvailableBy ===
        CreditAvailableByEnum.BY_MIXED_PAYMENT
      ) {
        if (!letterOfCredit?.mixedPaymentDetails) {
          throw new BadRequestException(
            `Mixed Payment Details must be specified when Credit Available By is ${letterOfCredit?.creditAvailableBy}`,
          );
        }
      }
    }

    if (letterOfCredit?.draftDrawn) {
      if (letterOfCredit?.drawee === DraweeEnum.NAMED_BANK) {
        if (!letterOfCredit?.draweeBankBicCode) {
          throw new BadRequestException(
            'Drawee Bank BIC Code must be specified when Drawee is NAMED BANK',
          );
        }

        if (!letterOfCredit?.draweeBankName) {
          throw new BadRequestException(
            'Drawee Bank Name must be specified when Drawee is NAMED BANK',
          );
        }

        if (!letterOfCredit?.draweeBankAddress) {
          throw new BadRequestException(
            'Drawee Bank Address must be specified when Drawee is NAMED BANK',
          );
        }
      }

      if (letterOfCredit?.draftMode === DraftModeEnum.TENOR) {
        if (!letterOfCredit?.tenorPeriod) {
          throw new BadRequestException(
            'Tenor Period must be specified when Draft Mode is TENOR',
          );
        }

        if (!letterOfCredit?.tenorPeriodType) {
          throw new BadRequestException(
            'Tenor Period Type must be specified when Draft Mode is TENOR',
          );
        }
      }

      if (letterOfCredit?.draftMode === DraftModeEnum.MATURITY) {
        if (!letterOfCredit?.maturityDate) {
          throw new BadRequestException(
            'Maturity Date must be specified when Draft Mode is MATURITY',
          );
        }
      }
    }

    if (letterOfCredit?.preNegotiation && letterOfCredit?.creditLine) {
      const creditLineDetails = await this.creditLineService.findByAny(
        letterOfCredit?.creditLine,
      );

      if (
        letterOfCredit?.preNegotiationAmount >
        creditLineDetails?.confirmationLineAmount
      ) {
        throw new BadRequestException(
          'Credit Line Balance Insufficient for Pre Negotiation Amount',
        );
      }
    } else {
      if (letterOfCredit?.preNegotiationAmount > 0) {
        throw new BadRequestException(
          'Pre Negotiation Amount can only be specified when Pre Negotiation is true and Credit Line is provided',
        );
      }
    }
  }

  async handleAccountNumberRetrieval(
    entryParty: EntryPartyEnum,
    entryAccountType: TradeAccountTypeEnum,
    data: {
      applicantAccount?: string;
      applicantBankBicCode?: string;
      beneficiaryBankSwiftCode?: string;
      requestedConfirmationBankBicCode?: string;
      creditAvailableWith?: CreditAvailableWithEnum;
      creditAvailableWithBankSwiftCode?: string;
      advisingBankBicCode?: string;
    },
    entryType: EntryTypeEnum,
    token: string,
    currencyCode: string,
  ) {
    if (!entryParty) {
      throw new BadRequestException(
        `${entryType} Entry Party is not specified in the Trade Product Accounting Entry`,
      );
    }

    if (!entryAccountType) {
      throw new BadRequestException(
        `${entryType} Entry Account Type is not specified in the Trade Product Accounting Entry`,
      );
    }

    let swiftBic: string;
    let accountNumber: string;

    switch (entryParty) {
      case EntryPartyEnum.APPLICANT:
        swiftBic = data?.applicantBankBicCode;
        break;
      case EntryPartyEnum.BENEFICIARY:
        swiftBic = data?.beneficiaryBankSwiftCode;
        break;
      case EntryPartyEnum.CONFIRMATION_BANK:
        swiftBic = data?.requestedConfirmationBankBicCode;
        break;
      case EntryPartyEnum.CREDIT_AVAILABLE_WITH_BANK:
        if (
          data?.creditAvailableWith === CreditAvailableWithEnum.ISSUING_BANK
        ) {
          swiftBic = SwiftBICEnum.STERLING;
        } else if (
          data?.creditAvailableWith === CreditAvailableWithEnum.ADVISING_BANK
        ) {
          swiftBic = data?.advisingBankBicCode;
        } else if (
          data?.creditAvailableWith === CreditAvailableWithEnum.OURSELVES
        ) {
          swiftBic = SwiftBICEnum.STERLING;
        } else {
          swiftBic = data?.creditAvailableWithBankSwiftCode;
        }
        break;
      case EntryPartyEnum.ADVISING_BANK:
        swiftBic = data?.advisingBankBicCode;
        break;
      case EntryPartyEnum.ISSUING_BANK:
        swiftBic = SwiftBICEnum.STERLING;
        break;
    }

    if (!swiftBic && entryParty !== EntryPartyEnum.APPLICANT) {
      throw new BadRequestException(
        `${entryType} Entry Party SWIFT BIC is not defined for ${entryParty} in the Letter of Credit Entry`,
      );
    }

    if (entryParty === EntryPartyEnum.APPLICANT) {
      const customerData: CustomerSearchResponse =
        await this.customerManagementService.searchCustomerByAccountNumber(
          token,
          data?.applicantAccount,
        );

      if (!customerData) {
        throw new NotFoundException(
          `${entryType} Entry Party with Applicant Account ${data?.applicantAccount} Customer Data not found.`,
        );
      }

      const customerId =
        customerData?.data?.customers[0]?.customer_profiles[0]?.customerNumber;

      const tradeAccounts =
        await this.treasuryTradeService.getCustomerTradeAccounts(
          customerId,
          token,
        );

      if (tradeAccounts?.length === 0) {
        throw new NotFoundException(
          `${entryType} Entry Party with Applicant Account ${data?.applicantAccount} Trade Accounts not found.`,
        );
      }

      const tradeAccount = tradeAccounts.find(
        (account: TradeAccount) =>
          account.currencyCode === currencyCode &&
          account.accountType.toLowerCase() === entryAccountType.toLowerCase(),
      );

      if (!tradeAccount) {
        throw new BadRequestException(
          `No trade account found for ${entryType} entry party: applicant account ${data?.applicantAccount}, currency ${currencyCode}, account type ${entryAccountType}`,
        );
      }

      accountNumber = tradeAccount?.accountNumber;

      if (!accountNumber) {
        throw new BadRequestException(
          `Unable to determine ${entryType} account number for ${entryParty}. No matching ${entryAccountType} account found for currency ${currencyCode}.`,
        );
      }
    } else {
      const counterPartyDetails: CounterParty =
        await this.treasuryTradeService.getCounterPartyBySwiftBic(
          swiftBic,
          token,
        );

      if (!counterPartyDetails) {
        throw new NotFoundException(
          `${entryType} Entry Party with SWIFT BIC ${swiftBic} Counter Party details not found.`,
        );
      }

      const matchingCurrencyAccounts = counterPartyDetails.accounts.filter(
        (account: CounterPartyAccount) =>
          account.currencyCode.toLowerCase() === currencyCode.toLowerCase(),
      );

      if (matchingCurrencyAccounts.length === 0) {
        throw new BadRequestException(
          `No matching currency accounts found for ${entryParty} with SWIFT BIC: ${swiftBic}`,
        );
      }

      for (const matchingCurrencyAccount of matchingCurrencyAccounts) {
        const accountDetails = await this.camsService.getAccountDetails(
          matchingCurrencyAccount?.nuban,
          token,
        );

        if (
          entryAccountType.toLowerCase() ===
          accountDetails?.parentLedgerName.toLowerCase()
        ) {
          accountNumber = matchingCurrencyAccount?.nuban;
        }
      }

      if (!accountNumber) {
        throw new BadRequestException(
          `Unable to determine ${entryType} account number for ${entryParty} (SWIFT BIC: ${swiftBic}). No matching ${entryAccountType} account found for currency ${currencyCode}.`,
        );
      }
    }

    return accountNumber;
  }

  private async validateActionRequestAndGetTradeProductData({
    data,
    token,
  }: {
    data: {
      lcReferenceNumber: string;
      requestId?: string;
      isDraft?: boolean;
      letterOfCreditActionType?: LetterOfCreditActionTypeEnum;
    };
    token: string;
  }): Promise<{
    letterOfCredit: LetterOfCredit;
    tradeProductData: TradeProductData;
    existingLetterOfCreditRequest?: LetterOfCreditRequest;
  }> {
    const letterOfCredit = await this.letterOfCreditRepository.findOne({
      where: { referenceNumber: data.lcReferenceNumber },
    });

    if (!letterOfCredit) {
      throw new NotFoundException(
        `Letter of Credit with reference number ${data.lcReferenceNumber} not found.`,
      );
    }

    if (
      letterOfCredit.status === LetterOfCreditActionTypeEnum.CANCELLATION ||
      letterOfCredit.status === LetterOfCreditActionTypeEnum.EXPIRY
    ) {
      throw new BadRequestException(
        `Letter of Credit with reference number ${data.lcReferenceNumber} has already been cancelled or expired.`,
      );
    }

    let existingLetterOfCreditRequest: LetterOfCreditRequest | null = null;

    if (data?.requestId) {
      existingLetterOfCreditRequest =
        await this.letterOfCreditRequestRepository.findOne({
          where: {
            requestId: data?.requestId,
            approvalStatus: { [Op.not]: ApprovalStatusEnum.REJECTED },
          },
        });
    }

    if (existingLetterOfCreditRequest && !data?.isDraft) {
      throw new BadRequestException(
        'A matching Letter of Credit request already exists in a non-final state (neither rejected nor approved).',
      );
    }

    if (!existingLetterOfCreditRequest && data?.isDraft) {
      throw new BadRequestException(
        'Letter of Credit Request is marked as draft but no existing matching record with the same request ID exists.',
      );
    }

    if (
      data?.letterOfCreditActionType ===
        LetterOfCreditActionTypeEnum.AMENDMENT ||
      data?.letterOfCreditActionType === LetterOfCreditActionTypeEnum.ADJUSTMENT
    ) {
      const pendingActionRequestCount =
        await this.letterOfCreditRequestRepository.count({
          where: {
            lcReferenceNumber: data.lcReferenceNumber,
            letterOfCreditActionType: data.letterOfCreditActionType,
            approvalStatus: ApprovalStatusEnum.PENDING,
          },
        });

      if (pendingActionRequestCount > 1) {
        throw new BadRequestException(
          `Another ${data.letterOfCreditActionType} request for letter of credit ${data.lcReferenceNumber} is already in pending state.`,
        );
      }
    }

    const tradeProductData =
      await this.tradeProductFactoryService.getProductDetails(
        letterOfCredit.tradeProductId,
        token,
      );

    return {
      letterOfCredit,
      tradeProductData,
      existingLetterOfCreditRequest,
    };
  }

  async handlePostingEntries(
    letterOfCreditDebitAndCreditEntriesPayload: LetterOfCreditDebitAndCreditEntriesPayload,
    accountingEntry: AccountingEntry,
    token: string,
  ) {
    const { postingEntries } = accountingEntry;
    const debitEntries = [];
    const creditEntries = [];
    let currencyCode: string;

    for (const postingEntry of postingEntries) {
      this.loggerService.debug(
        `posting entry details - type: ${accountingEntry?.type}; name: ${accountingEntry?.name}; postingAmountField: ${postingEntry?.postingAmountField};`,
        LetterOfCreditService.name,
      );
      if (postingEntry?.applicableRule) {
        const isRuleValid =
          await this.rulesConfigurationService.evaluateRulesForLetterOfCredit(
            postingEntry?.applicableRule?.code,
            token,
            letterOfCreditDebitAndCreditEntriesPayload,
          );

        if (!isRuleValid) {
          continue;
        }
      }

      let amount: number;

      if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.INCREASE_LC_AMOUNT
      ) {
        amount = letterOfCreditDebitAndCreditEntriesPayload.lcChangeAmount;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.lcCurrencyCode;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.DECREASE_LC_AMOUNT
      ) {
        amount = letterOfCreditDebitAndCreditEntriesPayload.lcChangeAmount;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.lcCurrencyCode;
      } else if (
        postingEntry?.postingAmountField ===
          PostingAmountFieldEnum.NEW_LC_AMOUNT ||
        postingEntry?.postingAmountField === PostingAmountFieldEnum.LC_AMOUNT
      ) {
        amount = letterOfCreditDebitAndCreditEntriesPayload.lcAmount;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.lcCurrencyCode;
      } else if (
        postingEntry?.postingAmountField === PostingAmountFieldEnum.PAY_AMOUNT
      ) {
        amount = letterOfCreditDebitAndCreditEntriesPayload.payAmount;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.payAmountCurrency;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.PRESENTATION_AMOUNT
      ) {
        amount = letterOfCreditDebitAndCreditEntriesPayload.presentationAmount;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.presentationAmountCurrency;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.ADDITIONAL_AMOUNT
      ) {
        amount = letterOfCreditDebitAndCreditEntriesPayload.additionalAmount;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.additionalAmountCurrency;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.TOTAL_CLAIMED_AMOUNT
      ) {
        amount = letterOfCreditDebitAndCreditEntriesPayload.totalClaimedAmount;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.totalClaimedAmountCurrency;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.CHARGES_ADDED_AMOUNT
      ) {
        amount = letterOfCreditDebitAndCreditEntriesPayload.chargesAddedAmount;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.chargesAddedCurrency;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.CHARGES_DEDUCTED_AMOUNT
      ) {
        amount =
          letterOfCreditDebitAndCreditEntriesPayload.chargesDeductedAmount;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.chargesDeductedCurrency;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.DOCUMENT_AMOUNT
      ) {
        amount = letterOfCreditDebitAndCreditEntriesPayload.documentAmount;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.documentAmountCurrency;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.CONFIRMATION_AMOUNT
      ) {
        amount = letterOfCreditDebitAndCreditEntriesPayload.confirmationAmount;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.confirmationAmountCurrency;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.COLLATERAL_AMOUNT
      ) {
        amount = letterOfCreditDebitAndCreditEntriesPayload.collateralAmount;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.collateralCurrency;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.MARGIN_AMOUNT
      ) {
        amount = letterOfCreditDebitAndCreditEntriesPayload.marginAmount;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.marginCurrency;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.PRE_NEGOTIATION_AMOUNT
      ) {
        amount =
          letterOfCreditDebitAndCreditEntriesPayload.preNegotiationAmount;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.preNegotiationAmountCurrency;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.UNCONFIRMED_AMOUNT
      ) {
        amount = letterOfCreditDebitAndCreditEntriesPayload.unconfirmedAmount;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.confirmationAmountCurrency;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.CONFIRMATION_LINE_AMOUNT
      ) {
        amount =
          letterOfCreditDebitAndCreditEntriesPayload.confirmationLineAmount;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.lcCurrencyCode;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.MINIMUM_LETTER_OF_CREDIT_AMOUNT
      ) {
        amount =
          letterOfCreditDebitAndCreditEntriesPayload.minCreditAmountTolerance;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.lcCurrencyCode;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.MAXIMUM_LETTER_OF_CREDIT_AMOUNT
      ) {
        amount =
          letterOfCreditDebitAndCreditEntriesPayload.maxCreditAmountTolerance;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.lcCurrencyCode;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.OUTSTANDING_BALANCE
      ) {
        amount = letterOfCreditDebitAndCreditEntriesPayload.outstandingBalance;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.lcCurrencyCode;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.LIABILITY_AMOUNT
      ) {
        amount =
          letterOfCreditDebitAndCreditEntriesPayload.preNegotiationAmount;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.preNegotiationAmountCurrency;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.PRE_NEGOTIATION_INTEREST_AMOUNT
      ) {
        const currentDate = moment()
          .tz(IANATimeZoneDatabaseEnum.LAGOS)
          .format('YYYY-MM-DD');
        const preNegotiationStartDate = moment(
          letterOfCreditDebitAndCreditEntriesPayload.preNegotiationStartDate,
        )
          .tz(IANATimeZoneDatabaseEnum.LAGOS)
          .format('YYYY-MM-DD');

        const costOfFundsAccumulatedInterest =
          ((letterOfCreditDebitAndCreditEntriesPayload.costOfFundsRate / 100) *
            letterOfCreditDebitAndCreditEntriesPayload.preNegotiationAmount *
            moment(currentDate).diff(preNegotiationStartDate, 'days')) /
          365;

        const marginAccumulatedInterest =
          ((letterOfCreditDebitAndCreditEntriesPayload.marginRate / 100) *
            letterOfCreditDebitAndCreditEntriesPayload.preNegotiationAmount *
            moment(currentDate).diff(preNegotiationStartDate, 'days')) /
          365;

        const totalInterestAccumulated =
          costOfFundsAccumulatedInterest + marginAccumulatedInterest;

        amount = totalInterestAccumulated;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.preNegotiationAmountCurrency;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.INCREASE_OF_DOCUMENTARY_CREDIT_AMOUNT
      ) {
        amount =
          letterOfCreditDebitAndCreditEntriesPayload.lcAmount +
          letterOfCreditDebitAndCreditEntriesPayload.lcChangeAmount;
        currencyCode =
          letterOfCreditDebitAndCreditEntriesPayload.lcCurrencyCode;
      }

      if (!amount) {
        throw new BadRequestException(
          `Amount is not specified for ${postingEntry?.postingAmountField}`,
        );
      }

      if (!currencyCode) {
        throw new BadRequestException(
          `Currency Code is not specified for ${postingEntry?.postingAmountField}`,
        );
      }

      const {
        applicantAccount,
        applicantBankBicCode,
        beneficiaryBankSwiftCode,
        requestedConfirmationBankBicCode,
        creditAvailableWith,
        creditAvailableWithBankSwiftCode,
        advisingBankBicCode,
      } = letterOfCreditDebitAndCreditEntriesPayload;

      const debitAccountNumber = await this.handleAccountNumberRetrieval(
        postingEntry?.debitEntryParty,
        postingEntry?.debitEntryAccountType,
        {
          applicantAccount,
          applicantBankBicCode,
          beneficiaryBankSwiftCode,
          requestedConfirmationBankBicCode,
          creditAvailableWith,
          creditAvailableWithBankSwiftCode,
          advisingBankBicCode,
        },
        EntryTypeEnum.DEBIT,
        token,
        currencyCode,
      );

      const creditAccountNumber = await this.handleAccountNumberRetrieval(
        postingEntry?.creditEntryParty,
        postingEntry?.creditEntryAccountType,
        {
          applicantAccount,
          applicantBankBicCode,
          beneficiaryBankSwiftCode,
          requestedConfirmationBankBicCode,
          creditAvailableWith,
          creditAvailableWithBankSwiftCode,
          advisingBankBicCode,
        },
        EntryTypeEnum.CREDIT,
        token,
        currencyCode,
      );

      debitEntries.push({
        debitAccountNumber,
        debitAmount: amount,
        debitNarration: postingEntry?.debitPostingName,
      });

      creditEntries.push({
        creditAccountNumber,
        creditAmount: amount,
        creditNarration: postingEntry?.creditPostingName,
      });
    }

    return {
      debitEntries,
      creditEntries,
    };
  }

  async handleChargesAndTaxes(
    letterOfCreditDebitAndCreditEntriesPayload: LetterOfCreditDebitAndCreditEntriesPayload,
    chargesAndTaxes: ChargeAndTax,
    token: string,
  ) {
    const debitEntries = [];
    const creditEntries = [];

    for (const applicableCharge of chargesAndTaxes.applicableCharges) {
      this.loggerService.debug(
        `applicable charge details - type: ${chargesAndTaxes?.type}; name: ${chargesAndTaxes?.name}; chargeAmountField: ${applicableCharge?.chargeAmountField}; chargeType: ${applicableCharge?.chargeType}; chargeAmountType: ${applicableCharge?.charge_amount_type};`,
        LetterOfCreditService.name,
      );
      if (applicableCharge?.applicableRule) {
        const isRuleValid =
          await this.rulesConfigurationService.evaluateRulesForLetterOfCredit(
            applicableCharge?.applicableRule?.code,
            token,
            letterOfCreditDebitAndCreditEntriesPayload,
          );

        if (!isRuleValid) {
          continue;
        }
      }

      let totalChargeAmount: number | undefined;

      if (applicableCharge?.chargeAmountField) {
        const chargeAmountField = applicableCharge.chargeAmountField;

        if (chargeAmountField === ChargeAmountFieldEnum.INCREASE_LC_AMOUNT) {
          totalChargeAmount =
            letterOfCreditDebitAndCreditEntriesPayload.lcChangeAmount *
            letterOfCreditDebitAndCreditEntriesPayload.localCcyRate;
        } else if (
          chargeAmountField === ChargeAmountFieldEnum.DECREASE_LC_AMOUNT
        ) {
          totalChargeAmount =
            letterOfCreditDebitAndCreditEntriesPayload.lcChangeAmount *
            letterOfCreditDebitAndCreditEntriesPayload.localCcyRate;
        } else if (chargeAmountField === ChargeAmountFieldEnum.NEW_LC_AMOUNT) {
          totalChargeAmount =
            letterOfCreditDebitAndCreditEntriesPayload.lcAmount *
            letterOfCreditDebitAndCreditEntriesPayload.localCcyRate;
        } else if (chargeAmountField === ChargeAmountFieldEnum.LC_AMOUNT) {
          totalChargeAmount =
            letterOfCreditDebitAndCreditEntriesPayload.localCcyEquivalent;
        }
        if (chargeAmountField === ChargeAmountFieldEnum.PAY_AMOUNT) {
          totalChargeAmount =
            letterOfCreditDebitAndCreditEntriesPayload.payAmount *
            letterOfCreditDebitAndCreditEntriesPayload.localCcyRate;
        } else if (
          chargeAmountField === ChargeAmountFieldEnum.ADDITIONAL_AMOUNT
        ) {
          totalChargeAmount =
            letterOfCreditDebitAndCreditEntriesPayload.additionalAmount *
            letterOfCreditDebitAndCreditEntriesPayload.localCcyRate;
        } else if (
          chargeAmountField === ChargeAmountFieldEnum.CHARGES_ADDED_AMOUNT
        ) {
          totalChargeAmount =
            letterOfCreditDebitAndCreditEntriesPayload.chargesAddedAmount *
            letterOfCreditDebitAndCreditEntriesPayload.localCcyRate;
        } else if (
          chargeAmountField === ChargeAmountFieldEnum.CHARGES_DEDUCTED_AMOUNT
        ) {
          totalChargeAmount =
            letterOfCreditDebitAndCreditEntriesPayload.chargesDeductedAmount *
            letterOfCreditDebitAndCreditEntriesPayload.localCcyRate;
        } else if (
          chargeAmountField === ChargeAmountFieldEnum.DOCUMENT_AMOUNT
        ) {
          totalChargeAmount =
            letterOfCreditDebitAndCreditEntriesPayload.documentAmount *
            letterOfCreditDebitAndCreditEntriesPayload.localCcyRate;
        } else if (
          chargeAmountField === ChargeAmountFieldEnum.CONFIRMATION_AMOUNT
        ) {
          totalChargeAmount =
            letterOfCreditDebitAndCreditEntriesPayload.confirmationAmount *
            letterOfCreditDebitAndCreditEntriesPayload.localCcyRate;
        } else if (chargeAmountField === ChargeAmountFieldEnum.MARGIN_AMOUNT) {
          totalChargeAmount =
            letterOfCreditDebitAndCreditEntriesPayload.marginAmount *
            letterOfCreditDebitAndCreditEntriesPayload.localCcyRate;
        } else if (
          chargeAmountField === ChargeAmountFieldEnum.PRE_NEGOTIATION_AMOUNT
        ) {
          totalChargeAmount =
            letterOfCreditDebitAndCreditEntriesPayload.preNegotiationAmount *
            letterOfCreditDebitAndCreditEntriesPayload.localCcyRate;
        } else if (
          chargeAmountField === ChargeAmountFieldEnum.COLLATERAL_AMOUNT
        ) {
          totalChargeAmount =
            letterOfCreditDebitAndCreditEntriesPayload.collateralAmount *
            letterOfCreditDebitAndCreditEntriesPayload.localCcyRate;
        } else if (
          chargeAmountField === ChargeAmountFieldEnum.UNCONFIRMED_AMOUNT
        ) {
          totalChargeAmount =
            letterOfCreditDebitAndCreditEntriesPayload.unconfirmedAmount *
            letterOfCreditDebitAndCreditEntriesPayload.localCcyRate;
        } else if (
          chargeAmountField === ChargeAmountFieldEnum.CONFIRMATION_LINE_AMOUNT
        ) {
          totalChargeAmount =
            letterOfCreditDebitAndCreditEntriesPayload.confirmationLineAmount *
            letterOfCreditDebitAndCreditEntriesPayload.localCcyRate;
        } else if (
          chargeAmountField ===
          ChargeAmountFieldEnum.MINIMUM_LETTER_OF_CREDIT_AMOUNT
        ) {
          totalChargeAmount =
            letterOfCreditDebitAndCreditEntriesPayload.minCreditAmountTolerance *
            letterOfCreditDebitAndCreditEntriesPayload.localCcyRate;
        } else if (
          chargeAmountField ===
          ChargeAmountFieldEnum.MAXIMUM_LETTER_OF_CREDIT_AMOUNT
        ) {
          totalChargeAmount =
            letterOfCreditDebitAndCreditEntriesPayload.maxCreditAmountTolerance *
            letterOfCreditDebitAndCreditEntriesPayload.localCcyRate;
        } else if (
          chargeAmountField === ChargeAmountFieldEnum.OUTSTANDING_BALANCE
        ) {
          totalChargeAmount =
            letterOfCreditDebitAndCreditEntriesPayload.outstandingBalance *
            letterOfCreditDebitAndCreditEntriesPayload.localCcyRate;
        } else if (
          chargeAmountField === ChargeAmountFieldEnum.LIABILITY_AMOUNT
        ) {
          totalChargeAmount =
            letterOfCreditDebitAndCreditEntriesPayload.preNegotiationAmount *
            letterOfCreditDebitAndCreditEntriesPayload.localCcyRate;
        }
      } else {
        totalChargeAmount =
          letterOfCreditDebitAndCreditEntriesPayload.localCcyEquivalent;
      }

      if (!totalChargeAmount) {
        throw new BadRequestException(
          `Total charge amount is not specified for ${applicableCharge?.chargeAmountField}`,
        );
      }

      const chargeData =
        await this.productManagementService.calculateChargeEntries(
          applicableCharge?.id,
          totalChargeAmount,
          letterOfCreditDebitAndCreditEntriesPayload.localCurrency,
          token,
          letterOfCreditDebitAndCreditEntriesPayload.applicantAccount,
        );

      if (!chargeData) {
        throw new BadRequestException('Invalid charge data');
      }

      const {
        charge_name,
        charge,
        charge_impacted_ledger,
        chargeApplicableTaxLedgerEntries,
      }: {
        charge_name: any;
        charge: any;
        charge_impacted_ledger: any;
        chargeApplicableTaxLedgerEntries: ApplicableTaxLedgerEntry[];
      } = chargeData;

      debitEntries.push({
        debitAccountNumber:
          letterOfCreditDebitAndCreditEntriesPayload.applicantAccount,
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
                debitAccountNumber:
                  letterOfCreditDebitAndCreditEntriesPayload.applicantAccount,
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

    for (const applicableTax of chargesAndTaxes.applicableTaxes) {
      this.loggerService.debug(
        `applicable tax details - type: ${chargesAndTaxes?.type}; name: ${chargesAndTaxes?.name}`,
        LetterOfCreditService.name,
      );
      if (applicableTax?.applicableRule) {
        const isRuleValid =
          await this.rulesConfigurationService.evaluateRulesForLetterOfCredit(
            applicableTax?.applicableRule?.code,
            token,
            letterOfCreditDebitAndCreditEntriesPayload,
          );

        if (!isRuleValid) {
          continue;
        }
      }

      const totalTaxAmount =
        letterOfCreditDebitAndCreditEntriesPayload.localCcyEquivalent;

      const taxDeductions =
        await this.productManagementService.calculateTaxEntries(
          applicableTax?.id,
          totalTaxAmount,
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
        debitAccountNumber:
          letterOfCreditDebitAndCreditEntriesPayload.applicantAccount,
        debitAmount: tax,
        debitNarration: `${tax_name}`,
      });

      creditEntries.push({
        creditAccountNumber: ledgerCode,
        creditAmount: tax,
        creditNarration: `${tax_name}`,
      });
    }

    return {
      creditEntries,
      debitEntries,
    };
  }

  async handleDebitAndCreditEntries({
    letterOfCreditActionType,
    requestData,
    tradeProductData,
    chargeType,
    token,
    previewData,
  }: {
    letterOfCreditActionType: LetterOfCreditActionTypeEnum;
    requestData?: LetterOfCreditRequest;
    tradeProductData: TradeProductData;
    chargeType: TradeProductFactoryLetterOfCreditChargesAndTaxesTypeEnum;
    token: string;
    previewData?: any;
  }) {
    let letterOfCredit: LetterOfCredit;

    if (
      letterOfCreditActionType !== LetterOfCreditActionTypeEnum.ISSUANCE &&
      letterOfCreditActionType !== LetterOfCreditActionTypeEnum.ADVISEMENT
    ) {
      letterOfCredit = await this.letterOfCreditRepository.findOne({
        where: {
          referenceNumber:
            previewData?.lcReferenceNumber ?? requestData?.lcReferenceNumber,
        },
      });
    }

    if (letterOfCreditActionType === LetterOfCreditActionTypeEnum.FREE_FORMAT) {
      return {
        chargesAndTaxesCreditEntries: [],
        chargesAndTaxesDebitEntries: [],
        postingEntryCreditEntries: [],
        postingEntryDebitEntries: [],
        letterOfCredit,
      };
    }

    const letterOfCreditDebitAndCreditEntriesPayload: LetterOfCreditDebitAndCreditEntriesPayload =
      {
        token,
        localCurrency: tradeProductData.localCurrency,
        applicantAccount:
          previewData?.applicantAccount ??
          requestData?.metadata['applicantAccount'] ??
          letterOfCredit?.applicantAccount,
        applicantBankBicCode:
          previewData?.applicantBankBicCode ??
          requestData?.metadata['applicantBankBicCode'] ??
          letterOfCredit?.applicantBankBicCode,
        beneficiaryBankSwiftCode:
          previewData?.beneficiaryBankSwiftCode ??
          requestData?.metadata['beneficiaryBankSwiftCode'] ??
          letterOfCredit?.beneficiaryBankSwiftCode,
        requestedConfirmationBankBicCode:
          previewData?.requestedConfirmationBankBicCode ??
          requestData?.metadata['requestedConfirmationBankBicCode'] ??
          letterOfCredit?.requestedConfirmationBankBicCode,
        creditAvailableWith:
          previewData?.creditAvailableWith ??
          requestData?.metadata['creditAvailableWith'] ??
          letterOfCredit?.creditAvailableWith,
        creditAvailableWithBankSwiftCode:
          previewData?.creditAvailableWithBankSwiftCode ??
          requestData?.metadata['creditAvailableWithBankSwiftCode'] ??
          letterOfCredit?.creditAvailableWithBankSwiftCode,
        advisingBankBicCode:
          previewData?.advisingBankBicCode ??
          requestData?.metadata['advisingBankBicCode'] ??
          letterOfCredit?.advisingBankBicCode,
        lcAmount:
          previewData?.lcAmount ??
          requestData?.metadata['lcAmount'] ??
          letterOfCredit?.lcAmount,
        lcCurrencyCode:
          previewData?.lcCurrencyCode ??
          requestData?.metadata['lcCurrencyCode'] ??
          letterOfCredit?.lcCurrencyCode,
        localCcyEquivalent:
          previewData?.localCcyEquivalent ??
          requestData?.metadata['localCcyEquivalent'] ??
          letterOfCredit?.localCcyEquivalent,
        localCcyRate:
          previewData?.localCcyRate ??
          requestData?.metadata['localCcyRate'] ??
          letterOfCredit?.localCcyRate,
        confirmationAmount:
          previewData?.confirmationAmount ??
          requestData?.metadata['confirmationAmount'] ??
          letterOfCredit?.confirmationAmount,
        confirmationAmountCurrency:
          previewData?.confirmationAmountCurrency ??
          requestData?.metadata['confirmationAmountCurrency'] ??
          letterOfCredit?.confirmationAmountCurrency,
        marginAmount:
          previewData?.marginAmount ??
          requestData?.metadata['marginAmount'] ??
          letterOfCredit?.marginAmount,
        marginCurrency:
          previewData?.marginCurrency ??
          requestData?.metadata['marginCurrency'] ??
          letterOfCredit?.marginCurrency,
        preNegotiationAmount:
          previewData?.preNegotiationAmount ??
          requestData?.metadata['preNegotiationAmount'] ??
          letterOfCredit?.preNegotiationAmount,
        preNegotiationAmountCurrency:
          previewData?.preNegotationAmountCurrency ??
          requestData?.metadata['preNegotationAmountCurrency'] ??
          letterOfCredit?.preNegotationAmountCurrency,
        preNegotiationStartDate:
          previewData?.preNegotiationStartDate ??
          requestData?.metadata['preNegotiationStartDate'] ??
          letterOfCredit?.preNegotiationStartDate,
        collateralAmount:
          previewData?.collateralAmount ??
          requestData?.metadata['collateralAmount'] ??
          letterOfCredit?.collateralAmount,
        collateralCurrency:
          previewData?.collateralCurrency ??
          requestData?.metadata['collateralCurrency'] ??
          letterOfCredit?.collateralCurrency,
        unconfirmedAmount:
          previewData?.unconfirmedAmount ??
          requestData?.metadata['unconfirmedAmount'] ??
          letterOfCredit?.unconfirmedAmount,
        minCreditAmountTolerance:
          previewData?.minCreditAmountTolerance ??
          requestData?.metadata['minCreditAmountTolerance'] ??
          letterOfCredit?.minCreditAmountTolerance,
        maxCreditAmountTolerance:
          previewData?.maxCreditAmountTolerance ??
          requestData?.metadata['maxCreditAmountTolerance'] ??
          letterOfCredit?.maxCreditAmountTolerance,
        outstandingBalance:
          previewData?.outstandingBalance ??
          requestData?.metadata['outstandingBalance'] ??
          letterOfCredit?.outstandingBalance,
        costOfFundsRate:
          previewData?.costOfFundsRate ??
          requestData?.metadata['costOfFundsRate'] ??
          letterOfCredit?.costOfFundsRate,
        marginRate:
          previewData?.marginRate ??
          requestData?.metadata['marginRate'] ??
          letterOfCredit?.marginRate,
      };

    const creditLine =
      previewData?.creditLine ??
      requestData?.metadata['creditLine'] ??
      letterOfCredit?.creditLine;

    if (creditLine) {
      const creditLineDetails =
        await this.creditLineService.findByAny(creditLine);
      if (creditLineDetails) {
        letterOfCreditDebitAndCreditEntriesPayload.confirmationLineAmount =
          creditLineDetails?.confirmationLineAmount;
      }
    }

    switch (letterOfCreditActionType) {
      case LetterOfCreditActionTypeEnum.ISSUANCE:
        break;
      case LetterOfCreditActionTypeEnum.ADVISEMENT:
        break;
      case LetterOfCreditActionTypeEnum.AMENDMENT:
        letterOfCreditDebitAndCreditEntriesPayload.lcChangeAmount =
          previewData?.lcChangeAmount ??
          requestData?.metadata['lcChangeAmount'];
        letterOfCreditDebitAndCreditEntriesPayload.lcAmountChange =
          previewData?.lcAmountChange ??
          requestData?.metadata['lcAmountChange'];
        letterOfCreditDebitAndCreditEntriesPayload.minCreditAmountTolerance =
          previewData?.minCreditAmountTolerance ??
          requestData?.metadata['minCreditAmountTolerance'];
        letterOfCreditDebitAndCreditEntriesPayload.maxCreditAmountTolerance =
          previewData?.maxCreditAmountTolerance ??
          requestData?.metadata['maxCreditAmountTolerance'];
        break;
      case LetterOfCreditActionTypeEnum.ADJUSTMENT:
        letterOfCreditDebitAndCreditEntriesPayload.lcChangeAmount =
          previewData?.lcChangeAmount ??
          requestData?.metadata['lcChangeAmount'];
        letterOfCreditDebitAndCreditEntriesPayload.lcAmountChange =
          previewData?.lcAmountChange ??
          requestData?.metadata['lcAmountChange'];
        letterOfCreditDebitAndCreditEntriesPayload.minCreditAmountTolerance =
          previewData?.minCreditAmountTolerance ??
          requestData?.metadata['minCreditAmountTolerance'];
        letterOfCreditDebitAndCreditEntriesPayload.maxCreditAmountTolerance =
          previewData?.maxCreditAmountTolerance ??
          requestData?.metadata['maxCreditAmountTolerance'];
        break;
      case LetterOfCreditActionTypeEnum.PAYMENT:
        letterOfCreditDebitAndCreditEntriesPayload.payAmount =
          previewData?.payAmount ?? requestData?.metadata['payAmount'];
        letterOfCreditDebitAndCreditEntriesPayload.payAmountCurrency =
          previewData?.payAmountCurrency ??
          requestData?.metadata['payAmountCurrency'];
        letterOfCreditDebitAndCreditEntriesPayload.presentationAmount =
          previewData?.presentationAmount ??
          requestData?.metadata['presentationAmount'];
        letterOfCreditDebitAndCreditEntriesPayload.presentationAmountCurrency =
          previewData?.presentationAmountCurrency ??
          requestData?.metadata['presentationAmountCurrency'];
        letterOfCreditDebitAndCreditEntriesPayload.additionalAmount =
          previewData?.additionalAmount ??
          requestData?.metadata['additionalAmount'];
        letterOfCreditDebitAndCreditEntriesPayload.additionalAmountCurrency =
          previewData?.additionalAmountCurrency ??
          requestData?.metadata['additionalAmountCurrency'];
        letterOfCreditDebitAndCreditEntriesPayload.totalClaimedAmount =
          previewData?.totalClaimedAmount ??
          requestData?.metadata['totalClaimedAmount'];
        letterOfCreditDebitAndCreditEntriesPayload.totalClaimedAmountCurrency =
          previewData?.totalClaimedAmountCurrency ??
          requestData?.metadata['totalClaimedAmountCurrency'];
        letterOfCreditDebitAndCreditEntriesPayload.chargesAddedAmount =
          previewData?.chargesAddedAmount ??
          requestData?.metadata['chargesAddedAmount'];
        letterOfCreditDebitAndCreditEntriesPayload.chargesAddedCurrency =
          previewData?.chargesAddedCurrency ??
          requestData?.metadata['chargesAddedCurrency'];
        letterOfCreditDebitAndCreditEntriesPayload.chargesDeductedAmount =
          previewData?.chargesDeductedAmount ??
          requestData?.metadata['chargesDeductedAmount'];
        letterOfCreditDebitAndCreditEntriesPayload.chargesDeductedCurrency =
          previewData?.chargesDeductedCurrency ??
          requestData?.metadata['chargesDeductedCurrency'];
        break;
      case LetterOfCreditActionTypeEnum.DOCUMENT_LODGEMENT:
        letterOfCreditDebitAndCreditEntriesPayload.documentAmount =
          previewData?.documentAmount ??
          requestData?.metadata['documentAmount'];
        letterOfCreditDebitAndCreditEntriesPayload.documentAmountCurrency =
          previewData?.documentAmountCurrency ??
          requestData?.metadata['documentAmountCurrency'];
        break;
      case LetterOfCreditActionTypeEnum.CANCELLATION:
        break;
      default:
        throw new BadRequestException('Invalid letter of credit action type');
    }

    if (
      letterOfCreditActionType === LetterOfCreditActionTypeEnum.AMENDMENT ||
      letterOfCreditActionType === LetterOfCreditActionTypeEnum.ADJUSTMENT
    ) {
      letterOfCreditDebitAndCreditEntriesPayload.lcAmount =
        letterOfCreditDebitAndCreditEntriesPayload.lcAmountChange ===
        LetterOfCreditAmountChangeEnum.INCREASE
          ? letterOfCreditDebitAndCreditEntriesPayload.lcAmount +
            letterOfCreditDebitAndCreditEntriesPayload.lcChangeAmount
          : letterOfCreditDebitAndCreditEntriesPayload.lcAmount -
            letterOfCreditDebitAndCreditEntriesPayload.lcChangeAmount;
    }

    letterOfCreditDebitAndCreditEntriesPayload.minCreditAmountTolerance =
      letterOfCreditDebitAndCreditEntriesPayload.lcAmount -
      (letterOfCreditDebitAndCreditEntriesPayload.lcAmount *
        letterOfCreditDebitAndCreditEntriesPayload.minCreditAmountTolerance!) /
        100;

    letterOfCreditDebitAndCreditEntriesPayload.maxCreditAmountTolerance =
      letterOfCreditDebitAndCreditEntriesPayload.lcAmount +
      (letterOfCreditDebitAndCreditEntriesPayload.lcAmount *
        letterOfCreditDebitAndCreditEntriesPayload.maxCreditAmountTolerance!) /
        100;

    letterOfCreditDebitAndCreditEntriesPayload.previousIssueDate =
      letterOfCredit?.issueDate;
    letterOfCreditDebitAndCreditEntriesPayload.previousExpiryDate =
      letterOfCredit?.expiryDate;
    letterOfCreditDebitAndCreditEntriesPayload.previousLatestShipmentDate =
      letterOfCredit?.latestShipmentDate;

    const lcChargesAndTaxes = tradeProductData.chargesAndTaxes?.find(
      (item: ChargeAndTax) => item.type === chargeType,
    );

    const accountingEntry = tradeProductData?.accountingEntries?.find(
      (item: AccountingEntry) => item.type === chargeType,
    );

    if (!lcChargesAndTaxes) {
      throw new BadRequestException(
        `LC ${chargeType} charges and taxes not found`,
      );
    }

    const {
      creditEntries: chargesAndTaxesCreditEntries,
      debitEntries: chargesAndTaxesDebitEntries,
    } = await this.handleChargesAndTaxes(
      letterOfCreditDebitAndCreditEntriesPayload,
      lcChargesAndTaxes,
      token,
    );

    let postingEntryCreditEntries = [];
    let postingEntryDebitEntries = [];

    const result = await this.handlePostingEntries(
      letterOfCreditDebitAndCreditEntriesPayload,
      accountingEntry,
      token,
    );
    postingEntryCreditEntries = result.creditEntries;
    postingEntryDebitEntries = result.debitEntries;

    return {
      chargesAndTaxesCreditEntries,
      chargesAndTaxesDebitEntries,
      postingEntryCreditEntries,
      postingEntryDebitEntries,
      letterOfCredit,
    };
  }

  async handleApproval({
    requestData,
    approverBranchCode,
    tradeProductData,
    transaction,
    token,
    chargeType,
  }: {
    requestData: LetterOfCreditRequest;
    approverBranchCode: string;
    tradeProductData: TradeProductData;
    transaction: Transaction;
    token: string;
    chargeType: TradeProductFactoryLetterOfCreditChargesAndTaxesTypeEnum;
  }) {
    const {
      chargesAndTaxesCreditEntries,
      chargesAndTaxesDebitEntries,
      postingEntryDebitEntries,
      postingEntryCreditEntries,
      letterOfCredit,
    } = await this.handleDebitAndCreditEntries({
      letterOfCreditActionType: requestData.letterOfCreditActionType,
      requestData,
      tradeProductData,
      chargeType,
      token,
    });

    let postingEntryTransactionId: string;
    let transactionReversalId: string;
    let chargesAndTaxesTransactionId: string;
    let paymentAmountDelta = 0;

    if (
      chargesAndTaxesDebitEntries.length !== 0 ||
      chargesAndTaxesCreditEntries.length !== 0
    ) {
      const journalPostingRequestBody = createJournalPostingRequestBody({
        userId: requestData.initiatorId,
        branchCode: requestData.initiatorBranchCode,
        currencyShortCode: tradeProductData.localCurrency,
        requestId: `${moment.utc().format('YYMMDD')}${this.nanoid()}`,
        debitEntries: chargesAndTaxesDebitEntries,
        creditEntries: chargesAndTaxesCreditEntries,
        initiatedBy: requestData.initiatorId,
        approvedByBranchCode: approverBranchCode,
        reconciliationRemarks: `LC ${requestData.letterOfCreditActionType} Charges and Taxes`,
      });

      const journalPostingResponse = await this.camsService.postToJournal(
        journalPostingRequestBody,
        token,
      );

      chargesAndTaxesTransactionId =
        journalPostingResponse?.value?.transactionId;

      await this.letterOfCreditPendingRequestJournalReversalQueue.add(
        `${requestData.requestId}`,
        {
          requestId: requestData.requestId,
          transactionId: chargesAndTaxesTransactionId,
        },
        { delay: 60000 },
      );
    }

    if (
      postingEntryDebitEntries.length !== 0 ||
      postingEntryCreditEntries.length !== 0
    ) {
      if (
        requestData.letterOfCreditActionType ===
        LetterOfCreditActionTypeEnum.PAYMENT
      ) {
        for (const entry of postingEntryDebitEntries) {
          paymentAmountDelta += entry.debitAmount;
        }
      }

      const journalPostingRequestBody = createJournalPostingRequestBody({
        userId: requestData.initiatorId,
        branchCode: requestData.initiatorBranchCode,
        currencyShortCode:
          requestData?.metadata['lcCurrencyCode'] ??
          letterOfCredit?.lcCurrencyCode,
        requestId: `${moment.utc().format('YYMMDD')}${this.nanoid()}`,
        debitEntries: postingEntryDebitEntries,
        creditEntries: postingEntryCreditEntries,
        initiatedBy: requestData.initiatorId,
        approvedByBranchCode: approverBranchCode,
        reconciliationRemarks: `LC ${requestData.letterOfCreditActionType} Posting Entries`,
      });

      const journalPostingResponse = await this.camsService.postToJournal(
        journalPostingRequestBody,
        token,
      );

      postingEntryTransactionId = journalPostingResponse?.value?.transactionId;

      await this.letterOfCreditPendingRequestJournalReversalQueue.add(
        `${requestData.requestId}`,
        {
          requestId: requestData.requestId,
          transactionId: postingEntryTransactionId,
        },
        { delay: 60000 },
      );
    }

    const referenceNumber =
      requestData?.lcReferenceNumber ??
      (await this.generateReferenceNumber(
        requestData.letterOfCreditProductType,
        tradeProductData.slogan,
      ));

    if (
      requestData.letterOfCreditActionType ===
        LetterOfCreditActionTypeEnum.PRE_ISSUANCE ||
      (requestData.letterOfCreditActionType ===
        LetterOfCreditActionTypeEnum.ISSUANCE &&
        !requestData.metadata['isPreIssued']) ||
      requestData.letterOfCreditActionType ===
        LetterOfCreditActionTypeEnum.ADVISEMENT
    ) {
      const letterOfCredit = await this.letterOfCreditRepository.create(
        {
          ...requestData?.metadata,
          referenceNumber,
          requestId: requestData.requestId,
        },
        { transaction },
      );

      if (
        requestData.letterOfCreditActionType ===
        LetterOfCreditActionTypeEnum.ISSUANCE
      ) {
        await this.swiftMessageQueue.add(
          SwiftMessageJobActionEnum.GENERATE_MT_700_AND_UPLOAD,
          { data: letterOfCredit, requestId: requestData.requestId },
          { delay: 60000 },
        );

        if (requestData.metadata['beneficiaryInstituitionAccount']) {
          await this.swiftMessageQueue.add(
            SwiftMessageJobActionEnum.GENERATE_MT_202_AND_UPLOAD,
            { data: letterOfCredit, requestId: requestData.requestId },
            { delay: 60000 },
          );
        }

        if (requestData.metadata['saveAsTemplate']) {
          await this.letterOfCreditTemplateRepository.create({
            templateName:
              requestData.metadata['templateName'] ??
              `${requestData.metadata['applicantName']}-${letterOfCredit?.referenceNumber}-${this.nanoid()}`,
            lcReferenceNumber: letterOfCredit?.referenceNumber,
          });
        }

        await this.letterOfCreditExpiryQueue.add(
          `${letterOfCredit?.referenceNumber}`,
          {
            lcReferenceNumber: letterOfCredit?.referenceNumber,
          },
          {
            delay: moment
              .tz(letterOfCredit?.expiryDate, IANATimeZoneDatabaseEnum.LAGOS)
              .diff(moment.tz(IANATimeZoneDatabaseEnum.LAGOS)),
          },
        );
      } else if (
        requestData.letterOfCreditActionType ===
        LetterOfCreditActionTypeEnum.ADVISEMENT
      ) {
        await this.swiftMessageQueue.add(
          SwiftMessageJobActionEnum.GENERATE_MT_730_AND_UPLOAD,
          { data: letterOfCredit, requestId: requestData.requestId },
          { delay: 60000 },
        );
      }
    } else if (
      requestData.letterOfCreditActionType ===
        LetterOfCreditActionTypeEnum.AMENDMENT ||
      requestData.letterOfCreditActionType ===
        LetterOfCreditActionTypeEnum.ADJUSTMENT
    ) {
      if (
        requestData.metadata['lcAmountChange'] ===
        LetterOfCreditAmountChangeEnum.INCREASE
      ) {
        requestData.metadata['lcAmount'] +=
          requestData.metadata['lcChangeAmount'];
      } else if (
        requestData.metadata['lcAmountChange'] ===
        LetterOfCreditAmountChangeEnum.DECREASE
      ) {
        requestData.metadata['lcAmount'] -=
          requestData.metadata['lcChangeAmount'];
      }

      requestData.metadata['previousIssueDate'] =
        requestData.metadata['issueDate'];

      requestData.metadata['previousExpiryDate'] =
        requestData.metadata['expiryDate'];

      requestData.metadata['previousLatestShipmentDate'] =
        requestData.metadata['latestShipmentDate'];

      await this.letterOfCreditRepository.update(requestData.metadata, {
        where: {
          referenceNumber,
        },
        transaction,
      });

      if (
        requestData.letterOfCreditActionType ===
        LetterOfCreditActionTypeEnum.AMENDMENT
      ) {
        await this.swiftMessageQueue.add(
          SwiftMessageJobActionEnum.GENERATE_MT_707_AND_UPLOAD,
          {
            data: requestData?.metadata,
            requestId: requestData.requestId,
            letterOfCredit,
          },
          { delay: 60000 },
        );

        if (requestData.metadata['beneficiaryInstituitionAccount']) {
          await this.swiftMessageQueue.add(
            SwiftMessageJobActionEnum.GENERATE_MT_202_AND_UPLOAD,
            {
              data: requestData?.metadata,
              requestId: requestData.requestId,
              letterOfCredit,
            },
            { delay: 60000 },
          );
        }
      }
    } else if (
      requestData.letterOfCreditActionType ===
        LetterOfCreditActionTypeEnum.PAYMENT &&
      requestData.metadata['paymentTransferMethod'] ===
        PaymentTransferMethodEnum.SWIFT
    ) {
      await this.swiftMessageQueue.add(
        SwiftMessageJobActionEnum.GENERATE_MT_752_AND_UPLOAD,
        {
          data: requestData?.metadata,
          requestId: requestData.requestId,
          letterOfCredit,
        },
        { delay: 60000 },
      );
      if (
        requestData.metadata['paymentActionType'] ===
          PaymentActionTypeEnum.PAY ||
        requestData.metadata['paymentActionType'] ===
          PaymentActionTypeEnum.PAY_AT_MATURITY ||
        requestData.metadata['paymentActionType'] ===
          PaymentActionTypeEnum.PAY_WITH_FINANCING
      ) {
        await this.swiftMessageQueue.add(
          SwiftMessageJobActionEnum.GENERATE_MT_202_AND_UPLOAD,
          {
            data: requestData?.metadata,
            requestId: requestData.requestId,
            letterOfCredit,
          },
          { delay: 60000 },
        );
      }
    } else if (
      requestData.letterOfCreditActionType ===
      LetterOfCreditActionTypeEnum.CANCELLATION
    ) {
      const postingEntryTransactionArray =
        letterOfCredit?.postingEntryTransactionArray;
      const valueToUpdate: Partial<LetterOfCredit> = {
        postingEntryTransactionArray: [],
      };

      const transactionIdsToReverse: TransactionReversal[] = [];

      for (const postingTransactionEntry of postingEntryTransactionArray) {
        if (
          postingTransactionEntry?.isReversed === false &&
          postingTransactionEntry?.letterOfCreditActionType !==
            LetterOfCreditActionTypeEnum.CANCELLATION
        ) {
          transactionIdsToReverse.push({
            transactionId: postingTransactionEntry?.transactionId,
          });
        }

        valueToUpdate.postingEntryTransactionArray.push({
          letterOfCreditActionType:
            postingTransactionEntry?.letterOfCreditActionType,
          transactionId: postingTransactionEntry?.transactionId,
          isReversed:
            postingTransactionEntry?.letterOfCreditActionType !==
            LetterOfCreditActionTypeEnum.CANCELLATION
              ? true
              : false,
        });
      }

      const batchId = uuidv7();

      const journalPostingResponse =
        await this.camsService.bulkReverseJournalPosting(
          {
            batchId,
            modifiedBy: requestData.initiatorId,
            transactions: transactionIdsToReverse,
          },
          token,
        );

      transactionReversalId = journalPostingResponse?.value?.transactionId;

      await this.letterOfCreditRepository.update(
        {
          state: LetterOfCreditStateEnum.INACTIVE,
          status: LetterOfCreditActionTypeEnum.CANCELLATION,
          ...valueToUpdate,
        },
        {
          where: {
            referenceNumber,
          },
          transaction,
        },
      );
    } else if (
      requestData.letterOfCreditActionType ===
      LetterOfCreditActionTypeEnum.FREE_FORMAT
    ) {
      await this.swiftMessageQueue.add(
        requestData.metadata['swiftMessageType'] ===
          LetterOfCreditFreeFormaSwifttMessageTypeEnum.MT_799
          ? SwiftMessageJobActionEnum.GENERATE_MT_799_AND_UPLOAD
          : SwiftMessageJobActionEnum.GENERATE_MT_999_AND_UPLOAD,
        {
          data: requestData?.metadata,
          requestId: requestData.requestId,
          letterOfCredit,
        },
        { delay: 60000 },
      );
    }

    const actionType = requestData.letterOfCreditActionType;

    if (chargesAndTaxesTransactionId) {
      await this.letterOfCreditRepository.appendChargesAndTaxesTransaction(
        referenceNumber,
        {
          letterOfCreditActionType: actionType,
          transactionId: chargesAndTaxesTransactionId,
        },
        { transaction },
      );
    }

    if (postingEntryTransactionId) {
      await this.letterOfCreditRepository.appendPostingEntryTransaction(
        referenceNumber,
        {
          letterOfCreditActionType: actionType,
          transactionId: postingEntryTransactionId,
          isReversed: false,
          transactionReversalId,
        },
        { transaction },
      );
    }

    if (
      requestData.letterOfCreditActionType !==
      LetterOfCreditActionTypeEnum.PRE_ISSUANCE
    ) {
      if (postingEntryTransactionId) {
        const accountingEntry = tradeProductData?.accountingEntries?.find(
          (item: AccountingEntry) => item.type === chargeType,
        );
        let marginDelta = 0;
        let liabilityDelta = 0;
        const marginAmount = letterOfCredit?.marginAmount ?? 0;
        const liabilityAmount = letterOfCredit?.confirmationAmount ?? 0;

        for (const entry of accountingEntry?.postingEntries ?? []) {
          if (
            entry?.postingAmountField !== PostingAmountFieldEnum.MARGIN_AMOUNT
          ) {
            continue;
          }
          if (entry?.marginType === MarginTypeEnum.MARGIN) {
            marginDelta += marginAmount;
          } else if (entry?.marginType === MarginTypeEnum.REVERSE_MARGIN) {
            marginDelta -= marginAmount;
          }
        }

        for (const entry of accountingEntry?.postingEntries ?? []) {
          if (
            entry?.postingAmountField !==
            PostingAmountFieldEnum.CONFIRMATION_AMOUNT
          ) {
            continue;
          }
          if (entry?.contingencyType === ContingencyTypeEnum.CONTINGENT) {
            liabilityDelta += liabilityAmount;
          } else if (
            entry?.contingencyType === ContingencyTypeEnum.REVERSE_CONTINGENT
          ) {
            liabilityDelta -= liabilityAmount;
          }
        }

        let totalPaymentAmount = letterOfCredit?.totalPaymentAmount ?? 0;
        if (
          requestData.letterOfCreditActionType ===
          LetterOfCreditActionTypeEnum.PAYMENT
        ) {
          totalPaymentAmount += paymentAmountDelta;
          letterOfCredit.preNegotiationAmount -= totalPaymentAmount;
          letterOfCredit.confirmationAmount -= totalPaymentAmount;
          letterOfCredit.outstandingBalance =
            letterOfCredit.lcAmount +
            letterOfCredit.maxCreditAmountTolerance * letterOfCredit.lcAmount -
            totalPaymentAmount;
        }

        const currentMarginAmount = letterOfCredit?.marginAmount ?? 0;
        const newMarginAmount = currentMarginAmount + marginDelta;

        const currentLiabilityAmount =
          letterOfCredit?.preNegotiationAmount ?? 0;
        const newLiabilityAmount = currentLiabilityAmount + liabilityDelta;

        const postingUpdatePayload: Partial<LetterOfCredit> = {};

        if (marginDelta !== 0) {
          postingUpdatePayload.marginAmount = newMarginAmount;
        }

        if (liabilityDelta !== 0) {
          postingUpdatePayload.confirmationAmount = newLiabilityAmount;
          postingUpdatePayload.preNegotiationAmount = newLiabilityAmount;
        }

        if (totalPaymentAmount !== 0) {
          postingUpdatePayload.totalPaymentAmount = totalPaymentAmount;
        }

        await this.letterOfCreditRepository.update(postingUpdatePayload, {
          where: {
            referenceNumber,
          },
          transaction,
        });
      }
    }
  }

  async initiate(
    data: IssueLetterOfCreditDto | AdviseLetterOfCreditDto,
  ): Promise<LetterOfCreditRequest> {
    const { userPermissions, token, ...filterData } = data;

    const tradeProductData =
      await this.tradeProductFactoryService.getProductDetails(
        data?.tradeProductId,
        token,
      );

    let matchingLetterOfCreditRequest: LetterOfCreditRequest;

    if (
      tradeProductData?.regulatoryFormRequired !==
      RegulatoryFormRequiredEnum.NONE
    ) {
      const regulatoryForm =
        await this.regulatoryFormService.getRegulatoryFormRecord(
          data?.applicationNumber,
          LetterOfCreditProductTypeEnum.IMPORT ===
            data?.letterOfCreditProductType
            ? RegulatoryFormTypeEnum.FORM_M
            : RegulatoryFormTypeEnum.FORM_NXP,
        );

      if (!regulatoryForm?.isCustomerAccountValid) {
        throw new BadRequestException(
          'Regulatory Form failed Customer Account validation',
        );
      } else if (!regulatoryForm?.isAccountRestrictionValid) {
        throw new BadRequestException(
          'Regulatory Form failed Account Restriction validation',
        );
      } else if (!regulatoryForm?.isBalanceEnquiryValid) {
        throw new BadRequestException(
          'Regulatory Form failed Balance Enquiry validation',
        );
      }

      if (
        regulatoryForm?.status === RegulatoryFormStatusEnum.SUBMITTED ||
        regulatoryForm?.status === RegulatoryFormStatusEnum.QUERY
      ) {
        throw new BadRequestException(
          'Regulatory Form with either Submitted or Query status can not be used to issue a letter of credit',
        );
      }

      if (regulatoryForm?.isTaken) {
        throw new BadRequestException(
          'Regulatory Form has already been used for an existing application',
        );
      }

      const existingLetterOfCreditRequest =
        await this.letterOfCreditRequestRepository.findOne({
          where: {
            applicationNumber: data?.applicationNumber,
            letterOfCreditActionType: data?.letterOfCreditActionType,
            approvalStatus: { [Op.not]: ApprovalStatusEnum.REJECTED },
          },
        });
      if (existingLetterOfCreditRequest) {
        throw new BadRequestException(
          'A matching Letter of Credit request that is not rejected is tied to the same application number already exists',
        );
      }
    }

    let existingLetterOfCreditRequest: LetterOfCreditRequest;

    if (data?.requestId) {
      existingLetterOfCreditRequest =
        await this.letterOfCreditRequestRepository.findOne({
          where: {
            requestId: data?.requestId,
            approvalStatus: { [Op.not]: ApprovalStatusEnum.REJECTED },
          },
        });
    }

    if (existingLetterOfCreditRequest && !data?.isDraft) {
      throw new BadRequestException(
        'A matching Letter of Credit request that is not rejected exists and is not marked as draft.',
      );
    }

    if (!existingLetterOfCreditRequest && data?.isDraft) {
      throw new BadRequestException(
        'Request is marked as updating a draft and a matching request with the same reference ID and in Draft state can not be found.',
      );
    }

    if (
      data?.letterOfCreditActionType === LetterOfCreditActionTypeEnum.ISSUANCE
    ) {
      await this.validateLetterOfCredit(
        data,
        tradeProductData,
        token,
        LetterOfCreditActionTypeEnum.ISSUANCE,
      );
    }

    let letterOfCreditRequestData: LetterOfCreditRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (
          (tradeProductData?.regulatoryFormRequired !==
            RegulatoryFormRequiredEnum.NONE &&
            !matchingLetterOfCreditRequest) ||
          matchingLetterOfCreditRequest?.requestStatus !==
            RequestStatusEnum.DRAFT
        ) {
          throw new BadRequestException(
            'Request is marked as updating a draft and a matching request with the same application number and in Draft state can not be found.',
          );
        }
        [, [letterOfCreditRequestData]] =
          await this.letterOfCreditRequestRepository.update(
            {
              letterOfCreditActionType: data?.letterOfCreditActionType,
              letterOfCreditProductType: data?.letterOfCreditProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              applicationNumber: data?.applicationNumber,
              metadata: filterData,
            },
            {
              where: {
                requestId: data?.requestId,
              },
              transaction,
            },
          );
      } else {
        letterOfCreditRequestData =
          await this.letterOfCreditRequestRepository.create(
            {
              letterOfCreditActionType: data?.letterOfCreditActionType,
              letterOfCreditProductType: data?.letterOfCreditProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              tenantId: data?.tenantId,
              applicationNumber: data?.applicationNumber,
              metadata: filterData,
            },
            { transaction },
          );
      }

      if (userPermissions.includes(PermissionEnum.AUTHORISE_LETTER_OF_CREDIT)) {
        await this.handleApproval({
          requestData: letterOfCreditRequestData,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryLetterOfCreditChargesAndTaxesTypeEnum.ISSUANCE,
          approverBranchCode: data?.initiatorBranchCode,
          transaction,
        });

        await this.letterOfCreditRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: letterOfCreditRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await letterOfCreditRequestData.reload();

    return letterOfCreditRequestData;
  }

  async amend(data: AmendLetterOfCreditDto): Promise<LetterOfCreditRequest> {
    const { userPermissions, token, ...filterData } = data;

    const { letterOfCredit, tradeProductData, existingLetterOfCreditRequest } =
      await this.validateActionRequestAndGetTradeProductData({
        data: {
          lcReferenceNumber: data.lcReferenceNumber,
          requestId: data?.requestId,
          isDraft: data?.isDraft,
          letterOfCreditActionType: data?.letterOfCreditActionType,
        },
        token,
      });

    let letterOfCreditRequestData: LetterOfCreditRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingLetterOfCreditRequest) {
          throw new BadRequestException(
            'Letter of Credit Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [letterOfCreditRequestData]] =
          await this.letterOfCreditRequestRepository.update(
            {
              letterOfCreditActionType: data?.letterOfCreditActionType,
              letterOfCreditProductType: data?.letterOfCreditProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              applicationNumber: letterOfCredit?.applicationNumber,
              lcReferenceNumber: letterOfCredit?.referenceNumber,
              metadata: filterData,
            },
            {
              where: {
                requestId: letterOfCreditRequestData?.requestId,
              },
              transaction,
            },
          );

        await this.letterOfCreditAmendmentRepository.update(
          { ...filterData },
          {
            where: {
              requestId: letterOfCreditRequestData?.requestId,
            },
            transaction,
          },
        );
      } else {
        letterOfCreditRequestData =
          await this.letterOfCreditRequestRepository.create(
            {
              letterOfCreditActionType: data?.letterOfCreditActionType,
              letterOfCreditProductType: data?.letterOfCreditProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              tenantId: data?.tenantId,
              applicationNumber: letterOfCredit?.applicationNumber,
              lcReferenceNumber: letterOfCredit?.referenceNumber,
              metadata: filterData,
            },
            { transaction },
          );
      }

      await this.letterOfCreditAmendmentRepository.create(
        {
          ...filterData,
          requestId: letterOfCreditRequestData?.requestId,
        },
        { transaction },
      );

      if (userPermissions.includes(PermissionEnum.AUTHORISE_LETTER_OF_CREDIT)) {
        await this.handleApproval({
          requestData: letterOfCreditRequestData,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryLetterOfCreditChargesAndTaxesTypeEnum.AMENDMENT,
          approverBranchCode: data?.initiatorBranchCode,
          transaction,
        });

        await this.letterOfCreditRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: letterOfCreditRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await letterOfCreditRequestData.reload();

    return letterOfCreditRequestData;
  }

  async adjust(data: AdjustLetterOfCreditDto): Promise<LetterOfCreditRequest> {
    const { userPermissions, token, ...filterData } = data;

    const { letterOfCredit, tradeProductData, existingLetterOfCreditRequest } =
      await this.validateActionRequestAndGetTradeProductData({
        data: {
          lcReferenceNumber: data.lcReferenceNumber,
          requestId: data?.requestId,
          isDraft: data?.isDraft,
          letterOfCreditActionType: data?.letterOfCreditActionType,
        },
        token,
      });

    let letterOfCreditRequestData: LetterOfCreditRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingLetterOfCreditRequest) {
          throw new BadRequestException(
            'Letter of Credit Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [letterOfCreditRequestData]] =
          await this.letterOfCreditRequestRepository.update(
            {
              letterOfCreditActionType: data?.letterOfCreditActionType,
              letterOfCreditProductType: data?.letterOfCreditProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              applicationNumber: letterOfCredit?.applicationNumber,
              lcReferenceNumber: letterOfCredit?.referenceNumber,
              metadata: filterData,
            },
            {
              where: {
                requestId: letterOfCreditRequestData?.requestId,
              },
              transaction,
            },
          );

        await this.letterOfCreditAdjustmentRepository.update(
          { ...filterData },
          {
            where: {
              requestId: letterOfCreditRequestData?.requestId,
            },
            transaction,
          },
        );
      } else {
        letterOfCreditRequestData =
          await this.letterOfCreditRequestRepository.create(
            {
              letterOfCreditActionType: data?.letterOfCreditActionType,
              letterOfCreditProductType: data?.letterOfCreditProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              tenantId: data?.tenantId,
              applicationNumber: letterOfCredit?.applicationNumber,
              lcReferenceNumber: letterOfCredit?.referenceNumber,
              metadata: filterData,
            },
            { transaction },
          );
      }

      await this.letterOfCreditAdjustmentRepository.create(
        {
          ...filterData,
          requestId: letterOfCreditRequestData?.requestId,
        },
        { transaction },
      );

      if (userPermissions.includes(PermissionEnum.AUTHORISE_LETTER_OF_CREDIT)) {
        await this.handleApproval({
          requestData: letterOfCreditRequestData,
          approverBranchCode: data?.initiatorBranchCode,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryLetterOfCreditChargesAndTaxesTypeEnum.ADJUSTMENT,
          transaction,
        });

        await this.letterOfCreditRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: letterOfCreditRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await letterOfCreditRequestData.reload();

    return letterOfCreditRequestData;
  }

  async payment(
    data: LetterOfCreditPaymentDto,
  ): Promise<LetterOfCreditRequest> {
    const { userPermissions, token, ...filterData } = data;

    const { letterOfCredit, tradeProductData, existingLetterOfCreditRequest } =
      await this.validateActionRequestAndGetTradeProductData({
        data: {
          lcReferenceNumber: data.lcReferenceNumber,
          requestId: data?.requestId,
          isDraft: data?.isDraft,
          letterOfCreditActionType: data?.letterOfCreditActionType,
        },
        token,
      });

    let letterOfCreditRequestData: LetterOfCreditRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingLetterOfCreditRequest) {
          throw new BadRequestException(
            'Letter of Credit Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [letterOfCreditRequestData]] =
          await this.letterOfCreditRequestRepository.update(
            {
              letterOfCreditActionType: data?.letterOfCreditActionType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              applicationNumber: letterOfCredit?.applicationNumber,
              lcReferenceNumber: letterOfCredit?.referenceNumber,
              metadata: filterData,
            },
            {
              where: {
                requestId: letterOfCreditRequestData?.requestId,
              },
              transaction,
            },
          );

        await this.letterOfCreditPaymentRepository.update(
          { ...filterData },
          {
            where: {
              requestId: letterOfCreditRequestData?.requestId,
            },
            transaction,
          },
        );
      } else {
        letterOfCreditRequestData =
          await this.letterOfCreditRequestRepository.create(
            {
              letterOfCreditActionType: data?.letterOfCreditActionType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              tenantId: data?.tenantId,
              applicationNumber: letterOfCredit?.applicationNumber,
              lcReferenceNumber: letterOfCredit?.referenceNumber,
              metadata: filterData,
            },
            { transaction },
          );
      }

      await this.letterOfCreditPaymentRepository.create(
        {
          ...filterData,
          requestId: letterOfCreditRequestData?.requestId,
        },
        { transaction },
      );

      if (userPermissions.includes(PermissionEnum.AUTHORISE_LETTER_OF_CREDIT)) {
        await this.handleApproval({
          requestData: letterOfCreditRequestData,
          approverBranchCode: data?.initiatorBranchCode,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryLetterOfCreditChargesAndTaxesTypeEnum.PAYMENT,
          transaction,
        });

        await this.letterOfCreditRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: letterOfCreditRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await letterOfCreditRequestData.reload();

    return letterOfCreditRequestData;
  }

  async assignmentOfProceed(
    data: LetterOfCreditAssignmentOfProceedDto,
  ): Promise<LetterOfCreditRequest> {
    const { userPermissions, token, ...filterData } = data;

    const { letterOfCredit, tradeProductData, existingLetterOfCreditRequest } =
      await this.validateActionRequestAndGetTradeProductData({
        data: {
          lcReferenceNumber: data.lcReferenceNumber,
          requestId: data?.requestId,
          isDraft: data?.isDraft,
          letterOfCreditActionType: data?.letterOfCreditActionType,
        },
        token,
      });

    let letterOfCreditRequestData: LetterOfCreditRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingLetterOfCreditRequest) {
          throw new BadRequestException(
            'Letter of Credit Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [letterOfCreditRequestData]] =
          await this.letterOfCreditRequestRepository.update(
            {
              letterOfCreditActionType: data?.letterOfCreditActionType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              applicationNumber: letterOfCredit?.applicationNumber,
              lcReferenceNumber: letterOfCredit?.referenceNumber,
              metadata: filterData,
            },
            {
              where: {
                requestId: letterOfCreditRequestData?.requestId,
              },
              transaction,
            },
          );

        await this.letterOfCreditAssignmentOfProceedRepository.update(
          { ...filterData },
          {
            where: {
              requestId: letterOfCreditRequestData?.requestId,
            },
            transaction,
          },
        );
      } else {
        letterOfCreditRequestData =
          await this.letterOfCreditRequestRepository.create(
            {
              letterOfCreditActionType: data?.letterOfCreditActionType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              tenantId: data?.tenantId,
              applicationNumber: letterOfCredit?.applicationNumber,
              lcReferenceNumber: letterOfCredit?.referenceNumber,
              metadata: filterData,
            },
            { transaction },
          );
      }

      await this.letterOfCreditAssignmentOfProceedRepository.create(
        {
          ...filterData,
          requestId: letterOfCreditRequestData?.requestId,
          assignments: data?.assignments,
        },
        { transaction },
      );

      if (userPermissions.includes(PermissionEnum.AUTHORISE_LETTER_OF_CREDIT)) {
        await this.handleApproval({
          requestData: letterOfCreditRequestData,
          approverBranchCode: data?.initiatorBranchCode,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryLetterOfCreditChargesAndTaxesTypeEnum.ASSIGNMENT_OF_PROCEED,
          transaction,
        });

        await this.letterOfCreditRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: letterOfCreditRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await letterOfCreditRequestData.reload();

    return letterOfCreditRequestData;
  }

  async documentLodgement(
    data: LetterOfCreditDocumentLodgmentDto,
  ): Promise<LetterOfCreditRequest> {
    const { userPermissions, token, ...filterData } = data;

    const { letterOfCredit, tradeProductData, existingLetterOfCreditRequest } =
      await this.validateActionRequestAndGetTradeProductData({
        data: {
          lcReferenceNumber: data.lcReferenceNumber,
          requestId: data?.requestId,
          isDraft: data?.isDraft,
          letterOfCreditActionType: data?.letterOfCreditActionType,
        },
        token,
      });

    let letterOfCreditRequestData: LetterOfCreditRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingLetterOfCreditRequest) {
          throw new BadRequestException(
            'Letter of Credit Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [letterOfCreditRequestData]] =
          await this.letterOfCreditRequestRepository.update(
            {
              letterOfCreditActionType: data?.letterOfCreditActionType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              applicationNumber: letterOfCredit?.applicationNumber,
              lcReferenceNumber: letterOfCredit?.referenceNumber,
              metadata: filterData,
            },
            {
              where: {
                requestId: letterOfCreditRequestData?.requestId,
              },
              transaction,
            },
          );

        await this.letterOfCreditDocumentLodgementRepository.update(
          { ...filterData },
          {
            where: {
              requestId: letterOfCreditRequestData?.requestId,
            },
            transaction,
          },
        );
      } else {
        letterOfCreditRequestData =
          await this.letterOfCreditRequestRepository.create(
            {
              letterOfCreditActionType:
                LetterOfCreditActionTypeEnum.DOCUMENT_LODGEMENT,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              tenantId: data?.tenantId,
              lcReferenceNumber: data?.lcReferenceNumber,
              metadata: filterData,
            },
            { transaction },
          );
      }

      await this.letterOfCreditDocumentLodgementRepository.create(
        {
          ...filterData,
          requestId: letterOfCreditRequestData?.requestId,
        },
        { transaction },
      );

      if (userPermissions.includes(PermissionEnum.AUTHORISE_LETTER_OF_CREDIT)) {
        await this.handleApproval({
          requestData: letterOfCreditRequestData,
          approverBranchCode: data?.initiatorBranchCode,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryLetterOfCreditChargesAndTaxesTypeEnum.DOCUMENT_LODGEMENT,
          transaction,
        });

        await this.letterOfCreditRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: letterOfCreditRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await letterOfCreditRequestData.reload();

    return letterOfCreditRequestData;
  }

  async cancel(data: CancelLetterOfCreditDto): Promise<LetterOfCreditRequest> {
    const { userPermissions, token, ...filterData } = data;

    const { letterOfCredit, tradeProductData, existingLetterOfCreditRequest } =
      await this.validateActionRequestAndGetTradeProductData({
        data: {
          lcReferenceNumber: data.lcReferenceNumber,
          requestId: data?.requestId,
          isDraft: data?.isDraft,
          letterOfCreditActionType: data?.letterOfCreditActionType,
        },
        token,
      });

    let letterOfCreditRequestData: LetterOfCreditRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingLetterOfCreditRequest) {
          throw new BadRequestException(
            'Letter of Credit Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [letterOfCreditRequestData]] =
          await this.letterOfCreditRequestRepository.update(
            {
              letterOfCreditActionType: data?.letterOfCreditActionType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              applicationNumber: letterOfCredit?.applicationNumber,
              lcReferenceNumber: letterOfCredit?.referenceNumber,
              metadata: filterData,
            },
            {
              where: {
                requestId: letterOfCreditRequestData?.requestId,
              },
              transaction,
            },
          );

        await this.letterOfCreditCancellationRepository.update(
          { ...filterData },
          {
            where: {
              requestId: letterOfCreditRequestData?.requestId,
            },
            transaction,
          },
        );
      } else {
        letterOfCreditRequestData =
          await this.letterOfCreditRequestRepository.create(
            {
              letterOfCreditActionType:
                LetterOfCreditActionTypeEnum.CANCELLATION,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              tenantId: data?.tenantId,
              lcReferenceNumber: data?.lcReferenceNumber,
              metadata: filterData,
            },
            { transaction },
          );

        await this.letterOfCreditCancellationRepository.create(
          {
            ...filterData,
            requestId: letterOfCreditRequestData?.requestId,
          },
          { transaction },
        );
      }

      if (userPermissions.includes(PermissionEnum.AUTHORISE_LETTER_OF_CREDIT)) {
        await this.handleApproval({
          requestData: letterOfCreditRequestData,
          approverBranchCode: data?.initiatorBranchCode,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryLetterOfCreditChargesAndTaxesTypeEnum.CANCELLATION,
          transaction,
        });

        await this.letterOfCreditRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: letterOfCreditRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await letterOfCreditRequestData.reload();

    return letterOfCreditRequestData;
  }

  async freeFormat(data: LetterOfCreditFreeFormatMessageDto) {
    const { userPermissions, token, ...filterData } = data;

    const { letterOfCredit, tradeProductData, existingLetterOfCreditRequest } =
      await this.validateActionRequestAndGetTradeProductData({
        data: {
          lcReferenceNumber: data.lcReferenceNumber,
          requestId: data?.requestId,
          isDraft: data?.isDraft,
          letterOfCreditActionType: data?.letterOfCreditActionType,
        },
        token,
      });

    let letterOfCreditRequestData: LetterOfCreditRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingLetterOfCreditRequest) {
          throw new BadRequestException(
            'Letter of Credit Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [letterOfCreditRequestData]] =
          await this.letterOfCreditRequestRepository.update(
            {
              letterOfCreditActionType: data?.letterOfCreditActionType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              applicationNumber: letterOfCredit?.applicationNumber,
              lcReferenceNumber: letterOfCredit?.referenceNumber,
              metadata: filterData,
            },
            {
              where: {
                requestId: letterOfCreditRequestData?.requestId,
              },
              transaction,
            },
          );

        await this.letterOfCreditFreeFormatRepository.update(
          { ...filterData },
          {
            where: {
              requestId: letterOfCreditRequestData?.requestId,
            },
            transaction,
          },
        );
      } else {
        letterOfCreditRequestData =
          await this.letterOfCreditRequestRepository.create(
            {
              letterOfCreditActionType:
                LetterOfCreditActionTypeEnum.FREE_FORMAT,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              tenantId: data?.tenantId,
              lcReferenceNumber: data?.lcReferenceNumber,
              metadata: filterData,
            },
            { transaction },
          );

        await this.letterOfCreditFreeFormatRepository.create(
          {
            ...filterData,
            requestId: letterOfCreditRequestData?.requestId,
          },
          { transaction },
        );
      }

      if (userPermissions.includes(PermissionEnum.AUTHORISE_LETTER_OF_CREDIT)) {
        await this.handleApproval({
          requestData: letterOfCreditRequestData,
          approverBranchCode: data?.initiatorBranchCode,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryLetterOfCreditChargesAndTaxesTypeEnum.FREE_FORMAT,
          transaction,
        });

        await this.letterOfCreditRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: letterOfCreditRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await letterOfCreditRequestData.reload();

    return letterOfCreditRequestData;
  }

  async authorize(
    data: AuthorizeLetterOfCreditDto,
  ): Promise<LetterOfCreditRequest> {
    const {
      id,
      approver,
      approverId,
      approverBranchCode,
      approverDepartment,
      approvalStatus,
      reasonForRejection,
      token,
    } = data;

    const letterOfCreditRequestData =
      await this.letterOfCreditRequestRepository.findOne({
        where: {
          requestId: id,
          approvalStatus: ApprovalStatusEnum.PENDING,
        },
      });

    if (!letterOfCreditRequestData) {
      throw new NotFoundException(
        'No Matching request with that requestId found',
      );
    }

    const tradeProductId =
      letterOfCreditRequestData?.metadata?.['tradeProductId'] ??
      letterOfCreditRequestData?.issuedLetterOfCredit?.tradeProductId;

    const tradeProductData =
      await this.tradeProductFactoryService.getProductDetails(
        tradeProductId,
        token,
      );

    let regulatoryForm: FormM | FormNXP | FormNCX | FormA;

    if (
      tradeProductData?.regulatoryFormRequired !==
      RegulatoryFormRequiredEnum.NONE
    ) {
      if (
        letterOfCreditRequestData?.letterOfCreditActionType ===
          LetterOfCreditActionTypeEnum.ISSUANCE ||
        letterOfCreditRequestData?.letterOfCreditActionType ===
          LetterOfCreditActionTypeEnum.ADVISEMENT
      ) {
        regulatoryForm =
          await this.regulatoryFormService.getRegulatoryFormRecord(
            letterOfCreditRequestData?.applicationNumber,
            letterOfCreditRequestData?.letterOfCreditProductType ===
              LetterOfCreditProductTypeEnum.IMPORT
              ? RegulatoryFormTypeEnum.FORM_M
              : RegulatoryFormTypeEnum.FORM_NXP,
          );

        switch (letterOfCreditRequestData?.letterOfCreditProductType) {
          case LetterOfCreditProductTypeEnum.IMPORT:
            regulatoryForm = await this.regulatoryFormService.getFormMRecord(
              'formMId' in regulatoryForm ? regulatoryForm.formMId : undefined,
              {
                identifier: GetFormMRecordIdentifierEnum.FORM_M_ID,
              },
            );
            break;
          case LetterOfCreditProductTypeEnum.EXPORT:
            regulatoryForm = await this.regulatoryFormService.getFormNXPRecord(
              'formNXPId' in regulatoryForm
                ? regulatoryForm.formNXPId
                : undefined,
              {
                identifier: GetFormNXPRecordIdentifierEnum.FORM_NXP_ID,
              },
            );
            break;
          default:
            throw new BadRequestException(
              'Invalid letter of credit product type',
            );
        }

        await regulatoryForm.reload();

        if (regulatoryForm?.status !== RegulatoryFormStatusEnum.REGISTERED) {
          throw new BadRequestException(
            `Letter of Credit can only be approved when it's corresponding Form M has a Registered status.`,
          );
        }
      }
    }

    if (
      letterOfCreditRequestData &&
      letterOfCreditRequestData?.letterOfCreditActionType !==
        LetterOfCreditActionTypeEnum.ISSUANCE &&
      letterOfCreditRequestData?.letterOfCreditActionType !==
        LetterOfCreditActionTypeEnum.ADVISEMENT &&
      !letterOfCreditRequestData?.lcReferenceNumber
    ) {
      throw new BadRequestException(
        'LC Reference Number is not tied to this request which is required for this action type',
      );
    }

    let valueToUpdate: Partial<LetterOfCreditRequest>;

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

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (
        approvalStatus.toLowerCase() ===
        ApprovalStatusEnum.APPROVED.toLowerCase()
      ) {
        await this.handleApproval({
          requestData: letterOfCreditRequestData,
          approverBranchCode: approverBranchCode,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryLetterOfCreditChargesAndTaxesTypeEnum[
              LetterOfCreditActionTypeToTradeProductFactoryChargesAndTaxesTypeEnum[
                letterOfCreditRequestData?.letterOfCreditActionType
              ]
            ],
          transaction,
        });
      }

      await this.letterOfCreditRequestRepository.update(valueToUpdate, {
        where: { requestId: letterOfCreditRequestData?.requestId },
      });

      if (
        tradeProductData?.regulatoryFormRequired !==
        RegulatoryFormRequiredEnum.NONE
      ) {
        if (
          letterOfCreditRequestData?.letterOfCreditActionType ===
            LetterOfCreditActionTypeEnum.ISSUANCE ||
          letterOfCreditRequestData?.letterOfCreditActionType ===
            LetterOfCreditActionTypeEnum.ADVISEMENT
        ) {
          regulatoryForm =
            await this.regulatoryFormService.getRegulatoryFormRecord(
              regulatoryForm?.applicationNumber,
              letterOfCreditRequestData?.letterOfCreditProductType ===
                LetterOfCreditProductTypeEnum.IMPORT
                ? RegulatoryFormTypeEnum.FORM_M
                : RegulatoryFormTypeEnum.FORM_NXP,
            );

          regulatoryForm.isTaken = true;

          await regulatoryForm.save();
        }
      }
    });

    await letterOfCreditRequestData.reload();

    return letterOfCreditRequestData;
  }

  async withdraw(id: string, initiatorId: string) {
    const letterOfCreditRequestData =
      await this.letterOfCreditRequestRepository.findOne({
        where: {
          requestId: id,
          initiatorId,
          approvalStatus: {
            [Op.in]: [ApprovalStatusEnum.PENDING, ApprovalStatusEnum.REJECTED],
          },
        },
      });

    if (!letterOfCreditRequestData) {
      throw new NotFoundException(
        'No Matching request with that Request Id initiated by this user found',
      );
    }

    await this.letterOfCreditRequestRepository.update(
      {
        approvalStatus: null,
        requestStatus: RequestStatusEnum.DRAFT,
      },
      { where: { requestId: letterOfCreditRequestData?.requestId } },
    );

    return this.letterOfCreditRequestRepository.findOne({
      where: { requestId: letterOfCreditRequestData?.requestId },
    });
  }

  async delete(id: string, initiatorId: string) {
    const letterOfCreditRequestData =
      await this.letterOfCreditRequestRepository.findOne({
        where: {
          requestId: id,
          initiatorId,
          approvalStatus: ApprovalStatusEnum.PENDING,
        },
      });

    if (!letterOfCreditRequestData) {
      throw new NotFoundException(
        'No Matching request with that Request Id initiated by this user found',
      );
    }

    const deletedLetterOfCreditRequestCount =
      await this.letterOfCreditRequestRepository.delete({
        where: { requestId: letterOfCreditRequestData?.requestId },
      });

    return deletedLetterOfCreditRequestCount;
  }

  async getRecordsStatusCount(
    id: string,
    branch: string,
    statusType: RecordsStatusTypeEnum,
    recordScope: AuthorizationStatusEnum,
    requestStatus: RequestStatusEnum,
  ) {
    const query: { where: Partial<LetterOfCreditRequest> } = {
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

    const letterOfCreditRecordsStatusCount =
      await this.letterOfCreditRequestRepository.scope(null).findAll({
        where: query.where,
        attributes: [
          [LetterOfCreditStatusTypeToColumnMappingEnum[statusType], 'status'],
          [this.sequelize.fn('COUNT', this.sequelize.literal('*')), 'count'],
        ],
        group: [LetterOfCreditStatusTypeToColumnMappingEnum[statusType]],
        raw: true,
      });

    return letterOfCreditRecordsStatusCount.map((record: any) => ({
      status: record.status,
      count: parseInt(record.count, 10),
    }));
  }

  async getLetterOfCreditRecords(
    options: GetLetterOfCreditRecordsDto,
  ): Promise<GetLetterOfCreditRequestResponse> {
    const {
      id,
      branch,
      page = 1,
      size = 10,
      startDate,
      endDate,
      recordScope = AuthorizationStatusEnum.CREATED_BY_ME,
      lcProductType,
      lcState,
      lcCode,
      applicantName,
    } = options;

    const query: { where: Partial<LetterOfCredit> } = {
      where: {},
    };

    switch (recordScope) {
      case AuthorizationStatusEnum.CREATED_BY_ME:
      case AuthorizationStatusEnum.INITIATED_BY_ME:
        query.where.letterOfCreditRequest.initiatorId = id;
        break;
      case AuthorizationStatusEnum.APPROVED_BY_ME:
      case AuthorizationStatusEnum.SENT_TO_ME:
        query.where.letterOfCreditRequest.approverId = id;
        break;
      case AuthorizationStatusEnum.CREATED_BY_MY_BRANCH:
      case AuthorizationStatusEnum.INITIATED_BY_MY_BRANCH:
        query.where.letterOfCreditRequest.initiatorBranchCode = branch;
        break;
      case AuthorizationStatusEnum.APPROVED_BY_MY_BRANCH:
      case AuthorizationStatusEnum.SENT_TO_MY_BRANCH:
        query.where.letterOfCreditRequest.approverBranchCode = branch;
        break;
      case AuthorizationStatusEnum.CREATED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.INITIATED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.APPROVED_SYSTEM_WIDE:
      case AuthorizationStatusEnum.SENT_SYSTEM_WIDE:
        break;
      default:
        throw new BadRequestException('Invalid Authorization Status');
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

    if (lcProductType) {
      query.where.letterOfCreditProductType = lcProductType;
    }

    if (lcState) {
      query.where.state = lcState;
    }

    if (lcCode) {
      query.where.referenceNumber = lcCode;
    }

    if (applicantName) {
      query.where.applicantName = applicantName;
    }

    const { count: totalRecords, rows: letterOfCreditRecords } =
      await this.letterOfCreditRepository.findAndCountAll({
        ...query,
        subQuery: false,
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
      letterOfCreditRecords,
    };
  }

  async getLetterOfCreditRequests(
    options: GetLetterOfCreditRecordsDto,
  ): Promise<GetLetterOfCreditRequestResponse> {
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
      lcProductType,
      lcStatus,
      lcState,
      lcCode,
      applicantName,
    } = options;

    const query: { where: Partial<LetterOfCreditRequest> | any } = {
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
      query.where.letterOfCreditActionType = {
        [Op.in]: [
          LetterOfCreditActionTypeEnum.ISSUANCE,
          LetterOfCreditActionTypeEnum.PRE_ISSUANCE,
          LetterOfCreditActionTypeEnum.ADVISEMENT,
        ],
      };
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

    if (lcStatus) {
      query.where.letterOfCreditActionType = lcStatus;
    }

    if (lcProductType) {
      query.where.letterOfCreditProductType = lcProductType;
    }

    const orFilters: any[] = [];

    if (lcCode) {
      orFilters.push({
        '$letterOfCredit.referenceNumber$': { [Op.iLike]: `%${lcCode}%` },
      });
    }

    if (applicantName) {
      orFilters.push({
        '$letterOfCredit.applicantName$': { [Op.iLike]: `%${applicantName}%` },
      });
    }

    if (lcState) {
      orFilters.push({
        '$letterOfCredit.state$': { [Op.iLike]: `%${lcState}%` },
      });
    }

    if (orFilters.length > 0) {
      query.where = {
        [Op.and]: [query.where, { [Op.or]: orFilters }],
      };
    }

    const { count: totalRecords, rows: letterOfCreditRecords } =
      await this.letterOfCreditRequestRepository.findAndCountAll({
        ...query,
        subQuery: false,
        include: [
          { model: LetterOfCredit, as: 'letterOfCredit', required: false },
          {
            model: LetterOfCreditAmendment,
            as: 'amendment',
            required: false,
          },
          {
            model: LetterOfCreditAdjustment,
            as: 'adjustment',
            required: false,
          },
          {
            model: LetterOfCreditCancellation,
            as: 'cancellation',
            required: false,
          },
          {
            model: LetterOfCreditFreeFormatMessage,
            as: 'freeFormatMessage',
            required: false,
          },
          {
            model: LetterOfCreditPayment,
            as: 'payment',
            required: false,
          },
          {
            model: LetterOfCreditDocumentLodgement,
            as: 'documentLodgement',
            required: false,
          },
        ],
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
      letterOfCreditRecords,
    };
  }

  async getLetterOfCreditRecordByReferenceNumber(
    referenceNumber: string,
  ): Promise<LetterOfCredit> {
    const letterOfCreditRecord = await this.letterOfCreditRepository.findOne({
      where: { referenceNumber },
      include: [
        {
          model: LetterOfCreditAmendment,
          as: 'amendments',
          required: false,
        },
        {
          model: LetterOfCreditAdjustment,
          as: 'adjustments',
          required: false,
        },
        {
          model: LetterOfCreditCancellation,
          as: 'cancellation',
          required: false,
        },
        {
          model: LetterOfCreditFreeFormatMessage,
          as: 'freeFormatMessages',
          required: false,
        },
        {
          model: LetterOfCreditPayment,
          as: 'payments',
          required: false,
        },
        {
          model: LetterOfCreditDocumentLodgement,
          as: 'documentLodgements',
          required: false,
        },
        {
          model: LetterOfCreditAssignmentOfProceed,
          as: 'assignmentsOfProceeds',
          required: false,
        },
      ],
      order: [
        [
          { model: LetterOfCreditAmendment, as: 'amendments' },
          'createdAt',
          'DESC',
        ],
        [
          { model: LetterOfCreditAdjustment, as: 'adjustments' },
          'createdAt',
          'DESC',
        ],
        [
          { model: LetterOfCreditCancellation, as: 'cancellation' },
          'createdAt',
          'DESC',
        ],
        [
          { model: LetterOfCreditFreeFormatMessage, as: 'freeFormatMessages' },
          'createdAt',
          'DESC',
        ],
        [{ model: LetterOfCreditPayment, as: 'payments' }, 'createdAt', 'DESC'],
        [
          { model: LetterOfCreditDocumentLodgement, as: 'documentLodgements' },
          'createdAt',
          'DESC',
        ],
        [
          {
            model: LetterOfCreditAssignmentOfProceed,
            as: 'assignmentsOfProceeds',
          },
          'createdAt',
          'DESC',
        ],
      ],
    });

    if (!letterOfCreditRecord) {
      throw new NotFoundException(
        `No Letter of Credit Record found with reference number ${referenceNumber}`,
      );
    }

    return letterOfCreditRecord;
  }

  async validateRegulatoryFormForLetterOfCreditRequestInitiation(
    applicationNumber: string,
    letterOfCreditProductType: LetterOfCreditProductTypeEnum,
  ): Promise<{
    isValid: boolean;
    regulatoryForm: FormM | FormNXP | FormNCX | FormA;
  }> {
    const regulatoryForm =
      await this.regulatoryFormService.getRegulatoryFormRecord(
        applicationNumber,
        letterOfCreditProductType === LetterOfCreditProductTypeEnum.IMPORT
          ? RegulatoryFormTypeEnum.FORM_M
          : RegulatoryFormTypeEnum.FORM_NXP,
      );

    if (!regulatoryForm) {
      throw new NotFoundException(
        `No Regulatory Form record found with application number ${applicationNumber}`,
      );
    }

    const letterOfCreditRequest =
      await this.letterOfCreditRequestRepository.findOne({
        where: {
          applicationNumber,
          letterOfCreditActionType: {
            [Op.in]: [
              LetterOfCreditActionTypeEnum.ISSUANCE,
              LetterOfCreditActionTypeEnum.ADVISEMENT,
            ],
          },
          approvalStatus: {
            [Op.not]: ApprovalStatusEnum.REJECTED,
          },
        },
      });

    return {
      isValid: letterOfCreditRequest === null,
      regulatoryForm,
    };
  }

  async getLetterOfCreditByRequestId(
    requestId: string,
    isRecord: boolean = false,
  ): Promise<LetterOfCreditRequest | LetterOfCredit> {
    let letterOfCredit: any;

    if (isRecord) {
      letterOfCredit = await this.letterOfCreditRepository.findOne({
        where: {
          requestId: requestId,
        },
      });
    } else {
      letterOfCredit = await this.letterOfCreditRequestRepository.findOne({
        where: {
          requestId: requestId,
        },
      });
    }

    if (!letterOfCredit) {
      throw new NotFoundException(
        `No Letter of Credit ${isRecord ? 'Record' : 'Request'} found with request ID ${requestId}`,
      );
    }

    return letterOfCredit;
  }

  // @Cron('0 0 * * *')
  // async expireLetterOfCreditRecords() {
  //   this.loggerService.debug(
  //     `Expiring Letter of Credit Records at ${moment().tz(
  //       IANATimeZoneDatabaseEnum.LAGOS,
  //     )}`,
  //   );

  //   const expiredLetterOfCredit = await this.letterOfCreditRepository.update(
  //     { isExpired: true },
  //     {
  //       where: {
  //         expiryDate: {
  //           [Op.lte]: moment()
  //             .tz(IANATimeZoneDatabaseEnum.LAGOS)
  //             .format('YYYY-MM-DD'),
  //         },
  //       },
  //       returning: true,
  //     },
  //   );

  //   if (expiredLetterOfCredit[0] > 0) {
  //     this.loggerService.debug(
  //       `Expired ${expiredLetterOfCredit[0]} Letter of Credit Records`,
  //     );
  //   } else {
  //     this.loggerService.debug(`No Letter of Credit Records to expire`);
  //   }
  // }

  async previewSwiftMessage(data: any) {
    let swiftMessageObject: any;

    switch (data?.letterOfCreditActionType) {
      case LetterOfCreditActionTypeEnum.ISSUANCE:
        swiftMessageObject = {
          mt700: generateMt700Message({
            formOfDocumentaryCredit: (data as IssueLetterOfCreditDto)
              ?.formOfDocumentaryCredit,
            documentaryCreditNumber: 'To Be Generated on Approval',
            preAdviceReferenceNumber: (data as IssueLetterOfCreditDto)
              ?.preAdviceReferenceNumber,
            issueDate: (data as IssueLetterOfCreditDto)?.issueDate,
            applicableRules: (data as IssueLetterOfCreditDto)?.applicableRules,
            expiryDate: (data as IssueLetterOfCreditDto)?.expiryDate,
            expiryPlace: (data as IssueLetterOfCreditDto)?.expiryPlace,
            applicantBankBicCode: (data as IssueLetterOfCreditDto)
              ?.applicantBankBicCode,
            applicantName: (data as IssueLetterOfCreditDto)?.applicantName,
            applicantAddress: (data as IssueLetterOfCreditDto)
              ?.applicantAddress,
            beneficiaryName: (data as IssueLetterOfCreditDto)?.beneficiaryName,
            beneficiaryAddress: (data as IssueLetterOfCreditDto)
              ?.beneficiaryAddress,
            currencyCode: (data as IssueLetterOfCreditDto)?.lcCurrencyCode,
            amount: (data as IssueLetterOfCreditDto)?.lcAmount,
            minCreditAmountTolerance: (data as IssueLetterOfCreditDto)
              ?.minCreditAmountTolerance,
            maxCreditAmountTolerance: (data as IssueLetterOfCreditDto)
              ?.maxCreditAmountTolerance,
            additionalAmountsCovered: (data as IssueLetterOfCreditDto)
              ?.additionalAmount,
            creditAvailableBankBicCode:
              (data as IssueLetterOfCreditDto)?.creditAvailableWith ===
              CreditAvailableWithEnum.NAMED_BANK
                ? (data as IssueLetterOfCreditDto)
                    ?.creditAvailableWithBankSwiftCode
                : SwiftBICEnum.STERLING,
            creditAvailableCode: (data as IssueLetterOfCreditDto)
              ?.creditAvailableBy,
            draftsAt:
              (data as IssueLetterOfCreditDto)?.draftMode ===
              DraftModeEnum.TENOR
                ? `${(data as IssueLetterOfCreditDto)?.tenorPeriod} ${(data as IssueLetterOfCreditDto)?.tenorPeriodType}`
                : moment((data as IssueLetterOfCreditDto)?.maturityDate).format(
                    'D MMMM, YYYY',
                  ),
            drawee:
              (data as IssueLetterOfCreditDto)?.drawee === DraweeEnum.NAMED_BANK
                ? (data as IssueLetterOfCreditDto)?.draweeBankAddress
                : SwiftBICEnum.STERLING,
            paymentDate: (data as IssueLetterOfCreditDto)?.paymentDate,
            paymentMethod: (data as IssueLetterOfCreditDto)?.paymentMethod,
            mixedPaymentDetails: (data as IssueLetterOfCreditDto)
              ?.mixedPaymentDetails,
            partialShipment: (data as IssueLetterOfCreditDto)?.partialShipment,
            transShipment: (data as IssueLetterOfCreditDto)?.transShipment,
            placeOfTakingInChargeOrDispatchFromOrPlaceOfReceipt: (
              data as IssueLetterOfCreditDto
            )?.placeOfChargeTaken,
            portOfLoading: (data as IssueLetterOfCreditDto)?.portOfLoading,
            portOfDischarge: (data as IssueLetterOfCreditDto)?.portOfDischarge,
            latestDateOfShipment: (data as IssueLetterOfCreditDto)
              ?.latestShipmentDate,
            shipmentPeriod: (data as IssueLetterOfCreditDto)?.shipmentPeriod,
            descriptionOfGoods: (data as IssueLetterOfCreditDto)
              ?.descriptionOfGoods,
            documentsRequired: (data as IssueLetterOfCreditDto)
              ?.documentsRequired,
            additionalConditions: (data as IssueLetterOfCreditDto)
              ?.additionalConditions,
            specialPaymentConditionsForBeneficiary: (
              data as IssueLetterOfCreditDto
            )?.specialPaymentConditionsForBeneficiary,
            specialPaymentConditionsForBankOnly: (
              data as IssueLetterOfCreditDto
            )?.specialPaymentConditionsForBank,
            charges: (data as IssueLetterOfCreditDto)?.charges,
            presentationDays: (data as IssueLetterOfCreditDto)
              ?.presentationDays,
            confirmationInstructions: (data as IssueLetterOfCreditDto)
              ?.confirmationInstruction,
            requestedConfirmationParty: (data as IssueLetterOfCreditDto)
              ?.requestedConfirmationParty,
            reimbursingBank: (data as IssueLetterOfCreditDto)
              ?.reimbursingBankBicCode,
            instructionsToThePayingAcceptingNegotiatingBank: (
              data as IssueLetterOfCreditDto
            )?.instructionsToThePayingOrAcceptingOrNegotiatingBank,
            adviseThroughBank: (data as IssueLetterOfCreditDto)
              ?.adviseThroughBankBicCode,
            senderToReceiverInformation: (data as IssueLetterOfCreditDto)
              ?.senderToReceiverInformation,
            receiverBIC: (data as IssueLetterOfCreditDto)?.advisingBankBicCode,
            sessionNumber: generateRandomNumberWithDigits(4),
            sequenceNumber: generateRandomNumberWithDigits(6),
          }),
        };

        if ((data as IssueLetterOfCreditDto)?.beneficiaryInstituitionAccount) {
          swiftMessageObject.mt202 = generateMt202Message({
            sessionNumber: 'To Be Generated on Approval',
            sequenceNumber: 'To Be Generated on Approval',
            senderBIC: SwiftBICEnum.STERLING,
            receiverBIC: (data as IssueLetterOfCreditDto)?.advisingBankBicCode,
            uniqueID: 'To Be Generated on Approval',
            transactionReference: (data as IssueLetterOfCreditDto)
              ?.applicationNumber,
            valueDate: moment(
              (data as IssueLetterOfCreditDto)?.issueDate,
            ).format('YYMMDD'),
            currencyCode: (data as IssueLetterOfCreditDto)?.lcCurrencyCode,
            amount: (data as IssueLetterOfCreditDto)?.marginAmount,
            orderingInstituionAccount: (data as IssueLetterOfCreditDto)
              ?.orderingInstituionAccount,
            orderingInstituionBicCode: (data as IssueLetterOfCreditDto)
              ?.orderingInstituionBicCode,
            sendersCorrespondentAccount: (data as IssueLetterOfCreditDto)
              ?.sendersCorrespondentAccount,
            sendersCorrespondentBicCode: (data as IssueLetterOfCreditDto)
              ?.sendersCorrespondentBicCode,
            receiversCorrespondentAccount: (data as IssueLetterOfCreditDto)
              ?.receiversCorrespondentAccount,
            receiversCorrespondentBicCode: (data as IssueLetterOfCreditDto)
              ?.receiversCorrespondentBicCode,
            intermediaryAccount: (data as IssueLetterOfCreditDto)
              ?.intermediaryAccount,
            intermediaryBicCode: (data as IssueLetterOfCreditDto)
              ?.intermediaryBicCode,
            accountWithInstituitionAccount: (data as IssueLetterOfCreditDto)
              ?.accountWithInstituitionAccount,
            accountWithInstituitionBicCode: (data as IssueLetterOfCreditDto)
              ?.accountWithInstituitionBicCode,
            beneficiaryAccount: (data as IssueLetterOfCreditDto)
              ?.beneficiaryInstituitionAccount,
            beneficiaryBankSwiftCode: (data as IssueLetterOfCreditDto)
              ?.beneficiaryInstituitionBicCode,
            senderToReceiverInformation: (data as IssueLetterOfCreditDto)
              ?.fundsTransferSenderToReceiverInformation,
          });
        }
        break;
      case LetterOfCreditActionTypeEnum.AMENDMENT:
        const matchingLetterOfCredit =
          await this.letterOfCreditRepository.findOne({
            where: {
              referenceNumber: (data as AmendLetterOfCreditDto)
                ?.lcReferenceNumber,
            },
          });

        const mt707MessageData: Mt707MessageData =
          compareLetterOfCreditAmendmentChanges(
            data as AmendLetterOfCreditDto,
            matchingLetterOfCredit,
          );

        const numberOfAmendment =
          await this.letterOfCreditRequestRepository.count({
            where: {
              lcReferenceNumber: matchingLetterOfCredit?.referenceNumber,
              letterOfCreditActionType: LetterOfCreditActionTypeEnum.AMENDMENT,
              approvalStatus: ApprovalStatusEnum.APPROVED,
            },
          });

        mt707MessageData.numberOfAmendment = String(numberOfAmendment + 1);

        swiftMessageObject = {
          mt707: generateMt707Message(mt707MessageData),
        };

        if ((data as AmendLetterOfCreditDto)?.beneficiaryInstituitionAccount) {
          swiftMessageObject.mt202 = generateMt202Message({
            sessionNumber: 'To Be Generated on Approval',
            sequenceNumber: 'To Be Generated on Approval',
            senderBIC: SwiftBICEnum.STERLING,
            receiverBIC: (data as AmendLetterOfCreditDto)?.advisingBankBicCode,
            uniqueID: 'To Be Generated on Approval',
            transactionReference: (data as AmendLetterOfCreditDto)
              ?.formOfDocumentaryCredit,
            valueDate: moment(
              (data as AmendLetterOfCreditDto)?.issueDate,
            ).format('YYMMDD'),
            currencyCode: (data as AmendLetterOfCreditDto)?.lcCurrencyCode,
            amount: (data as AmendLetterOfCreditDto)?.marginAmount,
            orderingInstituionAccount: (data as AmendLetterOfCreditDto)
              ?.orderingInstituionAccount,
            orderingInstituionBicCode: (data as AmendLetterOfCreditDto)
              ?.orderingInstituionBicCode,
            sendersCorrespondentAccount: (data as AmendLetterOfCreditDto)
              ?.sendersCorrespondentAccount,
            sendersCorrespondentBicCode: (data as AmendLetterOfCreditDto)
              ?.sendersCorrespondentBicCode,
            receiversCorrespondentAccount: (data as AmendLetterOfCreditDto)
              ?.receiversCorrespondentAccount,
            receiversCorrespondentBicCode: (data as AmendLetterOfCreditDto)
              ?.receiversCorrespondentBicCode,
            intermediaryAccount: (data as AmendLetterOfCreditDto)
              ?.intermediaryAccount,
            intermediaryBicCode: (data as AmendLetterOfCreditDto)
              ?.intermediaryBicCode,
            accountWithInstituitionAccount: (data as AmendLetterOfCreditDto)
              ?.accountWithInstituitionAccount,
            accountWithInstituitionBicCode: (data as AmendLetterOfCreditDto)
              ?.accountWithInstituitionBicCode,
            beneficiaryAccount: (data as AmendLetterOfCreditDto)
              ?.beneficiaryInstituitionAccount,
            beneficiaryBankSwiftCode: (data as AmendLetterOfCreditDto)
              ?.beneficiaryInstituitionBicCode,
            senderToReceiverInformation: (data as AmendLetterOfCreditDto)
              ?.fundsTransferSenderToReceiverInformation,
          });
        }
        break;
      case LetterOfCreditActionTypeEnum.PAYMENT:
        swiftMessageObject = {
          mt752: generateMt752Message({
            sessionNumber: 'To Be Generated on Approval',
            sequenceNumber: 'To Be Generated on Approval',
            senderBIC: SwiftBICEnum.STERLING,
            receiverBIC: (data as LetterOfCreditPaymentDto)
              ?.receivedFromBankBicCode,
            uniqueID: 'To Be Generated on Approval',
            documentaryCreditNumber: (data as LetterOfCreditPaymentDto)
              ?.lcReferenceNumber,
            presentingBankReference: (data as LetterOfCreditPaymentDto)
              ?.relatedReference,
            furtherIdentification: (data as LetterOfCreditPaymentDto)
              ?.lcReferenceNumber,
            dateOfAdviceOfDiscrepancyOrMailing: moment(
              (data as LetterOfCreditPaymentDto)?.returnDate,
            ).format('YYMMDD'),
            totalAmountAdvisedCurrency: (data as LetterOfCreditPaymentDto)
              ?.totalClaimedAmountCurrency,
            totalAmountAdvised: (data as LetterOfCreditPaymentDto)
              ?.totalClaimedAmount,
            chargesDeductedCurrency: (data as LetterOfCreditPaymentDto)
              ?.chargesAddedCurrency,
            chargesDeductedAmount: (data as LetterOfCreditPaymentDto)
              ?.chargesDeductedAmount,
            netAmountCurrency: (data as LetterOfCreditPaymentDto)
              ?.payAmountCurrency,
            netAmount: (data as LetterOfCreditPaymentDto)?.payAmount,
            paymentDueDate: (data as LetterOfCreditPaymentDto)?.paymentDueDate,
            sendersCorrespondentAccount: (data as LetterOfCreditPaymentDto)
              ?.sendersCorrespondentAccount,
            sendersCorrespondentBIC: (data as LetterOfCreditPaymentDto)
              ?.sendersCorrespondentBicCode,
            receiversCorrespondentAccount: (data as LetterOfCreditPaymentDto)
              ?.receiversCorrespondentAccount,
            receiversCorrespondentBIC: (data as LetterOfCreditPaymentDto)
              ?.receivedFromBankBicCode,
            senderToReceiverInformation: (data as LetterOfCreditPaymentDto)
              ?.senderToReceiverInformation,
            narrative: (data as LetterOfCreditPaymentDto)?.narrative,
          }),
        };
        break;
      case LetterOfCreditActionTypeEnum.ADVISEMENT:
        swiftMessageObject = {
          mt730: generateMt730Message({
            sessionNumber: 'To Be Generated on Approval',
            sequenceNumber: 'To Be Generated on Approval',
            senderBIC: SwiftBICEnum.STERLING,
            receiverBIC: data?.advisingBankBicCode,
            uniqueID: 'To Be Generated on Approval',
            sendersReference: data?.referenceNumber,
            receiversReference: data?.relatedReference,
            dateOfMessageBeingAcknowledged: 'To Be Generated on Approval',
            senderToReceiverInformation: data?.senderToReceiverInformation,
          }),
        };
        break;
      case LetterOfCreditActionTypeEnum.FREE_FORMAT:
        swiftMessageObject = {
          mtn99: generateMtn99Message({
            sessionNumber: 'To Be Generated on Approval',
            sequenceNumber: 'To Be Generated on Approval',
            senderBIC: SwiftBICEnum.STERLING,
            receiverBIC: data?.receiversBankBicCode,
            uniqueID: 'To Be Generated on Approval',
            transactionReference: (data as LetterOfCreditFreeFormatMessageDto)
              ?.lcReferenceNumber,
            swiftMessageType: (data as LetterOfCreditFreeFormatMessageDto)
              ?.swiftMessageType,
            relatedReference: (data as LetterOfCreditFreeFormatMessageDto)
              ?.lcRelatedReferenceNumber,
            narrative: (data as LetterOfCreditFreeFormatMessageDto)?.narrative,
          }),
        };
        break;
      case LetterOfCreditActionTypeEnum.FUNDS_TRANSFER:
        swiftMessageObject = {
          mt202: generateMt202Message({
            sessionNumber: 'To Be Generated on Approval',
            sequenceNumber: 'To Be Generated on Approval',
            senderBIC: SwiftBICEnum.STERLING,
            receiverBIC:
              (data as IssueLetterOfCreditDto)?.advisingBankBicCode ??
              (data as IssueLetterOfCreditDto)?.beneficiaryInstituitionBicCode,
            uniqueID: 'To Be Generated on Approval',
            transactionReference:
              (data as IssueLetterOfCreditDto)?.applicationNumber ??
              data?.referenceNumber,
            valueDate: moment(
              (data as IssueLetterOfCreditDto)?.issueDate,
            ).format('YYMMDD'),
            currencyCode:
              (data as IssueLetterOfCreditDto)?.lcCurrencyCode ??
              data?.currencyCode,
            amount: (data as IssueLetterOfCreditDto)?.lcAmount ?? data?.amount,
            orderingInstituionAccount: (data as IssueLetterOfCreditDto)
              ?.orderingInstituionAccount,
            orderingInstituionBicCode: (data as IssueLetterOfCreditDto)
              ?.orderingInstituionBicCode,
            sendersCorrespondentAccount: (data as IssueLetterOfCreditDto)
              ?.sendersCorrespondentAccount,
            sendersCorrespondentBicCode: (data as IssueLetterOfCreditDto)
              ?.sendersCorrespondentBicCode,
            receiversCorrespondentAccount: (data as IssueLetterOfCreditDto)
              ?.receiversCorrespondentAccount,
            receiversCorrespondentBicCode: (data as IssueLetterOfCreditDto)
              ?.receiversCorrespondentBicCode,
            intermediaryAccount: (data as IssueLetterOfCreditDto)
              ?.intermediaryAccount,
            intermediaryBicCode: (data as IssueLetterOfCreditDto)
              ?.intermediaryBicCode,
            accountWithInstituitionAccount: (data as IssueLetterOfCreditDto)
              ?.accountWithInstituitionAccount,
            accountWithInstituitionBicCode: (data as IssueLetterOfCreditDto)
              ?.accountWithInstituitionBicCode,
            beneficiaryAccount: (data as IssueLetterOfCreditDto)
              ?.beneficiaryInstituitionAccount,
            beneficiaryBankSwiftCode: (data as IssueLetterOfCreditDto)
              ?.beneficiaryInstituitionBicCode,
            senderToReceiverInformation: (data as IssueLetterOfCreditDto)
              ?.fundsTransferSenderToReceiverInformation,
          }),
        };
        break;
      default:
        throw new BadRequestException('Invalid Letter of Credit Action Type');
    }
    return swiftMessageObject;
  }

  async searchLetterOfCreditTemplateRecords(
    data: SearchLetterOfCreditTemplateRecordsDto,
  ): Promise<LetterOfCreditTemplate[]> {
    const { templateName } = data;

    const query: { where: Partial<LetterOfCreditTemplate> | any } = {
      where: {},
    };

    if (templateName) {
      query.where.templateName = { [Op.iLike]: `%${templateName}%` };
    }

    const letterOfCreditTemplateRecords =
      await this.letterOfCreditTemplateRepository.findAll({
        ...query,
        order: [['createdAt', 'DESC']],
      });

    return letterOfCreditTemplateRecords;
  }

  async getLetterOfCreditTemplateRecordByTemplateId(
    templateId: string,
  ): Promise<LetterOfCreditTemplate> {
    const templateRecord = await this.letterOfCreditTemplateRepository.findOne({
      where: { templateId },
    });

    if (!templateRecord) {
      throw new NotFoundException(
        `No Letter of Credit Template Record found with ID ${templateId}`,
      );
    }

    return templateRecord;
  }

  async getLetterOfCreditByRegulatoryFormNumber(
    regulatoryFormNumber: string,
  ): Promise<LetterOfCredit> {
    const letterOfCredit = await this.letterOfCreditRepository.findOne({
      where: { applicationNumber: regulatoryFormNumber },
    });

    if (!letterOfCredit) {
      throw new NotFoundException(
        `No Letter of Credit Record found with Regulatory Form Number ${regulatoryFormNumber}`,
      );
    }

    return letterOfCredit;
  }
}
