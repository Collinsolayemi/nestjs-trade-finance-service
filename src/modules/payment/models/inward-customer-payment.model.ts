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
import { uuidv7 } from 'uuidv7';
import { PaymentRequest } from './payment-request.model';

@Table({ modelName: 'inward_customer_payment' })
export class InwardCustomerPayment extends Model<InwardCustomerPayment> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  inwardCustomerPaymentId: string;

  @ForeignKey(() => PaymentRequest)
  @AllowNull(false)
  @Column({ type: DataType.UUID })
  @Index
  requestId: string;

  @BelongsTo(() => PaymentRequest, { onDelete: 'CASCADE' })
  paymentRequest: PaymentRequest;

  @Column({ type: DataType.STRING })
  paymentReferenceNumber: string;

  @Column({ type: DataType.STRING })
  paymentProduct: string;

  @Column({ type: DataType.STRING })
  template: string;

  @Column({ type: DataType.STRING })
  beneficiaryName: string;

  @Column({ type: DataType.STRING })
  beneficiaryAddress: string;

  @Column({ type: DataType.STRING })
  beneficiaryAccountNumber: string;

  @Column({ type: DataType.STRING })
  orderingCustomerName: string;

  @Column({ type: DataType.STRING })
  orderingCustomerId: string;

  @Column({ type: DataType.STRING })
  orderingCustomerAccountNumber: string;

  @Column({ type: DataType.STRING })
  payFromAccountNumber: string;

  @Column({ type: DataType.STRING })
  payFromAccountName: string;

  @Column({ type: DataType.STRING })
  payFromAccountCurrency: string;

  @Column({ type: DataType.STRING })
  debitGlAccountNumber: string;

  @Column({ type: DataType.STRING })
  debitGlAccountName: string;

  @Column({ type: DataType.STRING })
  debitCurrency: string;

  @Column({ type: DataType.FLOAT })
  debitAmount: number;

  @Column({ type: DataType.STRING })
  receivedAmountCurrency: string;

  @Column({ type: DataType.FLOAT })
  receivedAmount: number;

  @Column({ type: DataType.STRING })
  chargesCurrency: string;

  @Column({ type: DataType.FLOAT })
  chargesAmount: number;

  @Column({ type: DataType.STRING })
  netReceivedCurrency: string;

  @Column({ type: DataType.FLOAT })
  netReceivedAmount: number;

  @Column({ type: DataType.DATE })
  receivedDate: Date;

  @Column({ type: DataType.STRING })
  instructedAmountCurrency: string;

  @Column({ type: DataType.FLOAT })
  instructedAmount: number;

  @Column({ type: DataType.STRING })
  paymentMethod: string;

  @Column({ type: DataType.STRING })
  sendersChargeType: string;

  @Column({ type: DataType.STRING })
  senderCurrency: string;

  @Column({ type: DataType.STRING })
  swiftCharges: string;

  @Column({ type: DataType.STRING })
  chargingBy: string;

  @Column({ type: DataType.STRING })
  messageType: string;

  @Column({ type: DataType.STRING })
  beneficiaryBankName: string;

  @Column({ type: DataType.STRING })
  beneficiaryBankBicCode: string;

  @Column({ type: DataType.STRING })
  beneficiaryBankAddress: string;

  @Column({ type: DataType.STRING })
  intermediaryBankName: string;

  @Column({ type: DataType.STRING })
  intermediaryBankBicCode: string;

  @Column({ type: DataType.STRING })
  intermediaryBankAddress: string;

  @Column({ type: DataType.STRING })
  receiversCorrespondentBankName: string;

  @Column({ type: DataType.STRING })
  receiversCorrespondentBankBicCode: string;

  @Column({ type: DataType.STRING })
  transferMethod: string;

  @Column({ type: DataType.TEXT })
  receiverNarrative: string;

  @Column({ type: DataType.TEXT })
  paymentDetails: string;

  @Column({ type: DataType.TEXT })
  noteFromSender: string;

  @Column({ type: DataType.JSONB })
  documents: object[];

  @Column({ type: DataType.JSONB })
  charges: object[];

  @Column({ type: DataType.JSONB })
  metadata: object;
}
