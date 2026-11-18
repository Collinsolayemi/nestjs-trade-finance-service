/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Logger,
  LoggerService,
} from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TRADE_API_LETTER_OF_CREDIT_SWIFT_MESSAGE_QUEUE_NAME } from 'src/common/constants';
import {
  ApprovalStatusEnum,
  CreditAvailableWithEnum,
  DraftModeEnum,
  DraweeEnum,
  LetterOfCreditActionTypeEnum,
  LetterOfCreditFreeFormaSwifttMessageTypeEnum,
  SwiftBICEnum,
  SwiftMessageJobActionEnum,
  SwiftMessageTypeEnum,
} from 'src/common/enums';
import { HelperService } from 'src/helpers/helper.service';
import * as os from 'os';
import { LetterOfCredit } from '../models/letter-of-credit.model';
import {
  LetterOfCreditAmendmentRepository,
  LetterOfCreditRepository,
  LetterOfCreditRequestRepository,
} from '../letter-of-credit.repository';
import { LetterOfCreditAmendment } from '../models/letter-of-credit-amendment.model';
import { Mt707MessageData } from 'src/common/interfaces';
import * as moment from 'moment-timezone';
import generateRandomNumberWithDigits from 'src/common/utils/generate-random-number-with-digits.util';
import generateMt700Message from 'src/common/utils/generate-mt-700-message.util';
import generateMt707Message from 'src/common/utils/generate-mt-707-message.utiil';
import compareLetterOfCreditAmendmentChanges from 'src/common/utils/compare-letter-of-credit-amendment-changes.util';
import generateMtn99Message from 'src/common/utils/generate-mt-n99-message.util';
import { LetterOfCreditFreeFormatMessage } from '../models/letter-of-credit-free-format-message.model';
import { randomUUID } from 'node:crypto';
import generateMt202Message from 'src/common/utils/generate-mt-202-message.util';
import { LetterOfCreditPayment } from '../models/letter-of-credit-payment.model';
import generateMt752Message from 'src/common/utils/generate-mt-752-message.util';
import generateMt730Message from 'src/common/utils/generate-mt-730-message';
import { AxiosError } from 'axios';
import { logProcessorJobFailure } from 'src/common/utils/processor-error-log-summary.util';

@Processor(TRADE_API_LETTER_OF_CREDIT_SWIFT_MESSAGE_QUEUE_NAME, {
  concurrency: 3,
})
export class LetterOfCrediSwiftMessageConsumer extends WorkerHost {
  constructor(
    @Inject(Logger) private readonly loggerService: LoggerService,
    private readonly helperService: HelperService,
    private readonly letterOfCreditRequestRepository: LetterOfCreditRequestRepository,
    private readonly letterOfCreditRepository: LetterOfCreditRepository,
  ) {
    super();
  }

  async process(job: Job) {
    try {
      this.loggerService.debug(
        `Processing job ${job.id} of type ${job.name} of ${TRADE_API_LETTER_OF_CREDIT_SWIFT_MESSAGE_QUEUE_NAME}`,
        LetterOfCrediSwiftMessageConsumer.name,
      );
      switch (job.name) {
        case SwiftMessageJobActionEnum.GENERATE_MT_700_AND_UPLOAD:
          await this.generateMt700AndUpload(job.data);
          break;
        case SwiftMessageJobActionEnum.GENERATE_MT_707_AND_UPLOAD:
          await this.generateMt707AndUpload(job.data);
          break;
        case SwiftMessageJobActionEnum.GENERATE_MT_730_AND_UPLOAD:
          await this.generateMt730AndUpload(job.data);
          break;
        case SwiftMessageJobActionEnum.GENERATE_MT_752_AND_UPLOAD:
          await this.generateMt752AndUpload(job.data);
          break;
        case SwiftMessageJobActionEnum.GENERATE_MT_799_AND_UPLOAD:
          await this.generateMtn99Message(job.data);
          break;
        case SwiftMessageJobActionEnum.GENERATE_MT_999_AND_UPLOAD:
          await this.generateMtn99Message(job.data);
          break;
        case SwiftMessageJobActionEnum.GENERATE_MT_202_AND_UPLOAD:
          await this.generateMt202AndUpload(job.data);
          break;
        default:
          this.loggerService.warn(
            `No handler for job type ${job.name} of ${TRADE_API_LETTER_OF_CREDIT_SWIFT_MESSAGE_QUEUE_NAME}`,
          );
      }
    } catch (error) {
      logProcessorJobFailure(
        this.loggerService,
        job,
        LetterOfCrediSwiftMessageConsumer.name,
        error,
      );
      throw error;
    }
  }

  private async generateMt700AndUpload(data: {
    data: LetterOfCredit;
    requestId: string;
  }) {
    const { data: letterOfCredit, requestId } = data;

    const request = await this.letterOfCreditRequestRepository.findOne({
      where: { requestId, approvalStatus: ApprovalStatusEnum.APPROVED },
    });

    if (!request) {
      throw new BadRequestException(
        `Request not approved for requestId ${requestId}`,
      );
    }

    const mt700Message = generateMt700Message({
      formOfDocumentaryCredit: letterOfCredit?.formOfDocumentaryCredit,
      documentaryCreditNumber: letterOfCredit?.referenceNumber,
      preAdviceReferenceNumber: letterOfCredit?.preAdviceReferenceNumber,
      issueDate: letterOfCredit?.issueDate,
      applicableRules: letterOfCredit?.applicableRules,
      expiryDate: letterOfCredit?.expiryDate,
      expiryPlace: letterOfCredit?.expiryPlace,
      applicantBankBicCode: letterOfCredit?.applicantBankBicCode,
      applicantName: letterOfCredit?.applicantName,
      applicantAddress: letterOfCredit?.applicantAddress,
      beneficiaryName: letterOfCredit?.beneficiaryName,
      beneficiaryAddress: letterOfCredit?.beneficiaryAddress,
      currencyCode: letterOfCredit?.lcCurrencyCode,
      amount: letterOfCredit?.lcAmount,
      minCreditAmountTolerance: letterOfCredit?.minCreditAmountTolerance,
      maxCreditAmountTolerance: letterOfCredit?.maxCreditAmountTolerance,
      additionalAmountsCovered: letterOfCredit?.additionalAmount,
      creditAvailableBankBicCode:
        letterOfCredit?.creditAvailableWith ===
        CreditAvailableWithEnum.NAMED_BANK
          ? letterOfCredit?.creditAvailableWithBankSwiftCode
          : SwiftBICEnum.STERLING,
      creditAvailableCode: letterOfCredit?.creditAvailableBy,
      draftsAt:
        letterOfCredit?.draftMode === DraftModeEnum.TENOR
          ? `${letterOfCredit?.tenorPeriod} ${letterOfCredit?.tenorPeriodType}`
          : moment(letterOfCredit?.maturityDate).format('D MMMM, YYYY'),
      drawee:
        letterOfCredit?.drawee &&
        letterOfCredit?.drawee === DraweeEnum.NAMED_BANK
          ? letterOfCredit?.draweeBankAddress
          : SwiftBICEnum.STERLING,
      paymentDate: letterOfCredit?.paymentDate,
      paymentMethod: letterOfCredit?.paymentMethod,
      mixedPaymentDetails: letterOfCredit?.mixedPaymentDetails,
      partialShipment: letterOfCredit?.partialShipment,
      transShipment: letterOfCredit?.transShipment,
      placeOfTakingInChargeOrDispatchFromOrPlaceOfReceipt:
        letterOfCredit?.placeOfChargeTaken,
      portOfLoading: letterOfCredit?.portOfLoading,
      portOfDischarge: letterOfCredit?.portOfDischarge,
      latestDateOfShipment: letterOfCredit?.latestShipmentDate,
      shipmentPeriod: letterOfCredit?.shipmentPeriod,
      descriptionOfGoods: letterOfCredit?.descriptionOfGoods,
      documentsRequired: letterOfCredit?.documentsRequired,
      additionalConditions: letterOfCredit?.additionalConditions,
      specialPaymentConditionsForBeneficiary:
        letterOfCredit?.specialPaymentConditionsForBeneficiary,
      specialPaymentConditionsForBankOnly:
        letterOfCredit?.specialPaymentConditionsForBank,
      charges: letterOfCredit?.charges,
      presentationDays: letterOfCredit?.presentationDays,
      confirmationInstructions: letterOfCredit?.confirmationInstruction,
      requestedConfirmationParty: letterOfCredit?.requestedConfirmationParty,
      reimbursingBank: letterOfCredit?.reimbursingBankBicCode,
      instructionsToThePayingAcceptingNegotiatingBank:
        letterOfCredit?.instructionsToThePayingOrAcceptingOrNegotiatingBank,
      adviseThroughBank: letterOfCredit?.adviseThroughBankBicCode,
      senderToReceiverInformation: letterOfCredit?.senderToReceiverInformation,
      receiverBIC: letterOfCredit?.advisingBankBicCode,
      sessionNumber: generateRandomNumberWithDigits(4),
      sequenceNumber: generateRandomNumberWithDigits(6),
    });

    const uploadData = await this.helperService.uploadSwiftMessage(
      mt700Message,
      SwiftMessageTypeEnum.MT_700,
      letterOfCredit?.referenceNumber,
    );

    const newMessage = {
      actionType: LetterOfCreditActionTypeEnum.ISSUANCE,
      messageType: SwiftMessageTypeEnum.MT_700,
      uploadUrl: uploadData?.documentManagementUploadUrl,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
    };

    await this.letterOfCreditRepository.appendSwiftMessage(
      letterOfCredit?.id,
      newMessage,
    );
  }

  private async generateMt707AndUpload(data: {
    data: LetterOfCreditAmendment;
    requestId: string;
    letterOfCredit: LetterOfCredit;
  }) {
    const { data: letterOfCreditAmendment, requestId, letterOfCredit } = data;

    const request = await this.letterOfCreditRequestRepository.findOne({
      where: { requestId, approvalStatus: ApprovalStatusEnum.APPROVED },
    });

    if (!request) {
      throw new BadRequestException(
        `Request not approved for requestId ${requestId}`,
      );
    }

    const mt707MessageData: Mt707MessageData =
      compareLetterOfCreditAmendmentChanges(
        letterOfCreditAmendment,
        letterOfCredit,
      );

    const numberOfAmendment = await this.letterOfCreditRequestRepository.count({
      where: {
        lcReferenceNumber: letterOfCreditAmendment?.lcReferenceNumber,
        letterOfCreditActionType: LetterOfCreditActionTypeEnum.AMENDMENT,
        approvalStatus: ApprovalStatusEnum.APPROVED,
      },
    });

    mt707MessageData.numberOfAmendment = String(numberOfAmendment + 1);

    const mt707Message = generateMt707Message(mt707MessageData);

    const uploadData = await this.helperService.uploadSwiftMessage(
      mt707Message,
      SwiftMessageTypeEnum.MT_707,
      letterOfCreditAmendment?.lcReferenceNumber,
    );

    const newMessage = {
      actionType: LetterOfCreditActionTypeEnum.AMENDMENT,
      messageType: SwiftMessageTypeEnum.MT_707,
      uploadUrl: uploadData?.documentManagementUploadUrl,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
    };

    await this.letterOfCreditRepository.appendSwiftMessage(
      letterOfCredit?.id,
      newMessage,
    );
  }

  private async generateMt730AndUpload(data: {
    data: LetterOfCredit;
    requestId: string;
  }) {
    const { data: letterOfCredit, requestId } = data;

    const request = await this.letterOfCreditRequestRepository.findOne({
      where: { requestId, approvalStatus: ApprovalStatusEnum.APPROVED },
    });

    if (!request) {
      throw new BadRequestException(
        `Request not approved for requestId ${requestId}`,
      );
    }

    const mt730Message = generateMt730Message({
      sessionNumber: generateRandomNumberWithDigits(4),
      sequenceNumber: generateRandomNumberWithDigits(6),
      senderBIC: SwiftBICEnum.STERLING,
      receiverBIC: letterOfCredit?.advisingBankBicCode,
      uniqueID: randomUUID(),
      sendersReference: letterOfCredit?.referenceNumber,
      receiversReference: letterOfCredit?.relatedReference,
      dateOfMessageBeingAcknowledged: moment().format('YYMMDD'),
      senderToReceiverInformation: letterOfCredit?.senderToReceiverInformation,
    });

    const uploadData = await this.helperService.uploadSwiftMessage(
      mt730Message,
      SwiftMessageTypeEnum.MT_730,
      letterOfCredit?.referenceNumber,
    );

    const newMessage = {
      actionType: LetterOfCreditActionTypeEnum.ADVISEMENT,
      messageType: SwiftMessageTypeEnum.MT_730,
      uploadUrl: uploadData?.documentManagementUploadUrl,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
    };

    await this.letterOfCreditRepository.appendSwiftMessage(
      letterOfCredit?.id,
      newMessage,
    );
  }

  private async generateMt752AndUpload(data: {
    data: LetterOfCreditPayment;
    requestId: string;
    letterOfCredit: LetterOfCredit;
  }) {
    const { data: letterOfCreditPayment, requestId, letterOfCredit } = data;

    const request = await this.letterOfCreditRequestRepository.findOne({
      where: { requestId, approvalStatus: ApprovalStatusEnum.APPROVED },
    });

    if (!request) {
      throw new BadRequestException(
        `Request not approved for requestId ${requestId}`,
      );
    }

    const mt752Message = generateMt752Message({
      sessionNumber: generateRandomNumberWithDigits(4),
      sequenceNumber: generateRandomNumberWithDigits(6),
      senderBIC: SwiftBICEnum.STERLING,
      receiverBIC: letterOfCreditPayment?.receiversCorrespondentBicCode,
      uniqueID: randomUUID(),
      documentaryCreditNumber: letterOfCreditPayment?.lcReferenceNumber,
      presentingBankReference: letterOfCreditPayment?.relatedReference,
      furtherIdentification: letterOfCreditPayment?.lcReferenceNumber,
      dateOfAdviceOfDiscrepancyOrMailing: moment(
        letterOfCreditPayment?.returnDate,
      ).format('YYMMDD'),
      totalAmountAdvisedCurrency: letterOfCreditPayment?.payAmountCurrency,
      totalAmountAdvised: letterOfCreditPayment?.payAmount,
      chargesDeductedCurrency: letterOfCreditPayment?.chargesDeductedCurrency,
      chargesDeductedAmount: letterOfCreditPayment?.chargesDeductedAmount,
      netAmountCurrency: letterOfCreditPayment?.payAmountCurrency,
      netAmount: letterOfCreditPayment?.payAmount,
      paymentDueDate: letterOfCreditPayment?.paymentDueDate,
      sendersCorrespondentAccount:
        letterOfCreditPayment?.sendersCorrespondentAccount,
      sendersCorrespondentBIC:
        letterOfCreditPayment?.sendersCorrespondentBicCode,
      receiversCorrespondentAccount:
        letterOfCreditPayment?.receiversCorrespondentAccount,
      receiversCorrespondentBIC:
        letterOfCreditPayment?.receiversCorrespondentBicCode,
      senderToReceiverInformation:
        letterOfCreditPayment?.senderToReceiverInformation,
      narrative: letterOfCreditPayment?.narrative,
    });

    const uploadData = await this.helperService.uploadSwiftMessage(
      mt752Message,
      SwiftMessageTypeEnum.MT_752,
      letterOfCreditPayment?.lcReferenceNumber,
    );

    const newMessage = {
      actionType: LetterOfCreditActionTypeEnum.FREE_FORMAT,
      messageType: SwiftMessageTypeEnum.MT_752,
      uploadUrl: uploadData?.documentManagementUploadUrl,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
    };

    await this.letterOfCreditRepository.appendSwiftMessage(
      letterOfCredit?.id,
      newMessage,
    );
  }

  private async generateMtn99Message(data: {
    data: LetterOfCreditFreeFormatMessage;
    requestId: string;
    letterOfCredit: LetterOfCredit;
  }) {
    const {
      data: letterOfCreditFreeFormatMessage,
      requestId,
      letterOfCredit,
    } = data;
    const request = await this.letterOfCreditRequestRepository.findOne({
      where: { requestId, approvalStatus: ApprovalStatusEnum.APPROVED },
    });

    if (!request) {
      throw new BadRequestException(
        `Request not approved for requestId ${requestId}`,
      );
    }

    const mtn99Message = generateMtn99Message({
      sessionNumber: generateRandomNumberWithDigits(4),
      sequenceNumber: generateRandomNumberWithDigits(6),
      senderBIC: SwiftBICEnum.STERLING,
      receiverBIC: letterOfCreditFreeFormatMessage?.receiversBankBicCode,
      uniqueID: randomUUID(),
      transactionReference: letterOfCreditFreeFormatMessage?.lcReferenceNumber,
      relatedReference:
        letterOfCreditFreeFormatMessage?.lcRelatedReferenceNumber,
      swiftMessageType: letterOfCreditFreeFormatMessage?.swiftMessageType,
      narrative: letterOfCreditFreeFormatMessage?.narrative,
    });

    const uploadData = await this.helperService.uploadSwiftMessage(
      mtn99Message,
      letterOfCreditFreeFormatMessage?.swiftMessageType ===
        LetterOfCreditFreeFormaSwifttMessageTypeEnum.MT_799
        ? SwiftMessageTypeEnum.MT_799
        : SwiftMessageTypeEnum.MT_999,
      letterOfCreditFreeFormatMessage?.lcReferenceNumber,
    );

    const newMessage = {
      actionType: LetterOfCreditActionTypeEnum.FUNDS_TRANSFER,
      messageType: SwiftMessageTypeEnum.MT_202,
      uploadUrl: uploadData?.documentManagementUploadUrl,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
    };

    await this.letterOfCreditRepository.appendSwiftMessage(
      letterOfCredit?.id,
      newMessage,
    );
  }

  private async generateMt202AndUpload(data: {
    data: any;
    requestId: string;
    letterOfCredit: LetterOfCredit;
  }) {
    const { data: paymentData, requestId, letterOfCredit } = data;

    const request = await this.letterOfCreditRequestRepository.findOne({
      where: { requestId, approvalStatus: ApprovalStatusEnum.APPROVED },
    });

    if (!request) {
      throw new BadRequestException(
        `Request not approved for requestId ${requestId}`,
      );
    }
    const mt202Message = generateMt202Message({
      sessionNumber: generateRandomNumberWithDigits(4),
      sequenceNumber: generateRandomNumberWithDigits(6),
      senderBIC: SwiftBICEnum.STERLING,
      receiverBIC: paymentData?.beneficiaryInstituitionBicCode,
      uniqueID: randomUUID(),
      transactionReference:
        paymentData?.referenceNumber ?? letterOfCredit?.referenceNumber,
      valueDate: moment(paymentData?.issueDate).format('YYMMDD'),
      currencyCode:
        paymentData?.marginCurrency ?? paymentData?.payAmountCurrency,
      amount: paymentData?.marginAmount ?? paymentData?.payAmount,
      orderingInstituionAccount: paymentData?.orderingInstituionAccount,
      orderingInstituionBicCode: paymentData?.orderingInstituionBicCode,
      sendersCorrespondentAccount: paymentData?.sendersCorrespondentAccount,
      sendersCorrespondentBicCode: paymentData?.sendersCorrespondentBicCode,
      receiversCorrespondentAccount: paymentData?.receiversCorrespondentAccount,
      receiversCorrespondentBicCode: paymentData?.receiversCorrespondentBicCode,
      intermediaryAccount: paymentData?.intermediaryAccount,
      intermediaryBicCode: paymentData?.intermediaryBicCode,
      accountWithInstituitionAccount:
        paymentData?.accountWithInstituitionAccount,
      accountWithInstituitionBicCode:
        paymentData?.accountWithInstituitionBicCode,
      beneficiaryAccount: paymentData?.beneficiaryInstituitionAccount,
      beneficiaryBankSwiftCode: paymentData?.beneficiaryInstituitionBicCode,
      senderToReceiverInformation: paymentData?.senderToReceiverInformation,
    });

    const uploadData = await this.helperService.uploadSwiftMessage(
      mt202Message,
      SwiftMessageTypeEnum.MT_202,
      letterOfCredit?.referenceNumber,
    );

    const newMessage = {
      actionType: LetterOfCreditActionTypeEnum.FUNDS_TRANSFER,
      messageType: SwiftMessageTypeEnum.MT_202,
      uploadUrl: uploadData?.documentManagementUploadUrl,
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
    };

    await this.letterOfCreditRepository.appendSwiftMessage(
      letterOfCredit?.id,
      newMessage,
    );
  }
}
