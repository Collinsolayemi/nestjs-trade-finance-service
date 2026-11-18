import {
  BadRequestException,
  Inject,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { CamsService } from 'src/services/cams/cams.service';
import { Logger } from '@nestjs/common';
import { ProductManagementService } from 'src/services/product-management/product-management.service';
import { TradeProductFactoryService } from 'src/services/trade-product-factory/trade-product-factory.service';
import { TreasuryTradeService } from 'src/services/treasury-trade/treasury-trade.service';
import { RegulatoryFormService } from '../regulatory-form/regulatory-form.service';
import { CustomerManagementService } from 'src/services/customer-management/customer-management.service';
import { RulesConfigurationService } from 'src/services/rules-configuration/rules-configuration.service';
import {
  BillsForCollectionAdjustmentRepository,
  BillsForCollectionAcceptanceRepository,
  BillsForCollectionNonAcceptanceOrNonPaymentRepository,
  BillsForCollectionPaymentRepository,
  BillsForCollectionReceiveAcknowledgementRepository,
  BillsForCollectionRepository,
  BillsForCollectionAmendmentRepository,
  BillsForCollectionRequestRepository,
  BillsForCollectionFreeFormatRepository,
  BillsForCollectionClosureRepository,
} from './bills-for-collection.repository';
import { BookBillsForCollectionDto } from './dto/book-bills-for-collection.dto';
import {
  ApprovalStatusEnum,
  AuthorizationStatusEnum,
  BillsForCollectionActionTypeEnum,
  BillsForCollectionProductTypeEnum,
  BillsForCollectionStateEnum,
  GetFormMRecordIdentifierEnum,
  IANATimeZoneDatabaseEnum,
  GetFormNXPRecordIdentifierEnum,
  RegulatoryFormRequiredEnum,
  RegulatoryFormStatusEnum,
  RegulatoryFormTypeEnum,
  RequestStatusEnum,
  TradeProductFactoryBillsForCollectionChargesAndTaxesTypeEnum,
  // BillsForCollectionActionTypeToTradeProductFactoryChargesAndTaxesTypeEnum,
  RecordsStatusTypeEnum,
  BillsForCollectionStatusTypeToColumnMappingEnum,
  BillsForCollectionActionTypeToTradeProductFactoryChargesAndTaxesTypeEnum,
  ChargeAmountFieldEnum,
  EntryPartyEnum,
  TradeAccountTypeEnum,
  EntryTypeEnum,
  SwiftBICEnum,
  PostingAmountFieldEnum,
} from 'src/common/enums';
import { Op, QueryTypes, Transaction } from 'sequelize';
import { BillsForCollectionRequest } from './models/bills-for-collection-request.model';
import { AmendBillsForCollectionDto } from './dto/amend-bills-for-collection.dto';
import { AdjustBillsForCollectionDto } from './dto/adjust-bills-for-collection.dto';
import { AcceptBillsForCollectionDto } from './dto/accept-bills-for-collection.dto';
import { NonAcceptanceOrNonPaymentBillsForCollectionDto } from './dto/non-acceptance-or-non-payment-bills-for-collection.dto';
import { PayBillsForCollectionDto } from './dto/pay-bills-for-collection.dto';
import { ReceiveAcknowledgementBillsForCollectionDto } from './dto/receive-acknowledgement-bills-for-collection.dto';
import { AuthorizeBillsForCollectionDto } from './dto/authorize-bills-for-collection.dto';
import { FormM } from '../regulatory-form/models/form-m.model';
import { FormNXP } from '../regulatory-form/models/form-nxp.model';
import { FormA } from '../regulatory-form/models/form-a.model';
import { FormNCX } from '../regulatory-form/models/form-ncx.model';
import { GetBillsForCollectionRecordsDto } from './dto/get-bills-for-collection-records.dto';
import { BillsForCollection } from './models/bills-for-collection.model';
import * as moment from 'moment-timezone';
import { GetBillsForCollectionRequestResponse } from './interfaces/get-bills-for-collection-records';
import { BillsForCollectionAmendment } from './models/bills-for-collection-amendment.model';
import { BillsForCollectionAdjustment } from './models/bills-for-collection-adjustment.model';
import { BillsForCollectionNonAcceptanceOrNonPayment } from './models/bills-for-collection-non-acceptance-or-non-payment.model';
import { BillsForCollectionPayment } from './models/bills-for-collection-payment.model';
import { BillsForCollectionReceiveAcknowledgement } from './models/bills-for-collection-receive-akcnowledgement.model';
import { BillsForCollectionAcceptance } from './models/bills-for-collection-acceptance.model';
import { BillsForCollectionDebitAndCreditEntriesPayload } from './types/bills-for-collection-debit-and-credit-entries-payload.types';
import {
  AccountingEntry,
  ApplicableTaxLedgerEntry,
  ChargeAndTax,
  CounterParty,
  CounterPartyAccount,
  CustomerSearchResponse,
  TradeAccount,
  TradeProductData,
} from 'src/common/interfaces';
import createJournalPostingRequestBody from 'src/common/utils/create-journal-posting-request-body.util';
import { customAlphabet } from 'nanoid';
import { BillsForCollectionFreeFormatMessageDto } from './dto/bills-for-collection-free-format-message.dto';
import { BillsForCollectionFreeFormatMessage } from './models/bills-for-collection-free-format-message.model';
import { CloseBillsForCollectionDto } from './dto/close-bills-for-collection.dto';
import { BillsForCollectionDraftDetails } from './types/bills-for-collection-draft-details.types';

export class BillsForCollectionService {
  private readonly nanoid = customAlphabet('1234567890abcdef', 10);

  constructor(
    private readonly sequelize: Sequelize,
    private readonly camsService: CamsService,
    private readonly tradeProductFactoryService: TradeProductFactoryService,
    private readonly treasuryTradeService: TreasuryTradeService,
    private readonly productManagementService: ProductManagementService,
    private readonly regulatoryFormService: RegulatoryFormService,
    private readonly customerManagementService: CustomerManagementService,
    private readonly rulesConfigurationService: RulesConfigurationService,
    @Inject(Logger) private readonly loggerService: LoggerService,
    private readonly billsForCollectionRepository: BillsForCollectionRepository,
    private readonly billsForCollectionRequestRepository: BillsForCollectionRequestRepository,
    private readonly billsForCollectionAmendmentRepository: BillsForCollectionAmendmentRepository,
    private readonly billsForCollectionAdjustmentRepository: BillsForCollectionAdjustmentRepository,
    private readonly billsForCollectionNonAcceptanceOrNonPaymentRepository: BillsForCollectionNonAcceptanceOrNonPaymentRepository,
    private readonly billsForCollectionPaymentRepository: BillsForCollectionPaymentRepository,
    private readonly billsForCollectionReceiveAcknowledgementRepository: BillsForCollectionReceiveAcknowledgementRepository,
    private readonly billsForCollectionAcceptanceRepository: BillsForCollectionAcceptanceRepository,
    private readonly billsForCollectionFreeFormatRepository: BillsForCollectionFreeFormatRepository,
    private readonly billsForCollectionClosureRepository: BillsForCollectionClosureRepository,
  ) {}

  async generateReferenceNumber(
    billsForCollectionProductType: BillsForCollectionProductTypeEnum,
    slogan?: string,
  ): Promise<string> {
    const sequence = await this.sequelize.query(
      `SELECT nextval('bfc_reference_number_seq') AS nextval`,
      { type: QueryTypes.SELECT },
    );

    const creationYear = moment().format('YY');

    const nextVal = sequence[0]['nextval'];
    return `SB/${billsForCollectionProductType === BillsForCollectionProductTypeEnum.INWARD ? 'IBC' : 'OBC'}${creationYear}${String(nextVal).padStart(4, '0')}${slogan ? slogan.toUpperCase() : ''}`;
  }

  async getDebitAndCreditEntries(data: any, token: string) {
    let tradeProductData: TradeProductData;
    let billsForCollection: BillsForCollection;

    if (data?.tradeProductId) {
      tradeProductData =
        await this.tradeProductFactoryService.getProductDetails(
          data?.tradeProductId,
          token,
        );
    } else {
      billsForCollection = await this.billsForCollectionRepository.findOne({
        where: { referenceNumber: data?.billsReferenceNumber },
      });

      tradeProductData =
        await this.tradeProductFactoryService.getProductDetails(
          billsForCollection?.tradeProductId,
          token,
        );
    }

    const debitAndCreditEntries = await this.handleDebitAndCreditEntries({
      billsForCollectionActionType: data?.billsForCollectionActionType,
      tradeProductData,
      chargeType:
        TradeProductFactoryBillsForCollectionChargesAndTaxesTypeEnum[
          BillsForCollectionActionTypeToTradeProductFactoryChargesAndTaxesTypeEnum[
            data?.billsForCollectionActionType
          ]
        ],
      token,
      previewData: data,
    });

    return debitAndCreditEntries;
  }

  async saveBillsForCollectionAsDraft(data: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userPermissions, token, ...filterData } = data;

    const existingBillsForCollectionRequest =
      await this.billsForCollectionRequestRepository.findOne({
        where: {
          requestId: data?.requestId,
        },
      });

    if (!existingBillsForCollectionRequest && data?.isDraft) {
      throw new BadRequestException(
        'Bills for Collection is marked as draft but no existing matching record with the same reference ID exists.',
      );
    }

    data.requestStatus = RequestStatusEnum.DRAFT;
    data.approvalStatus = null;

    let savedBillsForCollection: any;

    if (data?.isDraft) {
      [, [savedBillsForCollection]] =
        await this.billsForCollectionRequestRepository.update(
          {
            billsForCollectionActionType: data?.billsForCollectionActionType,
            billsForCollectionProductType: data?.billsForCollectionProductType,
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
            returning: true,
          },
        );

      return savedBillsForCollection;
    }

    savedBillsForCollection =
      await this.billsForCollectionRequestRepository.create({
        billsForCollectionActionType: data?.billsForCollectionActionType,
        billsForCollectionProductType: data?.billsForCollectionProductType,
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

    return savedBillsForCollection;
  }

  async validateBillsForCollectionRequest(
    requestData: BookBillsForCollectionDto,
    tradeProductData: TradeProductData,
    token: string,
    billsForCollectionActionType: BillsForCollectionActionTypeEnum,
  ) {
    const billsForCollection = requestData;
    if (
      tradeProductData?.regulatoryFormRequired !==
      RegulatoryFormRequiredEnum.NONE
    ) {
      const regulatoryForm =
        await this.regulatoryFormService.getRegulatoryFormRecord(
          billsForCollection?.applicationNumber,
          BillsForCollectionProductTypeEnum.INWARD ===
            billsForCollection?.billsForCollectionProductType
            ? RegulatoryFormTypeEnum.FORM_M
            : RegulatoryFormTypeEnum.FORM_NXP,
        );

      if (!regulatoryForm) {
        throw new BadRequestException(
          `${BillsForCollectionProductTypeEnum.INWARD === billsForCollection?.billsForCollectionProductType ? 'Form M' : 'Form NXP'} with application number ${billsForCollection.applicationNumber} not found.`,
        );
      }
    }

    if (billsForCollection?.multiplePayments) {
      const totalDraftAmount = (billsForCollection.draftDetails ?? []).reduce(
        (acc: number, curr: BillsForCollectionDraftDetails) =>
          acc + (curr.draftAmount ?? 0),
        0,
      );

      if (totalDraftAmount !== billsForCollection.collectionAmount) {
        throw new BadRequestException(
          'When Multiple Payments is enabled, the sum of all draft amounts must equal the Collection Amount.',
        );
      }
    }

    const drawerAccountDetails = await this.camsService.getAccountDetails(
      billsForCollection?.drawer,
      '',
    );

    if (!drawerAccountDetails) {
      throw new NotFoundException(
        'Drawer Account not found in Central Account Management System',
      );
    }

    const { chargesAndTaxesDebitEntries } =
      await this.handleDebitAndCreditEntries({
        billsForCollectionActionType,
        tradeProductData,
        chargeType:
          TradeProductFactoryBillsForCollectionChargesAndTaxesTypeEnum[
            BillsForCollectionActionTypeToTradeProductFactoryChargesAndTaxesTypeEnum[
              requestData?.billsForCollectionActionType
            ]
          ],
        token,
        previewData: requestData,
      });

    const grandTotal = chargesAndTaxesDebitEntries.reduce(
      (sum, entry) => sum + entry.debitAmount,
      0,
    );

    if (grandTotal > drawerAccountDetails?.availableBalance) {
      throw new BadRequestException(
        'Drawer Account Balance Insufficient for Charges',
      );
    }
  }

  async bookBillsForCollectionRequest(data: BookBillsForCollectionDto) {
    const { userPermissions, token, ...filterData } = data;

    const tradeProductData =
      await this.tradeProductFactoryService.getProductDetails(
        data?.tradeProductId,
        token,
      );

    if (
      tradeProductData?.regulatoryFormRequired !==
      RegulatoryFormRequiredEnum.NONE
    ) {
      const regulatoryForm =
        await this.regulatoryFormService.getRegulatoryFormRecord(
          data?.applicationNumber,
          BillsForCollectionProductTypeEnum.INWARD ===
            data?.billsForCollectionProductType
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
          'Regulatory Form with either Submitted or Query status can not be used to issue a bills of collection',
        );
      }

      if (regulatoryForm?.isTaken) {
        throw new BadRequestException(
          'Regulatory Form has already been used for an existing application',
        );
      }

      const existingBillsForCollection =
        await this.billsForCollectionRequestRepository.findOne({
          where: {
            applicationNumber: data?.applicationNumber,
            billsForCollectionActionType: data?.billsForCollectionActionType,
            approvalStatus: { [Op.not]: ApprovalStatusEnum.REJECTED },
          },
        });

      if (existingBillsForCollection) {
        throw new BadRequestException(
          'A matching Bills for Collection request that is not rejected is tied to the same application number already exists',
        );
      }
    }

    let existingBillsForCollectionRequest: BillsForCollectionRequest;

    if (data?.requestId) {
      existingBillsForCollectionRequest =
        await this.billsForCollectionRequestRepository.findOne({
          where: {
            requestId: data?.requestId,
            approvalStatus: { [Op.not]: ApprovalStatusEnum.REJECTED },
          },
        });
    }

    if (existingBillsForCollectionRequest && !data?.isDraft) {
      throw new BadRequestException(
        'A matching Bills for Collection request that is not rejected exists and is not marked as draft.',
      );
    }

    if (!existingBillsForCollectionRequest && data?.isDraft) {
      throw new BadRequestException(
        'Request is marked as updating a draft and a matching request with the same reference ID and in Draft state can not be found.',
      );
    }

    await this.validateBillsForCollectionRequest(
      data,
      tradeProductData,
      token,
      data?.billsForCollectionActionType,
    );

    let billsForCollectionRequestData: BillsForCollectionRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        [, [billsForCollectionRequestData]] =
          await this.billsForCollectionRequestRepository.update(
            {
              billsForCollectionActionType: data?.billsForCollectionActionType,
              billsForCollectionProductType:
                data?.billsForCollectionProductType,
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
              returning: true,
            },
          );
      } else {
        billsForCollectionRequestData =
          await this.billsForCollectionRequestRepository.create(
            {
              billsForCollectionActionType: data?.billsForCollectionActionType,
              billsForCollectionProductType:
                data?.billsForCollectionProductType,
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

      if (userPermissions.includes('')) {
        await this.handleApproval({
          requestData: billsForCollectionRequestData,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryBillsForCollectionChargesAndTaxesTypeEnum.BOOKING,
          approverBranchCode: data?.initiatorBranchCode,
          transaction,
        });

        await this.billsForCollectionRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: billsForCollectionRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await billsForCollectionRequestData.reload();

    return billsForCollectionRequestData;
  }

  async amendBillsForCollection(data: AmendBillsForCollectionDto) {
    const { userPermissions, token, ...filterData } = data;

    const {
      billsForCollection,
      existingBillsForCollectionRequest,
      tradeProductData,
    } = await this.validateActionRequestAndGetTradeProductData(
      {
        billReferenceNumber: data?.billsReferenceNumber,
        requestId: data?.requestId,
        isDraft: data?.isDraft,
      },
      token,
    );

    let billsForCollectionRequestData: BillsForCollectionRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingBillsForCollectionRequest) {
          throw new BadRequestException(
            'Bills for Collection Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [billsForCollectionRequestData]] =
          await this.billsForCollectionRequestRepository.update(
            {
              billsForCollectionActionType: data?.billsForCollectionActionType,
              billsForCollectionProductType:
                billsForCollection?.billsForCollectionProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              billsReferenceNumber: billsForCollection?.referenceNumber,
              metadata: filterData,
            },
            {
              where: { requestId: data?.requestId },
              transaction,
              returning: true,
            },
          );

        await this.billsForCollectionAmendmentRepository.update(
          {
            ...filterData,
            requestId: billsForCollectionRequestData?.requestId,
          },
          { where: { requestId: data?.requestId }, transaction },
        );
      } else {
        billsForCollectionRequestData =
          await this.billsForCollectionRequestRepository.create(
            {
              billsForCollectionActionType: data?.billsForCollectionActionType,
              billsForCollectionProductType:
                billsForCollection?.billsForCollectionProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              tenantId: data?.tenantId,
              billsReferenceNumber: billsForCollection?.referenceNumber,
              metadata: filterData,
            },
            { transaction },
          );

        await this.billsForCollectionAmendmentRepository.create(
          {
            ...filterData,
            requestId: billsForCollectionRequestData?.requestId,
          },
          { transaction },
        );
      }

      if (userPermissions.includes('')) {
        await this.handleApproval({
          requestData: billsForCollectionRequestData,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryBillsForCollectionChargesAndTaxesTypeEnum.AMENDMENT,
          approverBranchCode: data?.initiatorBranchCode,
          transaction,
        });

        await this.billsForCollectionRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: billsForCollectionRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await billsForCollectionRequestData.reload();

    return billsForCollectionRequestData;
  }

  async adjustBillsForCollection(data: AdjustBillsForCollectionDto) {
    const { userPermissions, token, ...filterData } = data;

    const {
      billsForCollection,
      existingBillsForCollectionRequest,
      tradeProductData,
    } = await this.validateActionRequestAndGetTradeProductData(
      {
        billReferenceNumber: data?.billsReferenceNumber,
        requestId: data?.requestId,
        isDraft: data?.isDraft,
      },
      token,
    );

    let billsForCollectionRequestData: BillsForCollectionRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingBillsForCollectionRequest) {
          throw new BadRequestException(
            'Bills for Collection Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [billsForCollectionRequestData]] =
          await this.billsForCollectionRequestRepository.update(
            {
              billsForCollectionActionType: data?.billsForCollectionActionType,
              billsForCollectionProductType:
                billsForCollection?.billsForCollectionProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              billsReferenceNumber: billsForCollection?.referenceNumber,
              metadata: filterData,
            },
            {
              where: { requestId: data?.requestId },
              transaction,
              returning: true,
            },
          );

        await this.billsForCollectionAdjustmentRepository.update(
          {
            ...filterData,
            requestId: billsForCollectionRequestData?.requestId,
          },
          { where: { requestId: data?.requestId }, transaction },
        );
      } else {
        billsForCollectionRequestData =
          await this.billsForCollectionRequestRepository.create(
            {
              billsForCollectionActionType: data?.billsForCollectionActionType,
              billsForCollectionProductType:
                billsForCollection?.billsForCollectionProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              tenantId: data?.tenantId,
              billsReferenceNumber: billsForCollection?.referenceNumber,
              metadata: filterData,
            },
            { transaction },
          );

        await this.billsForCollectionAdjustmentRepository.create(
          {
            ...filterData,
            requestId: billsForCollectionRequestData?.requestId,
          },
          { transaction },
        );
      }

      if (userPermissions.includes('')) {
        await this.handleApproval({
          requestData: billsForCollectionRequestData,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryBillsForCollectionChargesAndTaxesTypeEnum.ADJUSTMENT,
          approverBranchCode: data?.initiatorBranchCode,
          transaction,
        });

        await this.billsForCollectionRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: billsForCollectionRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await billsForCollectionRequestData.reload();

    return billsForCollectionRequestData;
  }

  async acceptBillsForCollection(data: AcceptBillsForCollectionDto) {
    const { userPermissions, token, ...filterData } = data;

    const {
      billsForCollection,
      existingBillsForCollectionRequest,
      tradeProductData,
    } = await this.validateActionRequestAndGetTradeProductData(
      {
        billReferenceNumber: data?.billsReferenceNumber,
        requestId: data?.requestId,
        isDraft: data?.isDraft,
      },
      token,
    );

    let billsForCollectionRequestData: BillsForCollectionRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingBillsForCollectionRequest) {
          throw new BadRequestException(
            'Bills for Collection Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [billsForCollectionRequestData]] =
          await this.billsForCollectionRequestRepository.update(
            {
              billsForCollectionActionType: data?.billsForCollectionActionType,
              billsForCollectionProductType:
                billsForCollection?.billsForCollectionProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              billsReferenceNumber: billsForCollection?.referenceNumber,
              metadata: filterData,
            },
            {
              where: { requestId: data?.requestId },
              transaction,
              returning: true,
            },
          );

        await this.billsForCollectionAcceptanceRepository.update(
          {
            ...filterData,
            requestId: billsForCollectionRequestData?.requestId,
          },
          { where: { requestId: data?.requestId }, transaction },
        );
      } else {
        billsForCollectionRequestData =
          await this.billsForCollectionRequestRepository.create(
            {
              billsForCollectionActionType: data?.billsForCollectionActionType,
              billsForCollectionProductType:
                billsForCollection?.billsForCollectionProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              tenantId: data?.tenantId,
              billsReferenceNumber: billsForCollection?.referenceNumber,
              metadata: filterData,
            },
            { transaction },
          );

        await this.billsForCollectionAcceptanceRepository.create(
          {
            ...filterData,
            requestId: billsForCollectionRequestData?.requestId,
          },
          { transaction },
        );
      }

      if (userPermissions.includes('')) {
        await this.handleApproval({
          requestData: billsForCollectionRequestData,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryBillsForCollectionChargesAndTaxesTypeEnum.ACCEPTANCE,
          approverBranchCode: data?.initiatorBranchCode,
          transaction,
        });

        await this.billsForCollectionRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: billsForCollectionRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await billsForCollectionRequestData.reload();

    return billsForCollectionRequestData;
  }

  async nonAcceptanceOrNonPaymentBillsForCollection(
    data: NonAcceptanceOrNonPaymentBillsForCollectionDto,
  ) {
    const { userPermissions, token, ...filterData } = data;

    const {
      billsForCollection,
      existingBillsForCollectionRequest,
      tradeProductData,
    } = await this.validateActionRequestAndGetTradeProductData(
      {
        billReferenceNumber: data?.billsReferenceNumber,
        requestId: data?.requestId,
        isDraft: data?.isDraft,
      },
      token,
    );

    let billsForCollectionRequestData: BillsForCollectionRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingBillsForCollectionRequest) {
          throw new BadRequestException(
            'Bills for Collection Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [billsForCollectionRequestData]] =
          await this.billsForCollectionRequestRepository.update(
            {
              billsForCollectionActionType: data?.billsForCollectionActionType,
              billsForCollectionProductType:
                billsForCollection?.billsForCollectionProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              billsReferenceNumber: billsForCollection?.referenceNumber,
              metadata: filterData,
            },
            {
              where: { requestId: data?.requestId },
              transaction,
              returning: true,
            },
          );

        await this.billsForCollectionNonAcceptanceOrNonPaymentRepository.update(
          {
            ...filterData,
            requestId: billsForCollectionRequestData?.requestId,
          },
          { where: { requestId: data?.requestId }, transaction },
        );
      } else {
        billsForCollectionRequestData =
          await this.billsForCollectionRequestRepository.create(
            {
              billsForCollectionActionType: data?.billsForCollectionActionType,
              billsForCollectionProductType:
                billsForCollection?.billsForCollectionProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              tenantId: data?.tenantId,
              billsReferenceNumber: billsForCollection?.referenceNumber,
              metadata: filterData,
            },
            { transaction },
          );

        await this.billsForCollectionNonAcceptanceOrNonPaymentRepository.create(
          {
            ...filterData,
            requestId: billsForCollectionRequestData?.requestId,
          },
          { transaction },
        );
      }

      if (userPermissions.includes('')) {
        await this.handleApproval({
          requestData: billsForCollectionRequestData,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryBillsForCollectionChargesAndTaxesTypeEnum.NON_ACCEPTANCE_OR_NON_PAYMENT,
          approverBranchCode: data?.initiatorBranchCode,
          transaction,
        });

        await this.billsForCollectionRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: billsForCollectionRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await billsForCollectionRequestData.reload();

    return billsForCollectionRequestData;
  }

  async payBillsForCollection(data: PayBillsForCollectionDto) {
    const { userPermissions, token, ...filterData } = data;

    const {
      billsForCollection,
      existingBillsForCollectionRequest,
      tradeProductData,
    } = await this.validateActionRequestAndGetTradeProductData(
      {
        billReferenceNumber: data?.billsReferenceNumber,
        requestId: data?.requestId,
        isDraft: data?.isDraft,
      },
      token,
    );

    let billsForCollectionRequestData: BillsForCollectionRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingBillsForCollectionRequest) {
          throw new BadRequestException(
            'Bills for Collection Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [billsForCollectionRequestData]] =
          await this.billsForCollectionRequestRepository.update(
            {
              billsForCollectionActionType: data?.billsForCollectionActionType,
              billsForCollectionProductType:
                billsForCollection?.billsForCollectionProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              billsReferenceNumber: billsForCollection?.referenceNumber,
              metadata: filterData,
            },
            {
              where: { requestId: data?.requestId },
              transaction,
              returning: true,
            },
          );

        await this.billsForCollectionPaymentRepository.update(
          {
            ...filterData,
            requestId: billsForCollectionRequestData?.requestId,
          },
          { where: { requestId: data?.requestId }, transaction },
        );
      } else {
        billsForCollectionRequestData =
          await this.billsForCollectionRequestRepository.create(
            {
              billsForCollectionActionType: data?.billsForCollectionActionType,
              billsForCollectionProductType:
                billsForCollection?.billsForCollectionProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              tenantId: data?.tenantId,
              billsReferenceNumber: billsForCollection?.referenceNumber,
              metadata: filterData,
            },
            { transaction },
          );

        await this.billsForCollectionPaymentRepository.create(
          {
            ...filterData,
            requestId: billsForCollectionRequestData?.requestId,
          },
          { transaction },
        );
      }

      if (userPermissions.includes('')) {
        await this.handleApproval({
          requestData: billsForCollectionRequestData,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryBillsForCollectionChargesAndTaxesTypeEnum.PAYMENT,
          approverBranchCode: data?.initiatorBranchCode,
          transaction,
        });

        await this.billsForCollectionRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: billsForCollectionRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await billsForCollectionRequestData.reload();

    return billsForCollectionRequestData;
  }

  async receiveAcknowledgementBillsForCollection(
    data: ReceiveAcknowledgementBillsForCollectionDto,
  ) {
    const { userPermissions, token, ...filterData } = data;

    const {
      billsForCollection,
      existingBillsForCollectionRequest,
      tradeProductData,
    } = await this.validateActionRequestAndGetTradeProductData(
      {
        billReferenceNumber: data?.billsReferenceNumber,
        requestId: data?.requestId,
        isDraft: data?.isDraft,
      },
      token,
    );

    let billsForCollectionRequestData: BillsForCollectionRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingBillsForCollectionRequest) {
          throw new BadRequestException(
            'Bills for Collection Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [billsForCollectionRequestData]] =
          await this.billsForCollectionRequestRepository.update(
            {
              billsForCollectionActionType: data?.billsForCollectionActionType,
              billsForCollectionProductType:
                billsForCollection?.billsForCollectionProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              billsReferenceNumber: billsForCollection?.referenceNumber,
              metadata: filterData,
            },
            {
              where: { requestId: data?.requestId },
              transaction,
              returning: true,
            },
          );

        await this.billsForCollectionReceiveAcknowledgementRepository.update(
          {
            ...filterData,
            requestId: billsForCollectionRequestData?.requestId,
          },
          { where: { requestId: data?.requestId }, transaction },
        );
      } else {
        billsForCollectionRequestData =
          await this.billsForCollectionRequestRepository.create(
            {
              billsForCollectionActionType: data?.billsForCollectionActionType,
              billsForCollectionProductType:
                billsForCollection?.billsForCollectionProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              tenantId: data?.tenantId,
              billsReferenceNumber: billsForCollection?.referenceNumber,
              metadata: filterData,
            },
            { transaction },
          );

        await this.billsForCollectionReceiveAcknowledgementRepository.create(
          {
            ...filterData,
            requestId: billsForCollectionRequestData?.requestId,
          },
          { transaction },
        );
      }

      if (userPermissions.includes('')) {
        await this.handleApproval({
          requestData: billsForCollectionRequestData,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryBillsForCollectionChargesAndTaxesTypeEnum.RECEIVE_ACKNOWLEDGEMENT,
          approverBranchCode: data?.initiatorBranchCode,
          transaction,
        });

        await this.billsForCollectionRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: billsForCollectionRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await billsForCollectionRequestData.reload();

    return billsForCollectionRequestData;
  }

  async freeFormat(data: BillsForCollectionFreeFormatMessageDto) {
    const { userPermissions, token, ...filterData } = data;

    const {
      billsForCollection,
      existingBillsForCollectionRequest,
      tradeProductData,
    } = await this.validateActionRequestAndGetTradeProductData(
      {
        billReferenceNumber: data.billsReferenceNumber,
        requestId: data?.requestId,
        isDraft: data?.isDraft,
      },
      token,
    );

    let billsForCollectionRequestData: BillsForCollectionRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingBillsForCollectionRequest) {
          throw new BadRequestException(
            'Bills for Collection Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }

        [, [billsForCollectionRequestData]] =
          await this.billsForCollectionRequestRepository.update(
            {
              billsForCollectionActionType: data?.billsForCollectionActionType,
              billsForCollectionProductType:
                billsForCollection?.billsForCollectionProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              billsReferenceNumber: billsForCollection?.referenceNumber,
              metadata: filterData,
            },
            {
              where: { requestId: data?.requestId },
              transaction,
              returning: true,
            },
          );

        await this.billsForCollectionFreeFormatRepository.update(
          {
            ...filterData,
            requestId: billsForCollectionRequestData?.requestId,
          },
          { where: { requestId: data?.requestId }, transaction },
        );
      } else {
        billsForCollectionRequestData =
          await this.billsForCollectionRequestRepository.create(
            {
              billsForCollectionActionType:
                BillsForCollectionActionTypeEnum.FREE_FORMAT,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              tenantId: data?.tenantId,
              billsReferenceNumber: data?.billsReferenceNumber,
              metadata: filterData,
            },
            { transaction },
          );

        await this.billsForCollectionFreeFormatRepository.create(
          {
            ...filterData,
            requestId: billsForCollectionRequestData?.requestId,
          },
          { transaction },
        );
      }

      if (userPermissions.includes('')) {
        await this.handleApproval({
          requestData: billsForCollectionRequestData,
          approverBranchCode: data?.initiatorBranchCode,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryBillsForCollectionChargesAndTaxesTypeEnum.FREE_FORMAT,
          transaction,
        });

        await this.billsForCollectionRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: billsForCollectionRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await billsForCollectionRequestData.reload();

    return billsForCollectionRequestData;
  }

  async closeBillsForCollection(data: CloseBillsForCollectionDto) {
    const { userPermissions, token, ...filterData } = data;

    const {
      billsForCollection,
      existingBillsForCollectionRequest,
      tradeProductData,
    } = await this.validateActionRequestAndGetTradeProductData(
      {
        billReferenceNumber: data?.billsReferenceNumber,
        requestId: data?.requestId,
        isDraft: data?.isDraft,
      },
      token,
    );

    let billsForCollectionRequestData: BillsForCollectionRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingBillsForCollectionRequest) {
          throw new BadRequestException(
            'Bills for Collection Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [billsForCollectionRequestData]] =
          await this.billsForCollectionRequestRepository.update(
            {
              billsForCollectionActionType: data?.billsForCollectionActionType,
              billsForCollectionProductType:
                billsForCollection?.billsForCollectionProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              billsReferenceNumber: billsForCollection?.referenceNumber,
              metadata: filterData,
            },
            {
              where: { requestId: data?.requestId },
              transaction,
              returning: true,
            },
          );

        await this.billsForCollectionClosureRepository.update(
          {
            ...filterData,
            requestId: data?.requestId,
          },
          { where: { requestId: data?.requestId }, transaction },
        );
      } else {
        billsForCollectionRequestData =
          await this.billsForCollectionRequestRepository.create(
            {
              billsForCollectionActionType:
                BillsForCollectionActionTypeEnum.CLOSURE,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              tenantId: data?.tenantId,
              billsReferenceNumber: data?.billsReferenceNumber,
              metadata: filterData,
            },
            { transaction },
          );

        await this.billsForCollectionClosureRepository.create(
          {
            ...filterData,
            requestId: billsForCollectionRequestData?.requestId,
          },
          { transaction },
        );
      }

      if (userPermissions.includes('')) {
        await this.handleApproval({
          requestData: billsForCollectionRequestData,
          approverBranchCode: data?.initiatorBranchCode,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryBillsForCollectionChargesAndTaxesTypeEnum.CLOSURE,
          transaction,
        });

        await this.billsForCollectionRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: billsForCollectionRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await billsForCollectionRequestData.reload();

    return billsForCollectionRequestData;
  }

  private async validateActionRequestAndGetTradeProductData(
    data: {
      billReferenceNumber?: string;
      requestId?: string;
      isDraft?: boolean;
    },
    token?: string,
  ): Promise<{
    billsForCollection: any;
    tradeProductData: any;
    existingBillsForCollectionRequest: BillsForCollectionRequest | null;
  }> {
    const billsForCollection = await this.billsForCollectionRepository.findOne({
      where: { referenceNumber: data?.billReferenceNumber },
    });

    if (!billsForCollection) {
      throw new NotFoundException(
        `Bills for Collection with reference number ${data?.billReferenceNumber} not found.`,
      );
    }

    if (
      billsForCollection?.status === BillsForCollectionActionTypeEnum.CLOSURE ||
      billsForCollection?.status === BillsForCollectionActionTypeEnum.EXPIRY
    ) {
      throw new BadRequestException(
        `Bills for Collection with reference number ${data?.billReferenceNumber} has already been closed or expired.`,
      );
    }

    let existingBillsForCollectionRequest: BillsForCollectionRequest | null =
      null;

    if (data?.requestId) {
      existingBillsForCollectionRequest =
        await this.billsForCollectionRequestRepository.findOne({
          where: {
            requestId: data?.requestId,
            approvalStatus: { [Op.not]: ApprovalStatusEnum.REJECTED },
          },
        });
    }

    if (existingBillsForCollectionRequest && !data?.isDraft) {
      throw new BadRequestException(
        'A matching Bills for Collection request already exists in a non-final state (neither rejected nor approved).',
      );
    }

    if (!existingBillsForCollectionRequest && data?.isDraft) {
      throw new BadRequestException(
        'Bills for Collection Request is marked as draft but no existing matching record with the same request ID exists.',
      );
    }

    const tradeProductData =
      await this.tradeProductFactoryService.getProductDetails(
        billsForCollection?.tradeProductId,
        token,
      );

    return {
      billsForCollection,
      tradeProductData,
      existingBillsForCollectionRequest,
    };
  }

  async authorize(data: AuthorizeBillsForCollectionDto) {
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

    const billsForCollectionRequestData =
      await this.billsForCollectionRequestRepository.findOne({
        where: {
          requestId: id,
          approvalStatus: ApprovalStatusEnum.PENDING,
        },
      });

    if (!billsForCollectionRequestData) {
      throw new NotFoundException(
        'No Matching request with that requestId found',
      );
    }

    const tradeProductId =
      billsForCollectionRequestData?.metadata?.['tradeProductId'] ??
      billsForCollectionRequestData?.bookedBillsForCollection?.tradeProductId;

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
        billsForCollectionRequestData?.billsForCollectionActionType ===
        BillsForCollectionActionTypeEnum.BOOKING
      ) {
        regulatoryForm =
          await this.regulatoryFormService.getRegulatoryFormRecord(
            billsForCollectionRequestData?.applicationNumber,
            billsForCollectionRequestData?.billsForCollectionProductType ===
              BillsForCollectionProductTypeEnum.INWARD
              ? RegulatoryFormTypeEnum.FORM_M
              : RegulatoryFormTypeEnum.FORM_NXP,
          );

        switch (billsForCollectionRequestData?.billsForCollectionProductType) {
          case BillsForCollectionProductTypeEnum.INWARD:
            regulatoryForm = await this.regulatoryFormService.getFormMRecord(
              'formMId' in regulatoryForm ? regulatoryForm.formMId : undefined,
              {
                identifier: GetFormMRecordIdentifierEnum.FORM_M_ID,
              },
            );
            break;
          case BillsForCollectionProductTypeEnum.OUTWARD:
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
              'Invalid bills for collection product type',
            );
        }

        await regulatoryForm.reload();

        if (regulatoryForm?.status !== RegulatoryFormStatusEnum.REGISTERED) {
          throw new BadRequestException(
            `Bills for Collection can only be approved when it's corresponding Form M has a Registered status.`,
          );
        }
      }
    }

    if (
      billsForCollectionRequestData &&
      billsForCollectionRequestData?.billsForCollectionActionType !==
        BillsForCollectionActionTypeEnum.BOOKING &&
      !billsForCollectionRequestData?.billsReferenceNumber
    ) {
      throw new BadRequestException(
        'Bills Reference Number is not tied to this request which is required for this action type',
      );
    }

    let valueToUpdate: Partial<BillsForCollectionRequest>;

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
          requestData: billsForCollectionRequestData,
          approverBranchCode: approverBranchCode,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryBillsForCollectionChargesAndTaxesTypeEnum[
              BillsForCollectionActionTypeToTradeProductFactoryChargesAndTaxesTypeEnum[
                billsForCollectionRequestData?.billsForCollectionActionType
              ]
            ],
          transaction,
        });
      }

      await this.billsForCollectionRequestRepository.update(valueToUpdate, {
        where: { requestId: billsForCollectionRequestData?.requestId },
        transaction,
      });

      if (
        tradeProductData?.regulatoryFormRequired !==
        RegulatoryFormRequiredEnum.NONE
      ) {
        if (
          billsForCollectionRequestData?.billsForCollectionActionType ===
          BillsForCollectionActionTypeEnum.BOOKING
        ) {
          regulatoryForm =
            await this.regulatoryFormService.getRegulatoryFormRecord(
              regulatoryForm?.applicationNumber,
              billsForCollectionRequestData?.billsForCollectionProductType ===
                BillsForCollectionProductTypeEnum.INWARD
                ? RegulatoryFormTypeEnum.FORM_M
                : RegulatoryFormTypeEnum.FORM_NXP,
            );

          regulatoryForm.isTaken = true;

          await regulatoryForm.save({ transaction });
        }
      }
    });

    await billsForCollectionRequestData.reload();

    return billsForCollectionRequestData;
  }

  async handleApproval({
    requestData,
    approverBranchCode,
    tradeProductData,
    transaction,
    token,
    chargeType,
  }: {
    requestData: BillsForCollectionRequest;
    approverBranchCode: string;
    tradeProductData: TradeProductData;
    transaction: Transaction;
    token: string;
    chargeType: TradeProductFactoryBillsForCollectionChargesAndTaxesTypeEnum;
  }) {
    const {
      chargesAndTaxesCreditEntries,
      chargesAndTaxesDebitEntries,
      postingEntryDebitEntries,
      postingEntryCreditEntries,
      billsForCollection,
    } = await this.handleDebitAndCreditEntries({
      billsForCollectionActionType: requestData.billsForCollectionActionType,
      requestData,
      tradeProductData,
      chargeType,
      token,
    });

    let postingEntryTransactionId: string;
    let transactionReversalId: string;
    let chargesAndTaxesTransactionId: string;

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
        reconciliationRemarks: `Bills For Collection ${requestData.billsForCollectionActionType} Charges and Taxes`,
      });

      const journalPostingResponse = await this.camsService.postToJournal(
        journalPostingRequestBody,
        token,
      );

      chargesAndTaxesTransactionId =
        journalPostingResponse?.value?.transactionId;
    }

    if (
      postingEntryDebitEntries.length !== 0 ||
      postingEntryCreditEntries.length !== 0
    ) {
      const journalPostingRequestBody = createJournalPostingRequestBody({
        userId: requestData.initiatorId,
        branchCode: requestData.initiatorBranchCode,
        currencyShortCode:
          requestData?.metadata['collectionAmountCurrency'] ??
          billsForCollection?.collectionAmountCurrency,
        requestId: `${moment.utc().format('YYMMDD')}${this.nanoid()}`,
        debitEntries: postingEntryDebitEntries,
        creditEntries: postingEntryCreditEntries,
        initiatedBy: requestData.initiatorId,
        approvedByBranchCode: approverBranchCode,
        reconciliationRemarks: `Bills For Collection ${requestData.billsForCollectionActionType} Posting Entries`,
      });

      const journalPostingResponse = await this.camsService.postToJournal(
        journalPostingRequestBody,
        token,
      );

      postingEntryTransactionId = journalPostingResponse?.value?.transactionId;
    }

    const referenceNumber =
      requestData?.billsReferenceNumber ??
      (await this.generateReferenceNumber(
        requestData?.billsForCollectionProductType,
        tradeProductData?.slogan,
      ));

    switch (requestData?.billsForCollectionActionType) {
      case BillsForCollectionActionTypeEnum.BOOKING:
        await this.billsForCollectionRepository.create(
          {
            ...requestData?.metadata,
            billsForCollectionProductType:
              requestData?.billsForCollectionProductType,
            applicationNumber: requestData?.applicationNumber,
            referenceNumber: referenceNumber,
            requestId: requestData?.requestId,
          },
          { transaction },
        );
        break;
      case BillsForCollectionActionTypeEnum.AMENDMENT:
      case BillsForCollectionActionTypeEnum.ADJUSTMENT:
        await this.billsForCollectionRepository.update(requestData?.metadata, {
          where: {
            referenceNumber: requestData?.billsReferenceNumber,
          },
          transaction,
        });
        break;
      case BillsForCollectionActionTypeEnum.RECEIVE_ACKNOWLEDGEMENT:
        break;
      case BillsForCollectionActionTypeEnum.ACCEPTANCE:
        break;
      case BillsForCollectionActionTypeEnum.NON_ACCEPTANCE_OR_NON_PAYMENT:
        break;
      case BillsForCollectionActionTypeEnum.PAYMENT:
        break;
      case BillsForCollectionActionTypeEnum.CLOSURE:
        break;
      default:
        throw new BadRequestException(
          'Invalid bills for collection action type',
        );
    }

    const actionType = requestData.billsForCollectionActionType;

    if (chargesAndTaxesTransactionId) {
      await this.billsForCollectionRepository.appendChargesAndTaxesTransaction(
        referenceNumber,
        {
          billsForCollectionActionType: actionType,
          transactionId: chargesAndTaxesTransactionId,
        },
        { transaction },
      );
    }

    if (postingEntryTransactionId) {
      await this.billsForCollectionRepository.appendPostingEntryTransaction(
        referenceNumber,
        {
          billsForCollectionActionType: actionType,
          transactionId: postingEntryTransactionId,
          isReversed: false,
          transactionReversalId,
        },
        { transaction },
      );
    }
  }

  async handleDebitAndCreditEntries({
    billsForCollectionActionType,
    requestData,
    tradeProductData,
    chargeType,
    token,
    previewData,
  }: {
    billsForCollectionActionType: BillsForCollectionActionTypeEnum;
    requestData?: BillsForCollectionRequest;
    tradeProductData: TradeProductData;
    chargeType: TradeProductFactoryBillsForCollectionChargesAndTaxesTypeEnum;
    token: string;
    previewData?: any;
  }) {
    let billsForCollection: BillsForCollection;

    if (
      billsForCollectionActionType !== BillsForCollectionActionTypeEnum.BOOKING
    ) {
      billsForCollection = await this.billsForCollectionRepository.findOne({
        where: {
          referenceNumber:
            previewData?.billsReferenceNumber ??
            requestData?.billsReferenceNumber,
        },
      });
    }

    const billsForCollectionDebitAndCreditEntriesPayload: BillsForCollectionDebitAndCreditEntriesPayload =
      {
        token,
        drawee:
          previewData?.drawee ??
          requestData?.metadata['drawee'] ??
          billsForCollection?.drawee,
        drawer:
          previewData?.drawer ??
          requestData?.metadata['drawer'] ??
          billsForCollection?.drawer,
        remittingBankBicCode:
          previewData?.remittingBankBicCode ??
          requestData?.metadata['remittingBankBicCode'] ??
          billsForCollection?.remittingBankBicCode,
        presentingBankBicCode:
          previewData?.presentingBankBicCode ??
          requestData?.metadata['presentingBankBicCode'] ??
          billsForCollection?.presentingBankBicCode,
        collectionAmount:
          previewData?.collectionAmount ??
          requestData?.metadata['collectionAmount'] ??
          billsForCollection?.collectionAmount,
        collectionAmountCurrency:
          previewData?.collectionAmountCurrency ??
          requestData?.metadata['collectionAmountCurrency'] ??
          billsForCollection?.collectionAmountCurrency,
        localCurrency:
          previewData?.localCurrency ??
          requestData?.metadata['localCurrency'] ??
          billsForCollection?.localCcyCurrency,
        draftDetails:
          previewData?.draftDetails ??
          requestData?.metadata['draftDetails'] ??
          billsForCollection?.draftDetails,
        baseCcyEquivalent:
          previewData?.baseCcyEquivalent ??
          requestData?.metadata['baseCcyEquivalent'] ??
          billsForCollection?.baseCcyEquivalent,
        localCcyEquivalent:
          previewData?.localCcyEquivalent ??
          requestData?.metadata['localCcyEquivalent'] ??
          billsForCollection?.localCcyEquivalent,
        localCcyRate:
          previewData?.localCcyRate ??
          requestData?.metadata['localCcyRate'] ??
          billsForCollection?.localCcyRate,
        marginAmount:
          previewData?.marginAmount ??
          requestData?.metadata['marginAmount'] ??
          billsForCollection?.marginAmount,
        marginCurrency:
          previewData?.marginCurrency ??
          requestData?.metadata['marginCurrency'] ??
          billsForCollection?.marginCurrency,
        collateralAmount:
          previewData?.collateralAmount ??
          requestData?.metadata['collateralAmount'] ??
          billsForCollection?.collateralAmount,
        collateralCurrency:
          previewData?.collateralCurrency ??
          requestData?.metadata['collateralCurrency'] ??
          billsForCollection?.collateralCurrency,
      };

    switch (billsForCollectionActionType) {
      case BillsForCollectionActionTypeEnum.BOOKING:
        break;
      case BillsForCollectionActionTypeEnum.AMENDMENT:
        break;
      case BillsForCollectionActionTypeEnum.ADJUSTMENT:
        break;
      case BillsForCollectionActionTypeEnum.RECEIVE_ACKNOWLEDGEMENT:
        break;
      case BillsForCollectionActionTypeEnum.ACCEPTANCE:
        billsForCollectionDebitAndCreditEntriesPayload.amountAccepted =
          previewData?.amountAccepted ??
          requestData?.metadata['amountAccepted'];
        billsForCollectionDebitAndCreditEntriesPayload.amountAcceptedCurrency =
          previewData?.amountAcceptedCurrency ??
          requestData?.metadata['amountAcceptedCurrency'];
        break;
      case BillsForCollectionActionTypeEnum.NON_ACCEPTANCE_OR_NON_PAYMENT:
        break;
      case BillsForCollectionActionTypeEnum.PAYMENT:
        billsForCollectionDebitAndCreditEntriesPayload.amountCollected =
          previewData?.amountCollected ??
          requestData?.metadata['amountCollected'];
        billsForCollectionDebitAndCreditEntriesPayload.amountCollectedCurrency =
          previewData?.amountCollectedCurrency ??
          requestData?.metadata['amountCollectedCurrency'];
        break;
      case BillsForCollectionActionTypeEnum.CLOSURE:
        break;
      default:
        throw new BadRequestException(
          'Invalid bills for collection action type',
        );
    }

    const chargesAndTaxes = tradeProductData.chargesAndTaxes?.find(
      (item: ChargeAndTax) => item.type === chargeType,
    );

    const accountingEntry = tradeProductData?.accountingEntries?.find(
      (item: AccountingEntry) => item.type === chargeType,
    );

    if (!chargesAndTaxes) {
      throw new BadRequestException(
        `Bills For Collection ${chargeType} charges and taxes not found`,
      );
    }

    const {
      creditEntries: chargesAndTaxesCreditEntries,
      debitEntries: chargesAndTaxesDebitEntries,
    } = await this.handleChargesAndTaxes(
      billsForCollectionDebitAndCreditEntriesPayload,
      chargesAndTaxes,
      token,
    );

    let postingEntryCreditEntries = [];
    let postingEntryDebitEntries = [];

    const result = await this.handlePostingEntries(
      billsForCollectionDebitAndCreditEntriesPayload,
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
      billsForCollection,
    };
  }

  async handleChargesAndTaxes(
    billsForCollectionDebitAndCreditEntriesPayload: BillsForCollectionDebitAndCreditEntriesPayload,
    chargesAndTaxes: ChargeAndTax,
    token: string,
  ) {
    const debitEntries = [];
    const creditEntries = [];

    for (const applicableCharge of chargesAndTaxes.applicableCharges) {
      this.loggerService.debug(
        `applicable charge details - type: ${chargesAndTaxes?.type}; name: ${chargesAndTaxes?.name}; chargeAmountField: ${applicableCharge?.chargeAmountField}; chargeType: ${applicableCharge?.chargeType}; chargeAmountType: ${applicableCharge?.charge_amount_type};`,
        BillsForCollectionService.name,
      );

      let totalChargeAmount: number | undefined;

      if (applicableCharge?.chargeAmountField) {
        const chargeAmountField = applicableCharge.chargeAmountField;

        if (chargeAmountField === ChargeAmountFieldEnum.COLLECTION_AMOUNT) {
          totalChargeAmount =
            billsForCollectionDebitAndCreditEntriesPayload.localCcyEquivalent;
        } else if (chargeAmountField === ChargeAmountFieldEnum.DRAFT_AMOUNT) {
          const totalDraftAmount = (
            billsForCollectionDebitAndCreditEntriesPayload.draftDetails ?? []
          ).reduce(
            (acc: number, curr: BillsForCollectionDraftDetails) =>
              acc + (curr.draftAmount ?? 0),
            0,
          );
          totalChargeAmount =
            totalDraftAmount *
            billsForCollectionDebitAndCreditEntriesPayload.localCcyRate;
        } else if (chargeAmountField === ChargeAmountFieldEnum.BILL_AMOUNT) {
          const totalDraftAmount = (
            billsForCollectionDebitAndCreditEntriesPayload.draftDetails ?? []
          ).reduce(
            (acc: number, curr: BillsForCollectionDraftDetails) =>
              acc + (curr.draftAmount ?? 0),
            0,
          );
          totalChargeAmount =
            (billsForCollectionDebitAndCreditEntriesPayload.collectionAmount -
              totalDraftAmount) *
            billsForCollectionDebitAndCreditEntriesPayload.localCcyRate;
        } else if (
          chargeAmountField === ChargeAmountFieldEnum.TOTAL_TO_COLLECT_AMOUNT
        ) {
          const totalToCollect = (
            billsForCollectionDebitAndCreditEntriesPayload.draftDetails ?? []
          ).reduce(
            (acc: number, curr: BillsForCollectionDraftDetails) =>
              acc + (curr.toCollectAmount ?? 0),
            0,
          );
          totalChargeAmount =
            totalToCollect *
            billsForCollectionDebitAndCreditEntriesPayload.localCcyRate;
        } else if (chargeAmountField === ChargeAmountFieldEnum.PAYMENT_AMOUNT) {
          totalChargeAmount =
            billsForCollectionDebitAndCreditEntriesPayload.amountCollected *
            billsForCollectionDebitAndCreditEntriesPayload.localCcyRate;
        } else if (
          chargeAmountField === ChargeAmountFieldEnum.COLLATERAL_AMOUNT
        ) {
          totalChargeAmount =
            billsForCollectionDebitAndCreditEntriesPayload.collateralAmount *
            billsForCollectionDebitAndCreditEntriesPayload.localCcyRate;
        } else if (chargeAmountField === ChargeAmountFieldEnum.MARGIN_AMOUNT) {
          totalChargeAmount =
            billsForCollectionDebitAndCreditEntriesPayload.marginAmount *
            billsForCollectionDebitAndCreditEntriesPayload.localCcyRate;
        } else if (
          chargeAmountField === ChargeAmountFieldEnum.AMOUNT_ACCEPTED
        ) {
          totalChargeAmount =
            billsForCollectionDebitAndCreditEntriesPayload.amountAccepted *
            billsForCollectionDebitAndCreditEntriesPayload.localCcyRate;
        }
      } else {
        totalChargeAmount =
          billsForCollectionDebitAndCreditEntriesPayload.localCcyEquivalent;
      }

      const chargeData =
        await this.productManagementService.calculateChargeEntries(
          applicableCharge?.id,
          totalChargeAmount,
          billsForCollectionDebitAndCreditEntriesPayload.localCurrency,
          token,
          billsForCollectionDebitAndCreditEntriesPayload.drawee,
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
          billsForCollectionDebitAndCreditEntriesPayload.drawee,
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
                  billsForCollectionDebitAndCreditEntriesPayload.drawee,
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
        BillsForCollectionService.name,
      );

      const totalTaxAmount =
        billsForCollectionDebitAndCreditEntriesPayload.localCcyEquivalent;

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
          billsForCollectionDebitAndCreditEntriesPayload.drawee,
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
      debitEntries,
      creditEntries,
    };
  }

  async handlePostingEntries(
    billsForCollectionDebitAndCreditEntriesPayload: BillsForCollectionDebitAndCreditEntriesPayload,
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
        BillsForCollectionService.name,
      );

      let amount: number;

      if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.COLLECTION_AMOUNT
      ) {
        amount =
          billsForCollectionDebitAndCreditEntriesPayload.collateralAmount;
        currencyCode =
          billsForCollectionDebitAndCreditEntriesPayload.collateralCurrency;
      } else if (
        postingEntry?.postingAmountField === PostingAmountFieldEnum.DRAFT_AMOUNT
      ) {
        amount = (
          billsForCollectionDebitAndCreditEntriesPayload.draftDetails ?? []
        ).reduce(
          (acc: number, curr: BillsForCollectionDraftDetails) =>
            acc + (curr.draftAmount ?? 0),
          0,
        );
        currencyCode =
          billsForCollectionDebitAndCreditEntriesPayload.collateralCurrency;
      } else if (
        postingEntry?.postingAmountField === PostingAmountFieldEnum.BILL_AMOUNT
      ) {
        const totalDraftAmount = (
          billsForCollectionDebitAndCreditEntriesPayload.draftDetails ?? []
        ).reduce(
          (acc: number, curr: BillsForCollectionDraftDetails) =>
            acc + (curr.draftAmount ?? 0),
          0,
        );

        amount =
          billsForCollectionDebitAndCreditEntriesPayload.collectionAmount -
          totalDraftAmount;
        currencyCode =
          billsForCollectionDebitAndCreditEntriesPayload.collectionAmountCurrency;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.TOTAL_TO_COLLECT_AMOUNT
      ) {
        amount = (
          billsForCollectionDebitAndCreditEntriesPayload.draftDetails ?? []
        ).reduce(
          (acc: number, curr: BillsForCollectionDraftDetails) =>
            acc + (curr.toCollectAmount ?? 0),
          0,
        );
        currencyCode =
          billsForCollectionDebitAndCreditEntriesPayload.collateralCurrency;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.PAYMENT_AMOUNT
      ) {
        amount = billsForCollectionDebitAndCreditEntriesPayload.amountCollected;
        currencyCode =
          billsForCollectionDebitAndCreditEntriesPayload.amountCollectedCurrency;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.COLLATERAL_AMOUNT
      ) {
        amount =
          billsForCollectionDebitAndCreditEntriesPayload.collateralAmount;
        currencyCode =
          billsForCollectionDebitAndCreditEntriesPayload.collateralCurrency;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.MARGIN_AMOUNT
      ) {
        amount = billsForCollectionDebitAndCreditEntriesPayload.marginAmount;
        currencyCode =
          billsForCollectionDebitAndCreditEntriesPayload.marginCurrency;
      } else if (
        postingEntry?.postingAmountField ===
        PostingAmountFieldEnum.AMOUNT_ACCEPTED
      ) {
        amount = billsForCollectionDebitAndCreditEntriesPayload.amountAccepted;
        currencyCode =
          billsForCollectionDebitAndCreditEntriesPayload.amountAcceptedCurrency;
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

      const { drawee, drawer, remittingBankBicCode, presentingBankBicCode } =
        billsForCollectionDebitAndCreditEntriesPayload;

      const debitAccountNumber = await this.handleAccountNumberRetrieval(
        postingEntry?.debitEntryParty,
        postingEntry?.debitEntryAccountType,
        { drawee, drawer, remittingBankBicCode, presentingBankBicCode },
        EntryTypeEnum.DEBIT,
        token,
        currencyCode,
      );

      const creditAccountNumber = await this.handleAccountNumberRetrieval(
        postingEntry?.creditEntryParty,
        postingEntry?.creditEntryAccountType,
        { drawee, drawer, remittingBankBicCode, presentingBankBicCode },
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

  async handleAccountNumberRetrieval(
    entryParty: EntryPartyEnum,
    entryAccountType: TradeAccountTypeEnum,
    data: {
      drawee?: string;
      drawer?: string;
      remittingBankBicCode?: string;
      presentingBankBicCode?: string;
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
      case EntryPartyEnum.DRAWEE:
        swiftBic = data?.drawee;
        break;
      case EntryPartyEnum.DRAWER:
        swiftBic = data?.drawer;
        break;
      case EntryPartyEnum.REMITTING_BANK:
        swiftBic = data?.remittingBankBicCode;
        break;
      case EntryPartyEnum.PRESENTING_BANK:
        swiftBic = data?.presentingBankBicCode;
        break;
      case EntryPartyEnum.ISSUING_BANK:
        swiftBic = SwiftBICEnum.STERLING;
        break;
      default:
        throw new BadRequestException(
          `${entryType} Entry Party is not supported for Bills for Collection`,
        );
    }

    if (
      !swiftBic &&
      entryParty !== EntryPartyEnum.DRAWEE &&
      entryParty !== EntryPartyEnum.DRAWER
    ) {
      throw new BadRequestException(
        `${entryType} Entry Party SWIFT BIC is not defined for ${entryParty} in the Bills for Collection Entry`,
      );
    }

    if (
      entryParty === EntryPartyEnum.DRAWEE ||
      entryParty === EntryPartyEnum.DRAWER
    ) {
      const customerData: CustomerSearchResponse =
        await this.customerManagementService.searchCustomerByAccountNumber(
          token,
          entryParty === EntryPartyEnum.DRAWEE ? data?.drawee : data?.drawer,
        );

      if (!customerData) {
        throw new NotFoundException(
          `${entryType} Entry Party with Applicant Account ${entryParty === EntryPartyEnum.DRAWEE ? data?.drawee : data?.drawer} Customer Data not found.`,
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
          `${entryType} Entry Party with Applicant Account ${entryParty === EntryPartyEnum.DRAWEE ? data?.drawee : data?.drawer} Trade Accounts not found.`,
        );
      }

      const tradeAccount = tradeAccounts.find(
        (account: TradeAccount) =>
          account.currencyCode === currencyCode &&
          account.accountType.toLowerCase() === entryAccountType.toLowerCase(),
      );

      if (!tradeAccount) {
        throw new BadRequestException(
          `No trade account found for ${entryType} entry party: applicant account ${entryParty === EntryPartyEnum.DRAWEE ? data?.drawee : data?.drawer}, currency ${currencyCode}, account type ${entryAccountType}`,
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

  async getBillsForCollectionRecords(
    options: GetBillsForCollectionRecordsDto,
  ): Promise<GetBillsForCollectionRequestResponse> {
    const {
      id,
      branch,
      page = 1,
      size = 10,
      startDate,
      endDate,
      recordScope = AuthorizationStatusEnum.CREATED_BY_ME,
      bfcProductType,
      bfcState,
      billCode,
      applicantName,
    } = options;

    const query: { where: Partial<BillsForCollection> | any } = {
      where: {},
    };

    switch (recordScope) {
      case AuthorizationStatusEnum.CREATED_BY_ME:
      case AuthorizationStatusEnum.INITIATED_BY_ME:
        query.where['$billsForCollectionRequest.initiatorId$'] = id;
        break;
      case AuthorizationStatusEnum.APPROVED_BY_ME:
      case AuthorizationStatusEnum.SENT_TO_ME:
        query.where['$billsForCollectionRequest.approverId$'] = id;
        break;
      case AuthorizationStatusEnum.CREATED_BY_MY_BRANCH:
      case AuthorizationStatusEnum.INITIATED_BY_MY_BRANCH:
        query.where['$billsForCollectionRequest.initiatorBranchCode$'] = branch;
        break;
      case AuthorizationStatusEnum.APPROVED_BY_MY_BRANCH:
      case AuthorizationStatusEnum.SENT_TO_MY_BRANCH:
        query.where['$billsForCollectionRequest.approverBranchCode$'] = branch;
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

    if (bfcProductType) {
      query.where.billsForCollectionProductType = bfcProductType;
    }

    if (bfcState) {
      query.where.state = bfcState;
    }

    if (billCode) {
      query.where.referenceNumber = billCode;
    }

    if (applicantName) {
      query.where.drawer = applicantName;
    }

    const { count: totalRecords, rows: billsForCollectionRecords } =
      await this.billsForCollectionRepository.findAndCountAll({
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
      billsForCollectionRecords,
    };
  }

  async getBillsForCollectionRequests(
    options: GetBillsForCollectionRecordsDto,
  ): Promise<GetBillsForCollectionRequestResponse> {
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
      bfcProductType,
      bfcStatus,
      bfcState,
      billCode,
      applicantName,
    } = options;

    const query: { where: Partial<BillsForCollectionRequest> | any } = {
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
      query.where.billsForCollectionActionType = {
        [Op.in]: [BillsForCollectionActionTypeEnum.BOOKING],
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

    if (bfcStatus) {
      query.where.billsForCollectionActionType = bfcStatus;
    }

    if (bfcProductType) {
      query.where.billsForCollectionProductType = bfcProductType;
    }

    const orFilters: any[] = [];

    if (billCode) {
      orFilters.push({
        '$billsForCollection.referenceNumber$': { [Op.iLike]: `%${billCode}%` },
      });
    }

    if (applicantName) {
      orFilters.push({
        '$billsForCollection.drawer$': { [Op.iLike]: `%${applicantName}%` },
      });
    }

    if (bfcState) {
      orFilters.push({
        '$billsForCollection.state$': {
          [Op.iLike]: `%${bfcState as BillsForCollectionStateEnum}%`,
        },
      });
    }

    if (orFilters.length > 0) {
      query.where = {
        [Op.and]: [query.where, { [Op.or]: orFilters }],
      };
    }

    const { count: totalRecords, rows: billsForCollectionRecords } =
      await this.billsForCollectionRequestRepository.findAndCountAll({
        ...query,
        subQuery: false,
        include: [
          {
            model: BillsForCollection,
            as: 'billsForCollection',
            required: false,
          },
          {
            model: BillsForCollectionAmendment,
            as: 'amendment',
            required: false,
          },
          {
            model: BillsForCollectionAdjustment,
            as: 'adjustment',
            required: false,
          },
          {
            model: BillsForCollectionNonAcceptanceOrNonPayment,
            as: 'nonAcceptanceOrNonPayment',
            required: false,
          },
          {
            model: BillsForCollectionPayment,
            as: 'payment',
            required: false,
          },
          {
            model: BillsForCollectionReceiveAcknowledgement,
            as: 'receiveAcknowledgement',
            required: false,
          },
          {
            model: BillsForCollectionAcceptance,
            as: 'acceptance',
            required: false,
          },
          {
            model: BillsForCollectionFreeFormatMessage,
            as: 'freeFormat',
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
      billsForCollectionRecords,
    };
  }

  async withdraw(id: string, initiatorId: string) {
    const billsForCollectionRequestData =
      await this.billsForCollectionRequestRepository.findOne({
        where: {
          requestId: id,
          initiatorId,
          approvalStatus: {
            [Op.in]: [ApprovalStatusEnum.PENDING, ApprovalStatusEnum.REJECTED],
          },
        },
      });

    if (!billsForCollectionRequestData) {
      throw new NotFoundException(
        'No Matching request with that Request Id initiated by this user found',
      );
    }

    await this.billsForCollectionRequestRepository.update(
      {
        approvalStatus: null,
        requestStatus: RequestStatusEnum.DRAFT,
      },
      { where: { requestId: billsForCollectionRequestData?.requestId } },
    );

    return this.billsForCollectionRequestRepository.findOne({
      where: { requestId: billsForCollectionRequestData?.requestId },
    });
  }

  async delete(id: string, initiatorId: string) {
    const billsForCollectionRequestData =
      await this.billsForCollectionRequestRepository.findOne({
        where: {
          requestId: id,
          initiatorId,
          approvalStatus: ApprovalStatusEnum.PENDING,
        },
      });

    if (!billsForCollectionRequestData) {
      throw new NotFoundException(
        'No Matching request with that Request Id initiated by this user found',
      );
    }

    const deletedBillsForCollectionRequestCount =
      await this.billsForCollectionRequestRepository.delete({
        where: { requestId: billsForCollectionRequestData?.requestId },
      });

    return deletedBillsForCollectionRequestCount;
  }

  async getRecordsStatusCount(
    id: string,
    branch: string,
    statusType: RecordsStatusTypeEnum,
    recordScope: AuthorizationStatusEnum,
    requestStatus: RequestStatusEnum,
  ) {
    const query: { where: Partial<BillsForCollectionRequest> } = {
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

    const billsForCollectionRecordsStatusCount =
      await this.billsForCollectionRequestRepository.scope(null).findAll({
        where: query.where,
        attributes: [
          [
            BillsForCollectionStatusTypeToColumnMappingEnum[statusType],
            'status',
          ],
          [this.sequelize.fn('COUNT', this.sequelize.literal('*')), 'count'],
        ],
        group: [BillsForCollectionStatusTypeToColumnMappingEnum[statusType]],
        raw: true,
      });

    return billsForCollectionRecordsStatusCount.map((record: any) => ({
      status: record.status,
      count: parseInt(record.count, 10),
    }));
  }

  async getBillsForCollectionRecordByReferenceNumber(
    referenceNumber: string,
  ): Promise<BillsForCollection> {
    const billsForCollectionRecord =
      await this.billsForCollectionRepository.findOne({
        where: { referenceNumber },
        include: [
          {
            model: BillsForCollectionAmendment,
            as: 'amendments',
            required: false,
          },
          {
            model: BillsForCollectionAdjustment,
            as: 'adjustments',
            required: false,
          },
          {
            model: BillsForCollectionNonAcceptanceOrNonPayment,
            as: 'nonAcceptanceOrNonPayments',
            required: false,
          },
          {
            model: BillsForCollectionPayment,
            as: 'payments',
            required: false,
          },
          {
            model: BillsForCollectionReceiveAcknowledgement,
            as: 'receiveAcknowledgements',
            required: false,
          },
          {
            model: BillsForCollectionAcceptance,
            as: 'acceptances',
            required: false,
          },
          {
            model: BillsForCollectionFreeFormatMessage,
            as: 'freeFormats',
            required: false,
          },
        ],
        order: [
          [
            { model: BillsForCollectionAmendment, as: 'amendments' },
            'createdAt',
            'DESC',
          ],
          [
            { model: BillsForCollectionAdjustment, as: 'adjustments' },
            'createdAt',
            'DESC',
          ],
          [
            {
              model: BillsForCollectionNonAcceptanceOrNonPayment,
              as: 'nonAcceptanceOrNonPayments',
            },
            'createdAt',
            'DESC',
          ],
          [
            { model: BillsForCollectionPayment, as: 'payments' },
            'createdAt',
            'DESC',
          ],
          [
            {
              model: BillsForCollectionReceiveAcknowledgement,
              as: 'receiveAcknowledgements',
            },
            'createdAt',
            'DESC',
          ],
          [
            {
              model: BillsForCollectionAcceptance,
              as: 'acceptances',
            },
            'createdAt',
            'DESC',
          ],
          [
            { model: BillsForCollectionFreeFormatMessage, as: 'freeFormats' },
            'createdAt',
            'DESC',
          ],
        ],
      });

    if (!billsForCollectionRecord) {
      throw new NotFoundException(
        `No Bills For Collection Record found with reference number ${referenceNumber}`,
      );
    }

    return billsForCollectionRecord;
  }

  async validateRegulatoryFormForBillsForCollectionRequestInitiation(
    applicationNumber: string,
    billsForCollectionProductType: BillsForCollectionProductTypeEnum,
  ): Promise<{
    isValid: boolean;
    regulatoryForm: FormM | FormNXP | FormNCX | FormA;
  }> {
    const regulatoryForm =
      await this.regulatoryFormService.getRegulatoryFormRecord(
        applicationNumber,
        billsForCollectionProductType ===
          BillsForCollectionProductTypeEnum.INWARD
          ? RegulatoryFormTypeEnum.FORM_M
          : RegulatoryFormTypeEnum.FORM_NXP,
      );

    if (!regulatoryForm) {
      throw new NotFoundException(
        `No Regulatory Form record found with application number ${applicationNumber}`,
      );
    }

    if (regulatoryForm.isTaken) {
      return {
        isValid: false,
        regulatoryForm,
      };
    }

    const billsForCollectionRequest =
      await this.billsForCollectionRequestRepository.findOne({
        where: {
          applicationNumber,
          billsForCollectionActionType: {
            [Op.in]: [BillsForCollectionActionTypeEnum.BOOKING],
          },
          approvalStatus: {
            [Op.not]: ApprovalStatusEnum.REJECTED,
          },
        },
      });

    return {
      isValid: billsForCollectionRequest === null,
      regulatoryForm,
    };
  }

  async getBillsForCollectionByRequestId(
    requestId: string,
    isRecord: boolean = false,
  ): Promise<BillsForCollectionRequest | BillsForCollection> {
    let billsForCollection: any;

    if (isRecord) {
      billsForCollection = await this.billsForCollectionRepository.findOne({
        where: {
          requestId: requestId,
        },
      });
    } else {
      billsForCollection =
        await this.billsForCollectionRequestRepository.findOne({
          where: {
            requestId: requestId,
          },
        });
    }

    if (!billsForCollection) {
      throw new NotFoundException(
        `No Bills For Collection ${isRecord ? 'Record' : 'Request'} found with request ID ${requestId}`,
      );
    }

    return billsForCollection;
  }

  async getBillsForCollectionByRegulatoryFormNumber(
    regulatoryFormNumber: string,
  ): Promise<BillsForCollection> {
    const billsForCollection = await this.billsForCollectionRepository.findOne({
      where: { applicationNumber: regulatoryFormNumber },
    });

    if (!billsForCollection) {
      throw new NotFoundException(
        `No Bills For Collection Record found with Regulatory Form Number ${regulatoryFormNumber}`,
      );
    }

    return billsForCollection;
  }
}
