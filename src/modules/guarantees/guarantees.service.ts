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
  GuaranteesAdjustmentRepository,
  GuaranteesDocumentsPresentedRepository,
  GuaranteesReceiveAcknowledgementRepository,
  GuaranteesReceiveClaimRepository,
  GuaranteesRepository,
  GuaranteesAmendmentRepository,
  GuaranteesRequestRepository,
  GuaranteesFreeFormatRepository,
  GuaranteesCancellationRepository,
} from './guarantees.repository';
import { IssueGuaranteeDto } from './dto/issue-guarantee.dto';
import {
  ApprovalStatusEnum,
  AuthorizationStatusEnum,
  GuaranteesActionTypeEnum,
  GuaranteesProductTypeEnum,
  GuaranteesStateEnum,
  GetFormMRecordIdentifierEnum,
  IANATimeZoneDatabaseEnum,
  GetFormNXPRecordIdentifierEnum,
  RegulatoryFormRequiredEnum,
  RegulatoryFormStatusEnum,
  RegulatoryFormTypeEnum,
  RequestStatusEnum,
  TradeProductFactoryGuaranteesChargesAndTaxesTypeEnum,
  RecordsStatusTypeEnum,
  GuaranteesStatusTypeToColumnMappingEnum,
  GuaranteesActionTypeToTradeProductFactoryChargesAndTaxesTypeEnum,
  EntryPartyEnum,
  TradeAccountTypeEnum,
  EntryTypeEnum,
  SwiftBICEnum,
} from 'src/common/enums';
import { Op, QueryTypes, Transaction } from 'sequelize';
import { GuaranteesRequest } from './models/guarantees-request.model';
import { AmendGuaranteeDto } from './dto/amend-guarantee.dto';
import { AdjustGuaranteeDto } from './dto/adjust-guarantee.dto';
import { ReceiveAcknowledgementGuaranteeDto } from './dto/receive-acknowledgement-guarantee.dto';
import { ReceiveClaimGuaranteeDto } from './dto/receive-claim-guarantee.dto';
import { DocumentsPresentedGuaranteeDto } from './dto/documents-presented-guarantee.dto';
import { AuthorizeGuaranteeDto } from './dto/authorize-guarantee.dto';
import { FormM } from '../regulatory-form/models/form-m.model';
import { FormNXP } from '../regulatory-form/models/form-nxp.model';
import { FormA } from '../regulatory-form/models/form-a.model';
import { FormNCX } from '../regulatory-form/models/form-ncx.model';
import { GetGuaranteesRecordsDto } from './dto/get-guarantees-records.dto';
import { Guarantees } from './models/guarantees.model';
import * as moment from 'moment-timezone';
import { GetGuaranteesRequestResponse } from './interfaces/get-guarantees-records';
import { GuaranteesAmendment } from './models/guarantess-amendment.model';
import { GuaranteesAdjustment } from './models/guarantees-adjustment.model';
import { GuaranteesReceiveAcknowledgement } from './models/guarantees-receive-acknowledgement.model';
import {
  ChargeAndTax,
  CounterParty,
  CounterPartyAccount,
  CustomerSearchResponse,
  TradeAccount,
  TradeProductData,
} from 'src/common/interfaces';
import { customAlphabet } from 'nanoid';
import { GuaranteesFreeFormatDto } from './dto/guarantees-free-format.dto';
import { GuaranteesReceiveClaim } from './models/guarantees-receive-claim.model';
import { GuaranteesDocumentsPresented } from './models/guarantees-documents-presented.model';
import { GuaranteesCancellation } from './models/gurantees-cancellation.model';
import { GuaranteesFreeFormat } from './models/guarantees-free-format.model';
import { CancelGuaranteeDto } from './dto/cancel-guarantee.dto';
import { GuaranteesDebitAndCreditEntriesPayload } from './types/guarantees-debit-and-credit-entries-payload.types';
import createJournalPostingRequestBody from 'src/common/utils/create-journal-posting-request-body.util';

export class GuaranteesService {
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
    private readonly guaranteesRepository: GuaranteesRepository,
    private readonly guaranteesRequestRepository: GuaranteesRequestRepository,
    private readonly guaranteesAmendmentRepository: GuaranteesAmendmentRepository,
    private readonly guaranteesAdjustmentRepository: GuaranteesAdjustmentRepository,
    private readonly guaranteesReceiveAcknowledgementRepository: GuaranteesReceiveAcknowledgementRepository,
    private readonly guaranteesReceiveClaimRepository: GuaranteesReceiveClaimRepository,
    private readonly guaranteesDocumentsPresentedRepository: GuaranteesDocumentsPresentedRepository,
    private readonly guaranteesCancellationRepository: GuaranteesCancellationRepository,
    private readonly guaranteesFreeFormatRepository: GuaranteesFreeFormatRepository,
  ) {}

  async generateReferenceNumber(
    guaranteesProductType: GuaranteesProductTypeEnum,
    slogan?: string,
  ): Promise<string> {
    const sequence = await this.sequelize.query(
      `SELECT nextval('guarantees_reference_number_seq') AS nextval`,
      { type: QueryTypes.SELECT },
    );

    const creationYear = moment().format('YY');

    const nextVal = sequence[0]['nextval'];
    const prefix =
      guaranteesProductType === GuaranteesProductTypeEnum.ISSUED
        ? 'IGT'
        : 'RGT';
    return `SB/${prefix}${creationYear}${String(nextVal).padStart(4, '0')}${slogan ? slogan.toUpperCase() : ''}`;
  }

  async getDebitAndCreditEntries(data: any, token: string) {
    let tradeProductData: TradeProductData;
    let guarantees: Guarantees;

    if (data?.tradeProductId) {
      tradeProductData =
        await this.tradeProductFactoryService.getProductDetails(
          data?.tradeProductId,
          token,
        );
    } else {
      guarantees = await this.guaranteesRepository.findOne({
        where: { referenceNumber: data?.guaranteesReferenceNumber },
      });

      tradeProductData =
        await this.tradeProductFactoryService.getProductDetails(
          guarantees?.tradeProductId,
          token,
        );
    }

    const debitAndCreditEntries = await this.handleDebitAndCreditEntries({
      guaranteesActionType: data?.guaranteesActionType,
      tradeProductData,
      chargeType:
        TradeProductFactoryGuaranteesChargesAndTaxesTypeEnum[
          GuaranteesActionTypeToTradeProductFactoryChargesAndTaxesTypeEnum[
            data?.guaranteesActionType
          ]
        ],
      token,
      previewData: data,
    });

    return debitAndCreditEntries;
  }

  async saveGuaranteesAsDraft(data: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userPermissions, token, ...filterData } = data;

    const existingGuaranteesRequest =
      await this.guaranteesRequestRepository.findOne({
        where: {
          requestId: data?.requestId,
        },
      });

    if (!existingGuaranteesRequest && data?.isDraft) {
      throw new BadRequestException(
        'Guarantees is marked as draft but no existing matching record with the same reference ID exists.',
      );
    }

    data.requestStatus = RequestStatusEnum.DRAFT;
    data.approvalStatus = null;

    let savedGuarantees: any;

    if (data?.isDraft) {
      [, [savedGuarantees]] = await this.guaranteesRequestRepository.update(
        {
          guaranteesActionType: data?.guaranteesActionType,
          guaranteesProductType: data?.guaranteesProductType,
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

      return savedGuarantees;
    }

    savedGuarantees = await this.guaranteesRequestRepository.create({
      guaranteesActionType: data?.guaranteesActionType,
      guaranteesProductType: data?.guaranteesProductType,
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

    return savedGuarantees;
  }

  async validateGuaranteesRequest(
    requestData: IssueGuaranteeDto,
    tradeProductData: TradeProductData,
    token: string,
    guaranteesActionType: GuaranteesActionTypeEnum,
  ) {
    const guarantees = requestData;
    if (
      tradeProductData?.regulatoryFormRequired !==
      RegulatoryFormRequiredEnum.NONE
    ) {
      const regulatoryForm =
        await this.regulatoryFormService.getRegulatoryFormRecord(
          guarantees?.applicationNumber,
          GuaranteesProductTypeEnum.ISSUED === guarantees?.guaranteesProductType
            ? RegulatoryFormTypeEnum.FORM_M
            : RegulatoryFormTypeEnum.FORM_NXP,
        );

      if (!regulatoryForm) {
        throw new BadRequestException(
          `${guarantees?.guaranteesProductType === GuaranteesProductTypeEnum.ISSUED ? 'Form M' : 'Form NXP'} with application number ${guarantees.applicationNumber} not found.`,
        );
      }
    }

    const applicantAccountDetails = await this.camsService.getAccountDetails(
      guarantees?.applicantAccount,
      '',
    );

    if (!applicantAccountDetails) {
      throw new NotFoundException(
        'Applicant Account not found in Central Account Management System',
      );
    }

    const { chargesAndTaxesDebitEntries } =
      await this.handleDebitAndCreditEntries({
        guaranteesActionType,
        tradeProductData,
        chargeType:
          TradeProductFactoryGuaranteesChargesAndTaxesTypeEnum[
            GuaranteesActionTypeToTradeProductFactoryChargesAndTaxesTypeEnum[
              guaranteesActionType
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

    const beneficiaryAccountDetails = await this.camsService.getAccountDetails(
      guarantees?.beneficiaryAccount,
      '',
    );

    if (!beneficiaryAccountDetails) {
      throw new NotFoundException(
        'Beneficiary Account not found in Central Account Management System',
      );
    }
  }

  async issueGuaranteeRequest(data: IssueGuaranteeDto) {
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
          GuaranteesProductTypeEnum.ISSUED === data?.guaranteesProductType
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
          'Regulatory Form with either Submitted or Query status can not be used to issue a guarantee',
        );
      }

      if (regulatoryForm?.isTaken) {
        throw new BadRequestException(
          'Regulatory Form has already been used for an existing application',
        );
      }

      const existingGuarantees = await this.guaranteesRequestRepository.findOne(
        {
          where: {
            applicationNumber: data?.applicationNumber,
            guaranteesActionType: data?.guaranteesActionType,
            approvalStatus: { [Op.not]: ApprovalStatusEnum.REJECTED },
          },
        },
      );

      if (existingGuarantees) {
        throw new BadRequestException(
          'A matching Guarantees request that is not rejected is tied to the same application number already exists',
        );
      }
    }

    let existingGuaranteesRequest: GuaranteesRequest;

    if (data?.requestId) {
      existingGuaranteesRequest =
        await this.guaranteesRequestRepository.findOne({
          where: {
            requestId: data?.requestId,
            approvalStatus: { [Op.not]: ApprovalStatusEnum.REJECTED },
          },
        });
    }

    if (existingGuaranteesRequest && !data?.isDraft) {
      throw new BadRequestException(
        'A matching Guarantees request that is not rejected exists and is not marked as draft.',
      );
    }

    if (!existingGuaranteesRequest && data?.isDraft) {
      throw new BadRequestException(
        'Request is marked as updating a draft and a matching request with the same reference ID and in Draft state can not be found.',
      );
    }

    let guaranteesRequestData: GuaranteesRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        [, [guaranteesRequestData]] =
          await this.guaranteesRequestRepository.update(
            {
              guaranteesActionType: data?.guaranteesActionType,
              guaranteesProductType: data?.guaranteesProductType,
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
        guaranteesRequestData = await this.guaranteesRequestRepository.create(
          {
            guaranteesActionType: data?.guaranteesActionType,
            guaranteesProductType: data?.guaranteesProductType,
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
          requestData: guaranteesRequestData,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryGuaranteesChargesAndTaxesTypeEnum.ISSUANCE,
          approverBranchCode: data?.initiatorBranchCode,
          transaction,
        });

        await this.guaranteesRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: guaranteesRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await guaranteesRequestData.reload();

    return guaranteesRequestData;
  }

  async amendGuarantee(data: AmendGuaranteeDto) {
    const { userPermissions, token, ...filterData } = data;

    const { guarantees, existingGuaranteesRequest, tradeProductData } =
      await this.validateActionRequestAndGetTradeProductData(
        {
          guaranteeReferenceNumber: data?.guaranteesReferenceNumber,
          requestId: data?.requestId,
          isDraft: data?.isDraft,
        },
        token,
      );

    let guaranteesRequestData: GuaranteesRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingGuaranteesRequest) {
          throw new BadRequestException(
            'Guarantees Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [guaranteesRequestData]] =
          await this.guaranteesRequestRepository.update(
            {
              guaranteesActionType: data?.guaranteesActionType,
              guaranteesProductType: guarantees?.guaranteesProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              guaranteesReferenceNumber: guarantees?.referenceNumber,
              metadata: filterData,
            },
            {
              where: { requestId: data?.requestId },
              transaction,
              returning: true,
            },
          );

        await this.guaranteesAmendmentRepository.update(
          {
            ...filterData,
            requestId: guaranteesRequestData?.requestId,
          },
          { where: { requestId: data?.requestId }, transaction },
        );
      } else {
        guaranteesRequestData = await this.guaranteesRequestRepository.create(
          {
            guaranteesActionType: data?.guaranteesActionType,
            guaranteesProductType: guarantees?.guaranteesProductType,
            initiator: data?.initiator,
            initiatorId: data?.initiatorId,
            initiatorBranchCode: data?.initiatorBranchCode,
            initiatorDepartment: data?.initiatorDepartment,
            tenantId: data?.tenantId,
            guaranteesReferenceNumber: guarantees?.referenceNumber,
            metadata: filterData,
          },
          { transaction },
        );

        await this.guaranteesAmendmentRepository.create(
          {
            ...filterData,
            requestId: guaranteesRequestData?.requestId,
          },
          { transaction },
        );
      }

      if (userPermissions.includes('')) {
        await this.handleApproval({
          requestData: guaranteesRequestData,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryGuaranteesChargesAndTaxesTypeEnum.AMENDMENT,
          approverBranchCode: data?.initiatorBranchCode,
          transaction,
        });

        await this.guaranteesRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: guaranteesRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await guaranteesRequestData.reload();

    return guaranteesRequestData;
  }

  async adjustGuarantee(data: AdjustGuaranteeDto) {
    const { userPermissions, token, ...filterData } = data;

    const { guarantees, existingGuaranteesRequest, tradeProductData } =
      await this.validateActionRequestAndGetTradeProductData(
        {
          guaranteeReferenceNumber: data?.guaranteesReferenceNumber,
          requestId: data?.requestId,
          isDraft: data?.isDraft,
        },
        token,
      );

    let guaranteesRequestData: GuaranteesRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingGuaranteesRequest) {
          throw new BadRequestException(
            'Guarantees Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [guaranteesRequestData]] =
          await this.guaranteesRequestRepository.update(
            {
              guaranteesActionType: data?.guaranteesActionType,
              guaranteesProductType: guarantees?.guaranteesProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              guaranteesReferenceNumber: guarantees?.referenceNumber,
              metadata: filterData,
            },
            {
              where: { requestId: data?.requestId },
              transaction,
              returning: true,
            },
          );

        await this.guaranteesAdjustmentRepository.update(
          {
            ...filterData,
            requestId: guaranteesRequestData?.requestId,
          },
          { where: { requestId: data?.requestId }, transaction },
        );
      } else {
        guaranteesRequestData = await this.guaranteesRequestRepository.create(
          {
            guaranteesActionType: data?.guaranteesActionType,
            guaranteesProductType: guarantees?.guaranteesProductType,
            initiator: data?.initiator,
            initiatorId: data?.initiatorId,
            initiatorBranchCode: data?.initiatorBranchCode,
            initiatorDepartment: data?.initiatorDepartment,
            tenantId: data?.tenantId,
            guaranteesReferenceNumber: guarantees?.referenceNumber,
            metadata: filterData,
          },
          { transaction },
        );

        await this.guaranteesAdjustmentRepository.create(
          {
            ...filterData,
            requestId: guaranteesRequestData?.requestId,
          },
          { transaction },
        );
      }

      if (userPermissions.includes('')) {
        await this.handleApproval({
          requestData: guaranteesRequestData,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryGuaranteesChargesAndTaxesTypeEnum.ADJUSTMENT,
          approverBranchCode: data?.initiatorBranchCode,
          transaction,
        });

        await this.guaranteesRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: guaranteesRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await guaranteesRequestData.reload();

    return guaranteesRequestData;
  }

  async receiveAcknowledgementGuarantee(
    data: ReceiveAcknowledgementGuaranteeDto,
  ) {
    const { userPermissions, token, ...filterData } = data;

    const { guarantees, existingGuaranteesRequest, tradeProductData } =
      await this.validateActionRequestAndGetTradeProductData(
        {
          guaranteeReferenceNumber: data?.guaranteesReferenceNumber,
          requestId: data?.requestId,
          isDraft: data?.isDraft,
        },
        token,
      );

    let guaranteesRequestData: GuaranteesRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingGuaranteesRequest) {
          throw new BadRequestException(
            'Guarantees Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [guaranteesRequestData]] =
          await this.guaranteesRequestRepository.update(
            {
              guaranteesActionType: data?.guaranteesActionType,
              guaranteesProductType: guarantees?.guaranteesProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              guaranteesReferenceNumber: guarantees?.referenceNumber,
              metadata: filterData,
            },
            {
              where: { requestId: data?.requestId },
              transaction,
              returning: true,
            },
          );

        await this.guaranteesReceiveAcknowledgementRepository.update(
          {
            ...filterData,
            requestId: guaranteesRequestData?.requestId,
          },
          { where: { requestId: data?.requestId }, transaction },
        );
      } else {
        guaranteesRequestData = await this.guaranteesRequestRepository.create(
          {
            guaranteesActionType: data?.guaranteesActionType,
            guaranteesProductType: guarantees?.guaranteesProductType,
            initiator: data?.initiator,
            initiatorId: data?.initiatorId,
            initiatorBranchCode: data?.initiatorBranchCode,
            initiatorDepartment: data?.initiatorDepartment,
            tenantId: data?.tenantId,
            guaranteesReferenceNumber: guarantees?.referenceNumber,
            metadata: filterData,
          },
          { transaction },
        );

        await this.guaranteesReceiveAcknowledgementRepository.create(
          {
            ...filterData,
            requestId: guaranteesRequestData?.requestId,
          },
          { transaction },
        );
      }

      if (userPermissions.includes('')) {
        await this.handleApproval({
          requestData: guaranteesRequestData,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryGuaranteesChargesAndTaxesTypeEnum.RECEIVE_ACKNOWLEDGEMENT,
          approverBranchCode: data?.initiatorBranchCode,
          transaction,
        });

        await this.guaranteesRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: guaranteesRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await guaranteesRequestData.reload();

    return guaranteesRequestData;
  }

  async receiveClaimGuarantee(data: ReceiveClaimGuaranteeDto) {
    const { userPermissions, token, ...filterData } = data;

    const { guarantees, existingGuaranteesRequest, tradeProductData } =
      await this.validateActionRequestAndGetTradeProductData(
        {
          guaranteeReferenceNumber: data?.guaranteesReferenceNumber,
          requestId: data?.requestId,
          isDraft: data?.isDraft,
        },
        token,
      );

    let guaranteesRequestData: GuaranteesRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingGuaranteesRequest) {
          throw new BadRequestException(
            'Guarantees Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [guaranteesRequestData]] =
          await this.guaranteesRequestRepository.update(
            {
              guaranteesActionType: data?.guaranteesActionType,
              guaranteesProductType: guarantees?.guaranteesProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              guaranteesReferenceNumber: guarantees?.referenceNumber,
              metadata: filterData,
            },
            {
              where: { requestId: data?.requestId },
              transaction,
              returning: true,
            },
          );

        await this.guaranteesReceiveClaimRepository.update(
          {
            ...filterData,
            requestId: guaranteesRequestData?.requestId,
          },
          { where: { requestId: data?.requestId }, transaction },
        );
      } else {
        guaranteesRequestData = await this.guaranteesRequestRepository.create(
          {
            guaranteesActionType: data?.guaranteesActionType,
            guaranteesProductType: guarantees?.guaranteesProductType,
            initiator: data?.initiator,
            initiatorId: data?.initiatorId,
            initiatorBranchCode: data?.initiatorBranchCode,
            initiatorDepartment: data?.initiatorDepartment,
            tenantId: data?.tenantId,
            guaranteesReferenceNumber: guarantees?.referenceNumber,
            metadata: filterData,
          },
          { transaction },
        );

        await this.guaranteesReceiveClaimRepository.create(
          {
            ...filterData,
            requestId: guaranteesRequestData?.requestId,
          },
          { transaction },
        );
      }

      if (userPermissions.includes('')) {
        await this.handleApproval({
          requestData: guaranteesRequestData,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryGuaranteesChargesAndTaxesTypeEnum.CLAIM_RECEIVED,
          approverBranchCode: data?.initiatorBranchCode,
          transaction,
        });

        await this.guaranteesRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: guaranteesRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await guaranteesRequestData.reload();

    return guaranteesRequestData;
  }

  async documentsPresented(data: DocumentsPresentedGuaranteeDto) {
    const { userPermissions, token, ...filterData } = data;

    const { guarantees, existingGuaranteesRequest, tradeProductData } =
      await this.validateActionRequestAndGetTradeProductData(
        {
          guaranteeReferenceNumber: data?.guaranteesReferenceNumber,
          requestId: data?.requestId,
          isDraft: data?.isDraft,
        },
        token,
      );

    let guaranteesRequestData: GuaranteesRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingGuaranteesRequest) {
          throw new BadRequestException(
            'Guarantees Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [guaranteesRequestData]] =
          await this.guaranteesRequestRepository.update(
            {
              guaranteesActionType: data?.guaranteesActionType,
              guaranteesProductType: guarantees?.guaranteesProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              guaranteesReferenceNumber: guarantees?.referenceNumber,
              metadata: filterData,
            },
            {
              where: { requestId: data?.requestId },
              transaction,
              returning: true,
            },
          );

        await this.guaranteesDocumentsPresentedRepository.update(
          {
            ...filterData,
            requestId: guaranteesRequestData?.requestId,
          },
          { where: { requestId: data?.requestId }, transaction },
        );
      } else {
        guaranteesRequestData = await this.guaranteesRequestRepository.create(
          {
            guaranteesActionType: data?.guaranteesActionType,
            guaranteesProductType: guarantees?.guaranteesProductType,
            initiator: data?.initiator,
            initiatorId: data?.initiatorId,
            initiatorBranchCode: data?.initiatorBranchCode,
            initiatorDepartment: data?.initiatorDepartment,
            tenantId: data?.tenantId,
            guaranteesReferenceNumber: guarantees?.referenceNumber,
            metadata: filterData,
          },
          { transaction },
        );

        await this.guaranteesDocumentsPresentedRepository.create(
          {
            ...filterData,
            requestId: guaranteesRequestData?.requestId,
          },
          { transaction },
        );
      }

      if (userPermissions.includes('')) {
        await this.handleApproval({
          requestData: guaranteesRequestData,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryGuaranteesChargesAndTaxesTypeEnum.DOCUMENTS_PRESENTED,
          approverBranchCode: data?.initiatorBranchCode,
          transaction,
        });

        await this.guaranteesRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: guaranteesRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await guaranteesRequestData.reload();

    return guaranteesRequestData;
  }

  async freeFormat(data: GuaranteesFreeFormatDto) {
    const { userPermissions, token, ...filterData } = data;

    const { guarantees, existingGuaranteesRequest, tradeProductData } =
      await this.validateActionRequestAndGetTradeProductData(
        {
          guaranteeReferenceNumber: data.guaranteesReferenceNumber,
          requestId: data?.requestId,
          isDraft: data?.isDraft,
        },
        token,
      );

    let guaranteesRequestData: GuaranteesRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingGuaranteesRequest) {
          throw new BadRequestException(
            'Guarantees Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }

        [, [guaranteesRequestData]] =
          await this.guaranteesRequestRepository.update(
            {
              guaranteesActionType: data?.guaranteesActionType,
              guaranteesProductType: guarantees?.guaranteesProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              guaranteesReferenceNumber: guarantees?.referenceNumber,
              metadata: filterData,
            },
            {
              where: { requestId: data?.requestId },
              transaction,
              returning: true,
            },
          );

        await this.guaranteesFreeFormatRepository.update(
          {
            ...filterData,
            requestId: guaranteesRequestData?.requestId,
          },
          { where: { requestId: data?.requestId }, transaction },
        );
      } else {
        guaranteesRequestData = await this.guaranteesRequestRepository.create(
          {
            guaranteesActionType: GuaranteesActionTypeEnum.FREE_FORMAT,
            initiator: data?.initiator,
            initiatorId: data?.initiatorId,
            initiatorBranchCode: data?.initiatorBranchCode,
            initiatorDepartment: data?.initiatorDepartment,
            tenantId: data?.tenantId,
            guaranteesReferenceNumber: data?.guaranteesReferenceNumber,
            metadata: filterData,
          },
          { transaction },
        );

        await this.guaranteesFreeFormatRepository.create(
          {
            ...filterData,
            requestId: guaranteesRequestData?.requestId,
          },
          { transaction },
        );
      }

      if (userPermissions.includes('')) {
        await this.handleApproval({
          requestData: guaranteesRequestData,
          approverBranchCode: data?.initiatorBranchCode,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryGuaranteesChargesAndTaxesTypeEnum.FREE_FORMAT,
          transaction,
        });

        await this.guaranteesRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: guaranteesRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await guaranteesRequestData.reload();

    return guaranteesRequestData;
  }

  async cancelGuarantee(data: CancelGuaranteeDto) {
    const { userPermissions, token, ...filterData } = data;

    const { guarantees, existingGuaranteesRequest, tradeProductData } =
      await this.validateActionRequestAndGetTradeProductData(
        {
          guaranteeReferenceNumber: data?.guaranteesReferenceNumber,
          requestId: data?.requestId,
          isDraft: data?.isDraft,
        },
        token,
      );

    let guaranteesRequestData: GuaranteesRequest;

    await this.sequelize.transaction(async (transaction: Transaction) => {
      if (data?.isDraft) {
        if (!existingGuaranteesRequest) {
          throw new BadRequestException(
            'Guarantees Request is marked as draft but no existing matching record with the same request ID exists.',
          );
        }
        [, [guaranteesRequestData]] =
          await this.guaranteesRequestRepository.update(
            {
              guaranteesActionType: data?.guaranteesActionType,
              guaranteesProductType: guarantees?.guaranteesProductType,
              initiator: data?.initiator,
              initiatorId: data?.initiatorId,
              initiatorBranchCode: data?.initiatorBranchCode,
              initiatorDepartment: data?.initiatorDepartment,
              requestStatus: RequestStatusEnum.IN_REVIEW,
              approvalStatus: ApprovalStatusEnum.PENDING,
              tenantId: data?.tenantId,
              guaranteesReferenceNumber: guarantees?.referenceNumber,
              metadata: filterData,
            },
            {
              where: { requestId: data?.requestId },
              transaction,
              returning: true,
            },
          );

        await this.guaranteesCancellationRepository.update(
          {
            ...filterData,
            requestId: data?.requestId,
          },
          { where: { requestId: data?.requestId }, transaction },
        );
      } else {
        guaranteesRequestData = await this.guaranteesRequestRepository.create(
          {
            guaranteesActionType: GuaranteesActionTypeEnum.CANCELLATION,
            initiator: data?.initiator,
            initiatorId: data?.initiatorId,
            initiatorBranchCode: data?.initiatorBranchCode,
            initiatorDepartment: data?.initiatorDepartment,
            tenantId: data?.tenantId,
            guaranteesReferenceNumber: data?.guaranteesReferenceNumber,
            metadata: filterData,
          },
          { transaction },
        );

        await this.guaranteesCancellationRepository.create(
          {
            ...filterData,
            requestId: guaranteesRequestData?.requestId,
          },
          { transaction },
        );
      }

      if (userPermissions.includes('')) {
        await this.handleApproval({
          requestData: guaranteesRequestData,
          approverBranchCode: data?.initiatorBranchCode,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryGuaranteesChargesAndTaxesTypeEnum.CANCELLATION,
          transaction,
        });

        await this.guaranteesRequestRepository.update(
          {
            approver: data?.initiator,
            approverId: data?.initiatorId,
            approverBranchCode: data?.initiatorBranchCode,
            approverDepartment: data?.initiatorDepartment,
            requestStatus: RequestStatusEnum.APPROVED,
            approvalStatus: ApprovalStatusEnum.APPROVED,
          },
          {
            where: { requestId: guaranteesRequestData?.requestId },
            transaction,
          },
        );
      }
    });

    await guaranteesRequestData.reload();

    return guaranteesRequestData;
  }

  private async validateActionRequestAndGetTradeProductData(
    data: {
      guaranteeReferenceNumber?: string;
      requestId?: string;
      isDraft?: boolean;
    },
    token?: string,
  ): Promise<{
    guarantees: any;
    tradeProductData: any;
    existingGuaranteesRequest: GuaranteesRequest | null;
  }> {
    const guarantees = await this.guaranteesRepository.findOne({
      where: { referenceNumber: data?.guaranteeReferenceNumber },
    });

    if (!guarantees) {
      throw new NotFoundException(
        `Guarantees with reference number ${data?.guaranteeReferenceNumber} not found.`,
      );
    }

    if (
      guarantees?.status === GuaranteesActionTypeEnum.CANCELLATION ||
      guarantees?.state === GuaranteesStateEnum.EXPIRED ||
      guarantees?.state === GuaranteesStateEnum.INACTIVE
    ) {
      throw new BadRequestException(
        `Guarantees with reference number ${data?.guaranteeReferenceNumber} has already been cancelled or is expired/inactive.`,
      );
    }

    let existingGuaranteesRequest: GuaranteesRequest | null = null;

    if (data?.requestId) {
      existingGuaranteesRequest =
        await this.guaranteesRequestRepository.findOne({
          where: {
            requestId: data?.requestId,
            approvalStatus: { [Op.not]: ApprovalStatusEnum.REJECTED },
          },
        });
    }

    if (existingGuaranteesRequest && !data?.isDraft) {
      throw new BadRequestException(
        'A matching Guarantees request already exists in a non-final state (neither rejected nor approved).',
      );
    }

    if (!existingGuaranteesRequest && data?.isDraft) {
      throw new BadRequestException(
        'Guarantees Request is marked as draft but no existing matching record with the same request ID exists.',
      );
    }

    const tradeProductData =
      await this.tradeProductFactoryService.getProductDetails(
        guarantees?.tradeProductId,
        token,
      );

    return {
      guarantees,
      tradeProductData,
      existingGuaranteesRequest,
    };
  }

  async authorize(data: AuthorizeGuaranteeDto) {
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

    const guaranteesRequestData =
      await this.guaranteesRequestRepository.findOne({
        where: {
          requestId: id,
          approvalStatus: ApprovalStatusEnum.PENDING,
        },
      });

    if (!guaranteesRequestData) {
      throw new NotFoundException(
        'No Matching request with that requestId found',
      );
    }

    const tradeProductId =
      guaranteesRequestData?.metadata?.['tradeProductId'] ??
      guaranteesRequestData?.bookedGuarantees?.tradeProductId;

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
        guaranteesRequestData?.guaranteesActionType ===
        GuaranteesActionTypeEnum.ISSUANCE
      ) {
        regulatoryForm =
          await this.regulatoryFormService.getRegulatoryFormRecord(
            guaranteesRequestData?.applicationNumber,
            guaranteesRequestData?.guaranteesProductType ===
              GuaranteesProductTypeEnum.ISSUED
              ? RegulatoryFormTypeEnum.FORM_M
              : RegulatoryFormTypeEnum.FORM_NXP,
          );

        switch (guaranteesRequestData?.guaranteesProductType) {
          case GuaranteesProductTypeEnum.ISSUED:
            regulatoryForm = await this.regulatoryFormService.getFormMRecord(
              'formMId' in regulatoryForm ? regulatoryForm.formMId : undefined,
              {
                identifier: GetFormMRecordIdentifierEnum.FORM_M_ID,
              },
            );
            break;
          case GuaranteesProductTypeEnum.RECEIVED:
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
            throw new BadRequestException('Invalid guarantees product type');
        }

        await regulatoryForm.reload();

        if (regulatoryForm?.status !== RegulatoryFormStatusEnum.REGISTERED) {
          throw new BadRequestException(
            `Guarantees can only be approved when it's corresponding Form M has a Registered status.`,
          );
        }
      }
    }

    if (
      guaranteesRequestData &&
      guaranteesRequestData?.guaranteesActionType !==
        GuaranteesActionTypeEnum.ISSUANCE &&
      !guaranteesRequestData?.guaranteesReferenceNumber
    ) {
      throw new BadRequestException(
        'Guarantees Reference Number is not tied to this request which is required for this action type',
      );
    }

    let valueToUpdate: Partial<GuaranteesRequest>;

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
          requestData: guaranteesRequestData,
          approverBranchCode: approverBranchCode,
          token,
          tradeProductData,
          chargeType:
            TradeProductFactoryGuaranteesChargesAndTaxesTypeEnum[
              GuaranteesActionTypeToTradeProductFactoryChargesAndTaxesTypeEnum[
                guaranteesRequestData?.guaranteesActionType
              ]
            ],
          transaction,
        });
      }

      await this.guaranteesRequestRepository.update(valueToUpdate, {
        where: { requestId: guaranteesRequestData?.requestId },
        transaction,
      });

      if (
        tradeProductData?.regulatoryFormRequired !==
        RegulatoryFormRequiredEnum.NONE
      ) {
        if (
          guaranteesRequestData?.guaranteesActionType ===
          GuaranteesActionTypeEnum.ISSUANCE
        ) {
          regulatoryForm =
            await this.regulatoryFormService.getRegulatoryFormRecord(
              regulatoryForm?.applicationNumber,
              guaranteesRequestData?.guaranteesProductType ===
                GuaranteesProductTypeEnum.ISSUED
                ? RegulatoryFormTypeEnum.FORM_M
                : RegulatoryFormTypeEnum.FORM_NXP,
            );

          regulatoryForm.isTaken = true;

          await regulatoryForm.save({ transaction });
        }
      }
    });

    await guaranteesRequestData.reload();

    return guaranteesRequestData;
  }

  async handleApproval({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    requestData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    approverBranchCode,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tradeProductData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transaction,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    chargeType,
  }: {
    requestData: GuaranteesRequest;
    approverBranchCode: string;
    tradeProductData: TradeProductData;
    transaction: Transaction;
    token: string;
    chargeType: TradeProductFactoryGuaranteesChargesAndTaxesTypeEnum;
  }) {
    const {
      chargesAndTaxesCreditEntries,
      chargesAndTaxesDebitEntries,
      postingEntryDebitEntries,
      postingEntryCreditEntries,
      guarantees,
    } = await this.handleDebitAndCreditEntries({
      guaranteesActionType: requestData.guaranteesActionType,
      requestData,
      tradeProductData,
      chargeType,
      token,
    });

    let postingEntryTransactionId: string;
    let chargesAndTaxesTransactionId: string;
    let transactionReversalId: string;

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
        reconciliationRemarks: `Guarantees ${requestData.guaranteesActionType} Charges and Taxes`,
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
          requestData?.metadata['guaranteesCurrencyCode'] ??
          guarantees?.guaranteesCurrencyCode,
        requestId: `${moment.utc().format('YYMMDD')}${this.nanoid()}`,
        debitEntries: postingEntryDebitEntries,
        creditEntries: postingEntryCreditEntries,
        initiatedBy: requestData.initiatorId,
        approvedByBranchCode: approverBranchCode,
        reconciliationRemarks: `Guarantees ${requestData.guaranteesActionType} Posting Entries`,
      });

      const journalPostingResponse = await this.camsService.postToJournal(
        journalPostingRequestBody,
        token,
      );

      postingEntryTransactionId = journalPostingResponse?.value?.transactionId;
    }

    const referenceNumber =
      requestData?.guaranteesReferenceNumber ??
      (await this.generateReferenceNumber(
        requestData.guaranteesProductType,
        tradeProductData.slogan,
      ));

    switch (requestData.guaranteesActionType) {
      case GuaranteesActionTypeEnum.ISSUANCE:
        if (
          requestData.guaranteesActionType === GuaranteesActionTypeEnum.ISSUANCE
        ) {
          await this.guaranteesRepository.create(
            {
              ...requestData?.metadata,
              requestId: requestData.requestId,
              referenceNumber,
            },
            { transaction },
          );
        }
        break;
      case GuaranteesActionTypeEnum.AMENDMENT:
      case GuaranteesActionTypeEnum.ADJUSTMENT:
        await this.guaranteesRepository.update(requestData?.metadata, {
          where: {
            referenceNumber: requestData?.guaranteesReferenceNumber,
          },
          transaction,
        });
        break;
      case GuaranteesActionTypeEnum.RECEIVE_ACKNOWLEDGEMENT:
        break;
      case GuaranteesActionTypeEnum.CLAIM_RECEIVED:
        break;
      case GuaranteesActionTypeEnum.DOCUMENTS_PRESENTED:
        break;
      case GuaranteesActionTypeEnum.CANCELLATION:
        break;
      case GuaranteesActionTypeEnum.FREE_FORMAT:
        break;
      default:
        throw new BadRequestException('Invalid guarantees action type');
    }

    const actionType = requestData.guaranteesActionType;

    if (chargesAndTaxesTransactionId) {
      await this.guaranteesRepository.appendChargesAndTaxesTransaction(
        referenceNumber,
        {
          guaranteesActionType: actionType,
          transactionId: chargesAndTaxesTransactionId,
        },
        { transaction },
      );
    }

    if (postingEntryTransactionId) {
      await this.guaranteesRepository.appendPostingEntryTransaction(
        referenceNumber,
        {
          guaranteesActionType: actionType,
          transactionId: postingEntryTransactionId,
          isReversed: false,
          transactionReversalId,
        },
        { transaction },
      );
    }
  }

  async handleDebitAndCreditEntries({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    guaranteesActionType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    requestData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tradeProductData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    chargeType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    previewData,
  }: {
    guaranteesActionType: GuaranteesActionTypeEnum;
    requestData?: GuaranteesRequest;
    tradeProductData: TradeProductData;
    chargeType: TradeProductFactoryGuaranteesChargesAndTaxesTypeEnum;
    token: string;
    previewData?: any;
  }) {
    return {
      chargesAndTaxesCreditEntries: [],
      chargesAndTaxesDebitEntries: [],
      postingEntryCreditEntries: [],
      postingEntryDebitEntries: [],
      guarantees: undefined,
    };
  }

  async handleChargesAndTaxes(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    guaranteesDebitAndCreditEntriesPayload: GuaranteesDebitAndCreditEntriesPayload,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    chargesAndTaxes: ChargeAndTax,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: string,
  ) {
    return { creditEntries: [], debitEntries: [] };
  }

  async handlePostingEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    guaranteesDebitAndCreditEntriesPayload: GuaranteesDebitAndCreditEntriesPayload,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    chargesAndTaxes: ChargeAndTax,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token: string,
  ) {
    return { creditEntries: [], debitEntries: [] };
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
          `${entryType} Entry Party is not supported for Guarantees`,
        );
    }

    if (
      !swiftBic &&
      entryParty !== EntryPartyEnum.DRAWEE &&
      entryParty !== EntryPartyEnum.DRAWER
    ) {
      throw new BadRequestException(
        `${entryType} Entry Party SWIFT BIC is not defined for ${entryParty} in the Guarantees Entry`,
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

  async getGuaranteesRecords(
    options: GetGuaranteesRecordsDto,
  ): Promise<GetGuaranteesRequestResponse> {
    const {
      id,
      branch,
      page = 1,
      size = 10,
      startDate,
      endDate,
      recordScope = AuthorizationStatusEnum.CREATED_BY_ME,
      guaranteesProductType,
      guaranteesState,
      guaranteeCode,
      applicantName,
    } = options;

    const query: { where: Partial<Guarantees> | any } = {
      where: {},
    };

    switch (recordScope) {
      case AuthorizationStatusEnum.CREATED_BY_ME:
      case AuthorizationStatusEnum.INITIATED_BY_ME:
        query.where['$guaranteesRequest.initiatorId$'] = id;
        break;
      case AuthorizationStatusEnum.APPROVED_BY_ME:
      case AuthorizationStatusEnum.SENT_TO_ME:
        query.where['$guaranteesRequest.approverId$'] = id;
        break;
      case AuthorizationStatusEnum.CREATED_BY_MY_BRANCH:
      case AuthorizationStatusEnum.INITIATED_BY_MY_BRANCH:
        query.where['$guaranteesRequest.initiatorBranchCode$'] = branch;
        break;
      case AuthorizationStatusEnum.APPROVED_BY_MY_BRANCH:
      case AuthorizationStatusEnum.SENT_TO_MY_BRANCH:
        query.where['$guaranteesRequest.approverBranchCode$'] = branch;
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

    if (guaranteesProductType) {
      query.where.guaranteesProductType = guaranteesProductType;
    }

    if (guaranteesState) {
      query.where.state = guaranteesState;
    }

    if (guaranteeCode) {
      query.where.referenceNumber = guaranteeCode;
    }

    if (applicantName) {
      query.where.applicantName = applicantName;
    }

    const { count: totalRecords, rows: guaranteesRecords } =
      await this.guaranteesRepository.findAndCountAll({
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
      guaranteesRecords,
    };
  }

  async getGuaranteesRequests(
    options: GetGuaranteesRecordsDto,
  ): Promise<GetGuaranteesRequestResponse> {
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
      guaranteesProductType,
      guaranteesStatus,
      guaranteesState,
      guaranteeCode,
      applicantName,
    } = options;

    const query: { where: Partial<GuaranteesRequest> | any } = {
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
      query.where.guaranteesActionType = {
        [Op.in]: [GuaranteesActionTypeEnum.ISSUANCE],
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

    if (guaranteesStatus) {
      query.where.guaranteesActionType = guaranteesStatus;
    }

    if (guaranteesProductType) {
      query.where.guaranteesProductType = guaranteesProductType;
    }

    const orFilters: any[] = [];

    if (guaranteeCode) {
      orFilters.push({
        '$guarantees.referenceNumber$': { [Op.iLike]: `%${guaranteeCode}%` },
      });
    }

    if (applicantName) {
      orFilters.push({
        '$guarantees.applicantName$': { [Op.iLike]: `%${applicantName}%` },
      });
    }

    if (guaranteesState) {
      orFilters.push({
        '$guarantees.state$': {
          [Op.iLike]: `%${guaranteesState as GuaranteesStateEnum}%`,
        },
      });
    }

    if (orFilters.length > 0) {
      query.where = {
        [Op.and]: [query.where, { [Op.or]: orFilters }],
      };
    }

    const { count: totalRecords, rows: guaranteesRecords } =
      await this.guaranteesRequestRepository.findAndCountAll({
        ...query,
        subQuery: false,
        include: [
          {
            model: Guarantees,
            as: 'guarantees',
            required: false,
          },
          {
            model: GuaranteesAmendment,
            as: 'amendment',
            required: false,
          },
          {
            model: GuaranteesAdjustment,
            as: 'adjustment',
            required: false,
          },
          {
            model: GuaranteesReceiveAcknowledgement,
            as: 'receiveAcknowledgement',
            required: false,
          },
          {
            model: GuaranteesReceiveClaim,
            as: 'receiveClaim',
            required: false,
          },
          {
            model: GuaranteesDocumentsPresented,
            as: 'documentsPresented',
            required: false,
          },
          {
            model: GuaranteesCancellation,
            as: 'cancellation',
            required: false,
          },
          {
            model: GuaranteesFreeFormat,
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
      guaranteesRecords,
    };
  }

  async withdraw(id: string, initiatorId: string) {
    const guaranteesRequestData =
      await this.guaranteesRequestRepository.findOne({
        where: {
          requestId: id,
          initiatorId,
          approvalStatus: {
            [Op.in]: [ApprovalStatusEnum.PENDING, ApprovalStatusEnum.REJECTED],
          },
        },
      });

    if (!guaranteesRequestData) {
      throw new NotFoundException(
        'No Matching request with that Request Id initiated by this user found',
      );
    }

    await this.guaranteesRequestRepository.update(
      {
        approvalStatus: null,
        requestStatus: RequestStatusEnum.DRAFT,
      },
      { where: { requestId: guaranteesRequestData?.requestId } },
    );

    return this.guaranteesRequestRepository.findOne({
      where: { requestId: guaranteesRequestData?.requestId },
    });
  }

  async delete(id: string, initiatorId: string) {
    const guaranteesRequestData =
      await this.guaranteesRequestRepository.findOne({
        where: {
          requestId: id,
          initiatorId,
          approvalStatus: ApprovalStatusEnum.PENDING,
        },
      });

    if (!guaranteesRequestData) {
      throw new NotFoundException(
        'No Matching request with that Request Id initiated by this user found',
      );
    }

    const deletedGuaranteesRequestCount =
      await this.guaranteesRequestRepository.delete({
        where: { requestId: guaranteesRequestData?.requestId },
      });

    return deletedGuaranteesRequestCount;
  }

  async getRecordsStatusCount(
    id: string,
    branch: string,
    statusType: RecordsStatusTypeEnum,
    recordScope: AuthorizationStatusEnum,
    requestStatus: RequestStatusEnum,
  ) {
    const query: { where: Partial<GuaranteesRequest> } = {
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

    const guaranteesRecordsStatusCount = await this.guaranteesRequestRepository
      .scope(null)
      .findAll({
        where: query.where,
        attributes: [
          [GuaranteesStatusTypeToColumnMappingEnum[statusType], 'status'],
          [this.sequelize.fn('COUNT', this.sequelize.literal('*')), 'count'],
        ],
        group: [GuaranteesStatusTypeToColumnMappingEnum[statusType]],
        raw: true,
      });

    return guaranteesRecordsStatusCount.map((record: any) => ({
      status: record.status,
      count: parseInt(record.count, 10),
    }));
  }

  async getGuaranteeRecordByReferenceNumber(
    referenceNumber: string,
  ): Promise<Guarantees> {
    const guaranteesRecord = await this.guaranteesRepository.findOne({
      where: { referenceNumber },
      include: [
        {
          model: GuaranteesAmendment,
          as: 'amendments',
          required: false,
        },
        {
          model: GuaranteesAdjustment,
          as: 'adjustments',
          required: false,
        },
        {
          model: GuaranteesReceiveAcknowledgement,
          as: 'receiveAcknowledgements',
          required: false,
        },
        {
          model: GuaranteesReceiveClaim,
          as: 'receiveClaims',
          required: false,
        },
        {
          model: GuaranteesDocumentsPresented,
          as: 'documentsPresented',
          required: false,
        },
        {
          model: GuaranteesCancellation,
          as: 'cancellations',
          required: false,
        },
        {
          model: GuaranteesFreeFormat,
          as: 'freeFormats',
          required: false,
        },
      ],
      order: [
        [{ model: GuaranteesAmendment, as: 'amendments' }, 'createdAt', 'DESC'],
        [
          { model: GuaranteesAdjustment, as: 'adjustments' },
          'createdAt',
          'DESC',
        ],
        [
          {
            model: GuaranteesReceiveAcknowledgement,
            as: 'receiveAcknowledgements',
          },
          'createdAt',
          'DESC',
        ],
        [
          { model: GuaranteesReceiveClaim, as: 'receiveClaims' },
          'createdAt',
          'DESC',
        ],
        [
          { model: GuaranteesDocumentsPresented, as: 'documentsPresented' },
          'createdAt',
          'DESC',
        ],
        [
          { model: GuaranteesCancellation, as: 'cancellations' },
          'createdAt',
          'DESC',
        ],
        [
          { model: GuaranteesFreeFormat, as: 'freeFormats' },
          'createdAt',
          'DESC',
        ],
      ],
    });

    if (!guaranteesRecord) {
      throw new NotFoundException(
        `No Guarantees Record found with reference number ${referenceNumber}`,
      );
    }

    return guaranteesRecord;
  }

  async validateRegulatoryFormForGuaranteeRequestInitiation(
    applicationNumber: string,
    guaranteesProductType: GuaranteesProductTypeEnum,
  ): Promise<{
    isValid: boolean;
    regulatoryForm: FormM | FormNXP | FormNCX | FormA;
  }> {
    const regulatoryForm =
      await this.regulatoryFormService.getRegulatoryFormRecord(
        applicationNumber,
        guaranteesProductType === GuaranteesProductTypeEnum.ISSUED
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

    const guaranteesRequest = await this.guaranteesRequestRepository.findOne({
      where: {
        applicationNumber,
        guaranteesActionType: {
          [Op.in]: [GuaranteesActionTypeEnum.ISSUANCE],
        },
        approvalStatus: {
          [Op.not]: ApprovalStatusEnum.REJECTED,
        },
      },
    });

    return {
      isValid: guaranteesRequest === null,
      regulatoryForm,
    };
  }

  async getGuaranteeByRequestId(
    requestId: string,
    isRecord: boolean = false,
  ): Promise<GuaranteesRequest | Guarantees> {
    let guarantees: any;

    if (isRecord) {
      guarantees = await this.guaranteesRepository.findOne({
        where: {
          requestId: requestId,
        },
      });
    } else {
      guarantees = await this.guaranteesRequestRepository.findOne({
        where: {
          requestId: requestId,
        },
      });
    }

    if (!guarantees) {
      throw new NotFoundException(
        `No Guarantees ${isRecord ? 'Record' : 'Request'} found with request ID ${requestId}`,
      );
    }

    return guarantees;
  }

  async getGuaranteeByRegulatoryFormNumber(
    regulatoryFormNumber: string,
  ): Promise<Guarantees> {
    const guarantees = await this.guaranteesRepository.findOne({
      where: { applicationNumber: regulatoryFormNumber },
    });

    if (!guarantees) {
      throw new NotFoundException(
        `No Guarantees Record found with Regulatory Form Number ${regulatoryFormNumber}`,
      );
    }

    return guarantees;
  }
}
