import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { LetterOfCreditRequest } from './letter-of-credit-request.model';
import { uuidv7 } from 'uuidv7';
import { LetterOfCredit } from './letter-of-credit.model';
import {
  ConfirmationInstructionEnum,
  CreditAvailableByEnum,
  DocumentDisposalEnum,
  PaymentActionTypeEnum,
  PaymentTransferMethodEnum,
  RequestedConfirmationPartyEnum,
} from 'src/common/enums';
import { LetterOfCreditDocumentUploadDto } from '../dto/letter-of-credit-document-upload.dto';
import { PaymentActionMultiplePaymentDto } from '../dto/payment-action-multiple-payment.dto';

@Table({ modelName: 'letter_of_credit_payment' })
export class LetterOfCreditPayment extends Model<LetterOfCreditPayment> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  lcPaymentId: string;

  @ForeignKey(() => LetterOfCreditRequest)
  @AllowNull(false)
  @Column({ type: DataType.UUID })
  @Index
  requestId: string;

  @BelongsTo(() => LetterOfCreditRequest, { onDelete: 'CASCADE' })
  letterOfCreditRequest: LetterOfCreditRequest;

  @ForeignKey(() => LetterOfCredit)
  @AllowNull(false)
  @Column({ type: DataType.STRING, allowNull: false })
  @Index
  lcReferenceNumber: string;

  @Column({ type: DataType.STRING })
  relatedReference: string;

  @Column({ type: DataType.STRING })
  applicantName: string;

  @Column({ type: DataType.DATE })
  expiryDate: Date;

  @Column({ type: DataType.FLOAT })
  lcAmount: number;

  @Column({
    type: DataType.ENUM(...Object.values(CreditAvailableByEnum)),
  })
  creditAvailableBy: CreditAvailableByEnum;

  @Column({
    type: DataType.ENUM(...Object.values(ConfirmationInstructionEnum)),
  })
  confirmationInstruction: ConfirmationInstructionEnum;

  @Column({ type: DataType.FLOAT })
  confirmationAmount: number;

  @Column({
    type: DataType.ENUM(...Object.values(RequestedConfirmationPartyEnum)),
  })
  requestedConfirmationParty: RequestedConfirmationPartyEnum;

  @Column({ type: DataType.STRING })
  receivedFromBankName: string;

  @Column({ type: DataType.STRING })
  receivedFromBankBicCode: string;

  @Column({ type: DataType.STRING })
  receivedFromBankAddress: string;

  @Column({ type: DataType.STRING })
  presentersAction: string;

  @Column({ type: DataType.STRING })
  presentationAmountCurrency: string;

  @Column({ type: DataType.FLOAT })
  presentationAmount: number;

  @Column({ type: DataType.STRING })
  additionalAmountCurrency: string;

  @Column({ type: DataType.FLOAT })
  additionalAmount: number;

  @Column({ type: DataType.STRING })
  totalClaimedAmountCurrency: string;

  @Column({ type: DataType.FLOAT })
  totalClaimedAmount: number;

  @Column({ type: DataType.STRING })
  chargesAddedCurrency: string;

  @Column({ type: DataType.FLOAT })
  chargesAddedAmount: number;

  @Column({ type: DataType.STRING })
  chargesDeductedCurrency: string;

  @Column({ type: DataType.FLOAT })
  chargesDeductedAmount: number;

  @Column({ type: DataType.DATE })
  paymentDueDate: Date;

  @Column({ type: DataType.DATE })
  chargeDueDate: Date;

  @Column({ type: DataType.STRING })
  discrepancies: string;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentTransferMethodEnum)),
  })
  paymentTransferMethod: PaymentTransferMethodEnum;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentActionTypeEnum)),
  })
  paymentActionType: PaymentActionTypeEnum;

  @Column({ type: DataType.STRING })
  loanOrFinancingId: string;

  @Column({ type: DataType.STRING })
  payAmountCurrency: string;

  @Column({ type: DataType.FLOAT })
  payAmount: number;

  @Column({ type: DataType.JSONB })
  paymentDetails: PaymentActionMultiplePaymentDto[];

  @Column({ type: DataType.DATE })
  returnDate: Date;

  @Column({ type: DataType.STRING })
  paymentActionDiscrepancies: string;

  @Column({
    type: DataType.ENUM(...Object.values(DocumentDisposalEnum)),
  })
  documentDisposal: DocumentDisposalEnum;

  @Column({ type: DataType.STRING })
  sendersCorrespondentBicCode: string;

  @Column({ type: DataType.STRING })
  sendersCorrespondentBankName: string;

  @Column({ type: DataType.STRING })
  sendersCorrespondentAddress: string;

  @Column({ type: DataType.STRING })
  sendersCorrespondentAccount: string;

  @Column({ type: DataType.STRING })
  sendersCorrespondentAccountCurrency: string;

  @Column({ type: DataType.STRING })
  receiversCorrespondentBicCode: string;

  @Column({ type: DataType.STRING })
  receiversCorrespondentBankName: string;

  @Column({ type: DataType.STRING })
  receiversCorrespondentAddress: string;

  @Column({ type: DataType.STRING })
  receiversCorrespondentAccount: string;

  @Column({ type: DataType.STRING })
  receiversCorrespondentAccountCurrency: string;

  @Column({ type: DataType.STRING })
  accountWithBankBicCode: string;

  @Column({ type: DataType.STRING })
  accountWithBankName: string;

  @Column({ type: DataType.STRING })
  accountWithBankAddress: string;

  @Column({ type: DataType.STRING })
  accountWithBankAccount: string;

  @Column({ type: DataType.STRING })
  accountWithBankAccountCurrency: string;

  @Column({ type: DataType.STRING })
  senderToReceiverInformation: string;

  @Column({ type: DataType.STRING })
  narrative: string;

  @Column({ type: DataType.JSONB })
  documentAttachments: LetterOfCreditDocumentUploadDto[];
}
