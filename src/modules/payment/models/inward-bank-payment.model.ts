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

@Table({ modelName: 'inward_bank_payment' })
export class InwardBankPayment extends Model<InwardBankPayment> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  inwardBankPaymentId: string;

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
  debitAccountNumber: string;

  @Column({ type: DataType.STRING })
  debitAccountName: string;

  @Column({ type: DataType.STRING })
  debitAccountCurrency: string;

  @Column({ type: DataType.STRING })
  remittingBankName: string;

  @Column({ type: DataType.STRING })
  remittingBankBicCode: string;

  @Column({ type: DataType.STRING })
  remittingBankAddress: string;

  @Column({ type: DataType.STRING })
  beneficiaryName: string;

  @Column({ type: DataType.STRING })
  beneficiaryAccountNumber: string;

  @Column({ type: DataType.STRING })
  beneficiaryAddress: string;

  @Column({ type: DataType.STRING })
  paymentCurrency: string;

  @Column({ type: DataType.FLOAT })
  paymentAmount: number;

  @Column({ type: DataType.DATE })
  valueDate: Date;

  @Column({ type: DataType.STRING })
  purposeOfPayment: string;

  @Column({ type: DataType.TEXT })
  narration: string;

  @Column({ type: DataType.JSONB })
  documents: object[];

  @Column({ type: DataType.JSONB })
  charges: object[];

  @Column({ type: DataType.JSONB })
  metadata: object;
}
