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
import { BillsForCollectionRequest } from './bills-for-collection-request.model';
import { BillsForCollection } from './bills-for-collection.model';
import {
  BillsForCollectionAdviseByEnum,
  BillsForCollectionPaymentActionEnum,
  BillsForCollectionPaymentPartyEnum,
} from 'src/common/enums';
import { BillsForCollectionDraftPaymentDetails } from '../types/bills-for-collection-draft-payment-details.types';
import { BillsForCollectionDocumentUploadDto } from '../dto/bills-for-collection-document-upload.dto';

@Table({ modelName: 'bills_for_collection_payment' })
export class BillsForCollectionPayment extends Model<BillsForCollectionPayment> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  billsForCollectionPaymentId: string;

  @ForeignKey(() => BillsForCollectionRequest)
  @AllowNull(false)
  @Column({ type: DataType.UUID })
  @Index
  requestId: string;

  @BelongsTo(() => BillsForCollectionRequest, { onDelete: 'CASCADE' })
  billsForCollectionRequest: BillsForCollectionRequest;

  @ForeignKey(() => BillsForCollection)
  @AllowNull(false)
  @Column({ type: DataType.STRING })
  @Index
  billsReferenceNumber: string;

  @BelongsTo(() => BillsForCollection, {
    foreignKey: 'billsReferenceNumber',
    targetKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  billsForCollection: BillsForCollection;

  @Column({ type: DataType.DATE })
  dateReceived: Date;

  @Column({
    type: DataType.ENUM(...Object.values(BillsForCollectionPaymentPartyEnum)),
  })
  receivedPaymentFrom: BillsForCollectionPaymentPartyEnum;

  @Column({ type: DataType.STRING })
  receivedFromReference: string;

  @Column({ type: DataType.STRING })
  paymentInstructionsReceived: string;

  @Column({ type: DataType.FLOAT })
  sendersChargeDeductedAmount: number;

  @Column({ type: DataType.STRING })
  sendersChargeDeductedCurrency: string;

  @Column({ type: DataType.FLOAT })
  otherChargesDeductedAmount: number;

  @Column({ type: DataType.STRING })
  otherChargesDeductedCurrency: string;

  @Column({ type: DataType.FLOAT })
  chargesAddedAmount: number;

  @Column({ type: DataType.STRING })
  chargesAddedCurrency: string;

  @Column({ type: DataType.FLOAT })
  amountCollected: number;

  @Column({ type: DataType.STRING })
  amountCollectedCurrency: string;

  @Column({ type: DataType.FLOAT })
  lateInterestAddedAmount: number;

  @Column({ type: DataType.STRING })
  lateInterestAddedCurrency: string;

  @Column({ type: DataType.FLOAT })
  discountDeductedAmount: number;

  @Column({ type: DataType.STRING })
  discountDeductedCurrency: string;

  @Column({ type: DataType.FLOAT })
  proceedsRemittedAmount: number;

  @Column({ type: DataType.STRING })
  proceedsRemittedCurrency: string;

  @Column({ type: DataType.DATE })
  dateRemitted: Date;

  @Column({ type: DataType.BOOLEAN })
  lateInterestRefused: boolean;

  @Column({ type: DataType.BOOLEAN })
  ourChargesRefused: boolean;

  @Column({ type: DataType.BOOLEAN })
  otherBankChargesRefused: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(BillsForCollectionPaymentActionEnum)),
  })
  paymentAction: BillsForCollectionPaymentActionEnum;

  @Column({
    type: DataType.ENUM(...Object.values(BillsForCollectionPaymentPartyEnum)),
  })
  sendPaymentTo: BillsForCollectionPaymentPartyEnum;

  @Column({
    type: DataType.ENUM(...Object.values(BillsForCollectionAdviseByEnum)),
  })
  advisedBy: BillsForCollectionAdviseByEnum;

  @Column({ type: DataType.STRING })
  beneficiaryBankBicCode: string;

  @Column({ type: DataType.STRING })
  beneficiaryBankName: string;

  @Column({ type: DataType.STRING })
  beneficiaryBankAddress: string;

  @Column({ type: DataType.STRING })
  beneficiaryBankAccount: string;

  @Column({ type: DataType.STRING })
  notesForReceivedFromParty: string;

  @Column({ type: DataType.STRING })
  notesForSendPaymentToParty: string;

  @Column({ type: DataType.BOOLEAN })
  paymentWithRecourse: boolean;

  @Column({ type: DataType.BOOLEAN })
  optionContractHeld: boolean;

  expireCollection: boolean;

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  draftPaymentDetails: BillsForCollectionDraftPaymentDetails[] | null;

  @Column({
    type: DataType.ENUM(...Object.values(BillsForCollectionPaymentPartyEnum)),
  })
  thirdParty: BillsForCollectionPaymentPartyEnum;

  @Column({ type: DataType.FLOAT })
  thirdPartyAmount: number;

  @Column({ type: DataType.STRING })
  thirdPartyAmountCurrency: string;

  @Column({ type: DataType.FLOAT })
  thirdPartyPercentage: number;

  @Column({ type: DataType.FLOAT })
  amountPaidToDate: number;

  @Column({ type: DataType.STRING })
  amountPaidToDateCurrency: string;

  @Column({ type: DataType.FLOAT })
  totalAmountDue: number;

  @Column({ type: DataType.STRING })
  totalAmountDueCurrency: string;

  @Column({ type: DataType.FLOAT })
  amountToPay: number;

  @Column({ type: DataType.STRING })
  amountToPayCurrency: string;

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  documents: BillsForCollectionDocumentUploadDto[] | null;
}
