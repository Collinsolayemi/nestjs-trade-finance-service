import { Injectable, NotFoundException } from '@nestjs/common';
import { ApprovalStatusEnum, RequestStatusEnum } from 'src/common/enums';
import { AuthorizePaymentDto } from './dto/authorize-payment.dto';
import { InwardBankPaymentDto } from './dto/inward-bank-payment.dto';
import { InwardCustomerPaymentDto } from './dto/inward-customer-payment.dto';
import { PaymentDebitAndCreditEntriesDto } from './dto/payment-debit-and-credit-entries.dto';
import { SavePaymentTemplateDto } from './dto/save-payment-template.dto';
import { PaymentRequest } from './models/payment-request.model';
import { PaymentTemplate } from './models/payment-template.model';
import {
  InwardBankPaymentRepository,
  InwardCustomerPaymentRepository,
  PaymentRequestRepository,
  PaymentTemplateRepository,
} from './payment.repository';
import {
  PaymentActionTypeEnum,
  PaymentProductTypeEnum,
} from './enums/payment.enum';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRequestRepository: PaymentRequestRepository,
    private readonly inwardBankPaymentRepository: InwardBankPaymentRepository,
    private readonly inwardCustomerPaymentRepository: InwardCustomerPaymentRepository,
    private readonly paymentTemplateRepository: PaymentTemplateRepository,
  ) {}

  async createInwardBankPayment(
    data: InwardBankPaymentDto,
  ): Promise<PaymentRequest> {
    return this.createPaymentRequest(
      data,
      PaymentActionTypeEnum.INWARD_BANK_PAYMENT,
    );
  }

  async saveInwardBankPaymentAsDraft(
    data: InwardBankPaymentDto,
  ): Promise<PaymentRequest> {
    return this.createPaymentRequest(
      { ...data, isDraft: true },
      PaymentActionTypeEnum.INWARD_BANK_PAYMENT,
    );
  }

  async createInwardCustomerPayment(
    data: InwardCustomerPaymentDto,
  ): Promise<PaymentRequest> {
    return this.createPaymentRequest(
      data,
      PaymentActionTypeEnum.INWARD_CUSTOMER_PAYMENT,
    );
  }

  async saveInwardCustomerPaymentAsDraft(
    data: InwardCustomerPaymentDto,
  ): Promise<PaymentRequest> {
    return this.createPaymentRequest(
      { ...data, isDraft: true },
      PaymentActionTypeEnum.INWARD_CUSTOMER_PAYMENT,
    );
  }

  async getRequest(id: string, token?: string): Promise<PaymentRequest> {
    void token;

    const paymentRequestData = await this.paymentRequestRepository.findOne({
      where: { requestId: id },
    });

    if (!paymentRequestData) {
      throw new NotFoundException(
        'No Matching payment request with that requestId found',
      );
    }

    return paymentRequestData;
  }

  async getPaymentView(id: string, token?: string): Promise<object> {
    const paymentRequestData = await this.getRequest(id, token);
    const paymentDetails = this.getPaymentDetails(paymentRequestData);
    const metadata = this.getMetadata(paymentRequestData, paymentDetails);

    return {
      header: {
        paymentReference:
          paymentRequestData?.paymentReferenceNumber ??
          paymentDetails?.paymentReferenceNumber,
        beneficiary: paymentDetails?.beneficiaryName,
        receiveAmount: this.getReceiveAmount(paymentDetails),
        paymentStatus: paymentRequestData?.requestStatus,
      },
      tabs: {
        basicDetails: this.getBasicDetails(paymentRequestData, paymentDetails),
        partiesDetails: this.getPartiesDetails(paymentDetails),
        paymentAmountDetails: this.getPaymentAmountDetails(paymentDetails),
        otherBanks: this.getOtherBanks(paymentDetails),
        paySettlementDetails: this.getPaySettlementDetails(paymentDetails),
        instructions: this.getInstructions(paymentDetails),
      },
      transactionSummary: this.buildTransactionSummary(
        paymentRequestData,
        paymentDetails,
        metadata,
      ),
      transactionHistory: metadata?.transactionHistory ?? [],
      postingsAndChargesHistory: {
        postings: metadata?.postingsHistory ?? [],
        charges: paymentDetails?.charges ?? metadata?.chargesHistory ?? [],
      },
      swiftMessageHistory: metadata?.swiftMessageHistory ?? [],
      uploadedDocuments: paymentDetails?.documents ?? metadata?.documents ?? [],
      tracersRemindersAndNotes:
        metadata?.tracersRemindersAndNotes ?? metadata?.notes ?? [],
    };
  }

  async getTransactionSummary(id: string, token?: string): Promise<object> {
    const paymentRequestData = await this.getRequest(id, token);
    const paymentDetails = this.getPaymentDetails(paymentRequestData);
    const metadata = this.getMetadata(paymentRequestData, paymentDetails);

    return this.buildTransactionSummary(
      paymentRequestData,
      paymentDetails,
      metadata,
    );
  }

  async getTransactionHistory(id: string, token?: string): Promise<object[]> {
    const paymentRequestData = await this.getRequest(id, token);
    const paymentDetails = this.getPaymentDetails(paymentRequestData);
    const metadata = this.getMetadata(paymentRequestData, paymentDetails);

    return metadata?.transactionHistory ?? [];
  }

  async getPostingsAndChargesHistory(
    id: string,
    token?: string,
  ): Promise<object> {
    const paymentRequestData = await this.getRequest(id, token);
    const paymentDetails = this.getPaymentDetails(paymentRequestData);
    const metadata = this.getMetadata(paymentRequestData, paymentDetails);

    return {
      postings: metadata?.postingsHistory ?? [],
      charges: paymentDetails?.charges ?? metadata?.chargesHistory ?? [],
    };
  }

  async getSwiftMessageHistory(id: string, token?: string): Promise<object[]> {
    const paymentRequestData = await this.getRequest(id, token);
    const paymentDetails = this.getPaymentDetails(paymentRequestData);
    const metadata = this.getMetadata(paymentRequestData, paymentDetails);

    return metadata?.swiftMessageHistory ?? [];
  }

  async getUploadedDocuments(id: string, token?: string): Promise<object[]> {
    const paymentRequestData = await this.getRequest(id, token);
    const paymentDetails = this.getPaymentDetails(paymentRequestData);
    const metadata = this.getMetadata(paymentRequestData, paymentDetails);

    return paymentDetails?.documents ?? metadata?.documents ?? [];
  }

  async getTracersRemindersAndNotes(
    id: string,
    token?: string,
  ): Promise<object[]> {
    const paymentRequestData = await this.getRequest(id, token);
    const paymentDetails = this.getPaymentDetails(paymentRequestData);
    const metadata = this.getMetadata(paymentRequestData, paymentDetails);

    return metadata?.tracersRemindersAndNotes ?? metadata?.notes ?? [];
  }

  async getDebitAndCreditEntries(
    data: PaymentDebitAndCreditEntriesDto,
    token?: string,
  ): Promise<object> {
    void token;

    return {
      chargesAndTaxesCreditEntries: [],
      chargesAndTaxesDebitEntries: [],
      postingEntryCreditEntries: [],
      postingEntryDebitEntries: [],
      payment: data?.payment ?? {},
      charges: data?.charges ?? {},
    };
  }

  async saveTemplate(
    data: SavePaymentTemplateDto & {
      createdBy?: string;
      createdById?: string;
      tenantId?: string;
      token?: string;
    },
  ): Promise<PaymentTemplate> {
    const { token, ...templateData } = data;
    void token;

    return this.paymentTemplateRepository.create(templateData as any);
  }

  async getTemplates(token?: string): Promise<PaymentTemplate[]> {
    void token;

    return this.paymentTemplateRepository.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  async authorize(data: AuthorizePaymentDto): Promise<PaymentRequest> {
    const {
      id,
      approver,
      approverId,
      approverBranchCode,
      approverDepartment,
      approvalStatus,
      reasonForRejection,
    } = data;

    const paymentRequestData = await this.paymentRequestRepository.findOne({
      where: {
        requestId: id,
        approvalStatus: ApprovalStatusEnum.PENDING,
      },
    });

    if (!paymentRequestData) {
      throw new NotFoundException(
        'No Matching payment request with that requestId found',
      );
    }

    await this.paymentRequestRepository.update(
      {
        approver,
        approverId,
        approverBranchCode,
        approverDepartment,
        approvalStatus,
        requestStatus:
          approvalStatus === ApprovalStatusEnum.APPROVED
            ? RequestStatusEnum.APPROVED
            : RequestStatusEnum.IN_REVIEW,
        reasonForRejection,
      },
      {
        where: { requestId: id },
      },
    );

    await paymentRequestData.reload();

    return paymentRequestData;
  }

  private async createPaymentRequest(
    data: (InwardBankPaymentDto | InwardCustomerPaymentDto) & {
      isDraft?: boolean;
    },
    paymentActionType: PaymentActionTypeEnum,
  ): Promise<PaymentRequest> {
    const isDraft = data?.isDraft === true;
    const { token, ...paymentBody } = data as any;
    void token;

    const paymentRequestData = await this.paymentRequestRepository.create({
      paymentActionType,
      paymentProductType: PaymentProductTypeEnum.INWARD,
      applicationNumber: data?.applicationNumber,
      paymentReferenceNumber: data?.paymentReferenceNumber,
      initiator: data?.initiator,
      initiatorId: data?.initiatorId,
      initiatorBranchCode: data?.initiatorBranchCode,
      initiatorDepartment: data?.initiatorDepartment,
      tenantId: data?.tenantId,
      isDraft,
      requestStatus: isDraft
        ? RequestStatusEnum.DRAFT
        : RequestStatusEnum.IN_REVIEW,
      approvalStatus: isDraft
        ? ApprovalStatusEnum.DRAFT
        : ApprovalStatusEnum.PENDING,
      metadata: data?.metadata,
    } as any);

    const paymentDetails = {
      ...paymentBody,
      requestId: paymentRequestData?.requestId,
    };

    if (paymentActionType === PaymentActionTypeEnum.INWARD_BANK_PAYMENT) {
      await this.inwardBankPaymentRepository.create(paymentDetails);
    } else {
      await this.inwardCustomerPaymentRepository.create(paymentDetails);
    }

    await paymentRequestData.reload();

    return paymentRequestData;
  }

  private getPaymentDetails(paymentRequestData: PaymentRequest): any {
    return (
      paymentRequestData?.inwardCustomerPayment ??
      paymentRequestData?.inwardBankPayment ??
      {}
    );
  }

  private getMetadata(paymentRequestData: PaymentRequest, paymentDetails: any) {
    return {
      ...((paymentRequestData?.metadata as object) ?? {}),
      ...((paymentDetails?.metadata as object) ?? {}),
    } as any;
  }

  private getReceiveAmount(paymentDetails: any): string {
    const currency =
      paymentDetails?.receivedAmountCurrency ??
      paymentDetails?.paymentCurrency ??
      paymentDetails?.debitCurrency;
    const amount =
      paymentDetails?.receivedAmount ??
      paymentDetails?.paymentAmount ??
      paymentDetails?.debitAmount;

    if (!currency && amount === undefined) {
      return undefined;
    }

    return [currency, amount].filter(Boolean).join(' ');
  }

  private buildTransactionSummary(
    paymentRequestData: PaymentRequest,
    paymentDetails: any,
    metadata: any,
  ) {
    return {
      paymentReference:
        paymentRequestData?.paymentReferenceNumber ??
        paymentDetails?.paymentReferenceNumber,
      beneficiary: paymentDetails?.beneficiaryName,
      totalAvailableBalance: metadata?.totalAvailableBalance,
      amount:
        paymentDetails?.receivedAmount ??
        paymentDetails?.paymentAmount ??
        paymentDetails?.debitAmount,
      amountInBaseCurrency: metadata?.amountInBaseCurrency,
      amountInLocalCurrency: metadata?.amountInLocalCurrency,
      liabilityAmount: metadata?.liabilityAmount,
      outstandingBalance: metadata?.outstandingBalance,
      formMAmount: metadata?.formMAmount,
    };
  }

  private getBasicDetails(
    paymentRequestData: PaymentRequest,
    paymentDetails: any,
  ) {
    return {
      paymentReference:
        paymentRequestData?.paymentReferenceNumber ??
        paymentDetails?.paymentReferenceNumber,
      productType:
        paymentRequestData?.paymentActionType ?? paymentDetails?.paymentProduct,
      regulatoryFormNumber: paymentRequestData?.applicationNumber,
      status: paymentRequestData?.requestStatus,
      receivedFrom:
        paymentDetails?.remittingBankName ??
        paymentDetails?.orderingCustomerName,
      settlesBy:
        paymentDetails?.transferMethod ?? paymentDetails?.paymentMethod,
      accountNostroToDebit:
        paymentDetails?.debitAccountNumber ??
        paymentDetails?.debitGlAccountNumber,
      branch: paymentRequestData?.initiatorBranchCode,
      transferMethod:
        paymentDetails?.transferMethod ?? paymentDetails?.paymentMethod,
    };
  }

  private getPartiesDetails(paymentDetails: any) {
    return {
      beneficiary: paymentDetails?.beneficiaryName,
      beneficiaryAddress: paymentDetails?.beneficiaryAddress,
      beneficiaryAccount: paymentDetails?.beneficiaryAccountNumber,
      orderingCustomer: paymentDetails?.orderingCustomerName,
      orderingCustomerId: paymentDetails?.orderingCustomerId,
      orderingCustomerAccount:
        paymentDetails?.orderingCustomerAccountNumber ??
        paymentDetails?.payFromAccountNumber,
    };
  }

  private getPaymentAmountDetails(paymentDetails: any) {
    return {
      paymentAction: paymentDetails?.paymentAction,
      receiveAmount: paymentDetails?.receivedAmount,
      charges: paymentDetails?.chargesAmount,
      netReceive: paymentDetails?.netReceivedAmount,
      receivedDate: paymentDetails?.receivedDate,
      instructedAmount: paymentDetails?.instructedAmount,
      paymentCurrency:
        paymentDetails?.paymentCurrency ??
        paymentDetails?.receivedAmountCurrency,
      paymentAmount:
        paymentDetails?.paymentAmount ?? paymentDetails?.receivedAmount,
      valueDate: paymentDetails?.valueDate,
    };
  }

  private getOtherBanks(paymentDetails: any) {
    return {
      beneficiaryBank: {
        name: paymentDetails?.beneficiaryBankName,
        bicCode: paymentDetails?.beneficiaryBankBicCode,
        address: paymentDetails?.beneficiaryBankAddress,
      },
      intermediaryBank: {
        name: paymentDetails?.intermediaryBankName,
        bicCode: paymentDetails?.intermediaryBankBicCode,
        address: paymentDetails?.intermediaryBankAddress,
      },
      receiversCorrespondentBank: {
        name: paymentDetails?.receiversCorrespondentBankName,
        bicCode: paymentDetails?.receiversCorrespondentBankBicCode,
      },
      remittingBank: {
        name: paymentDetails?.remittingBankName,
        bicCode: paymentDetails?.remittingBankBicCode,
        address: paymentDetails?.remittingBankAddress,
      },
    };
  }

  private getPaySettlementDetails(paymentDetails: any) {
    return {
      payFundsVia: paymentDetails?.paymentMethod,
      settlesBy: paymentDetails?.transferMethod,
      accountNostroToCredit: paymentDetails?.payFromAccountNumber,
      settleCurrency:
        paymentDetails?.senderCurrency ??
        paymentDetails?.payFromAccountCurrency ??
        paymentDetails?.paymentCurrency,
      swiftCharges: paymentDetails?.swiftCharges,
      clearingId: paymentDetails?.clearingId,
      mainPaymentTransferMethod:
        paymentDetails?.transferMethod ?? paymentDetails?.paymentMethod,
      messageType: paymentDetails?.messageType,
      serviceLevel: paymentDetails?.serviceLevel,
      chargingBy: paymentDetails?.chargingBy,
      sendersChargeType: paymentDetails?.sendersChargeType,
    };
  }

  private getInstructions(paymentDetails: any) {
    return {
      notesForReceiver: paymentDetails?.receiverNarrative,
      paymentDetails: paymentDetails?.paymentDetails,
      notesFromSender:
        paymentDetails?.noteFromSender ?? paymentDetails?.narration,
    };
  }
}
