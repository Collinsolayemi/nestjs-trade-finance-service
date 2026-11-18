import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Index,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import {
  AcknowledgementTransmissionEnum,
  BillingLevelEnum,
  BillsForCollectionActionTypeEnum,
  BillsForCollectionProductTypeEnum,
  BillsForCollectionStateEnum,
  ChargesBorneByEnum,
  DeliveryMeansEnum,
  DocumentReleaseConditionEnum,
} from 'src/common/enums';
import { BillsForCollectionDraftDetails } from '../types/bills-for-collection-draft-details.types';
import { BillsForCollectionDocumentDetails } from '../types/bills-for-collection-document-details.types';
import { uuidv7 } from 'uuidv7';
import { BillsForCollectionRequest } from './bills-for-collection-request.model';
import { BillsForCollectionAmendment } from './bills-for-collection-amendment.model';
import { BillsForCollectionAdjustment } from './bills-for-collection-adjustment.model';
import { BillsForCollectionNonAcceptanceOrNonPayment } from './bills-for-collection-non-acceptance-or-non-payment.model';
import { BillsForCollectionPayment } from './bills-for-collection-payment.model';
import { BillsForCollectionReceiveAcknowledgement } from './bills-for-collection-receive-akcnowledgement.model';
import { BillsForCollectionAcceptance } from './bills-for-collection-acceptance.model';
import { BillsForCollectionFreeFormatMessage } from './bills-for-collection-free-format-message.model';
import { PostingEntryTransactionDto } from '../../letter-of-credit/dto/posting-entry-transaction-ids.dto';
import { SwiftMessageDto } from '../../letter-of-credit/dto/swift-message.dto';

@Table({ modelName: 'bills_for_collection' })
export class BillsForCollection extends Model<BillsForCollection> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  billsForCollectionId: string;

  @ForeignKey(() => BillsForCollectionRequest)
  @AllowNull(false)
  @Column({ type: DataType.UUID })
  @Index
  requestId: string;

  @AllowNull(false)
  @Column({ type: DataType.UUID })
  tradeProductId: string;

  @Column({
    type: DataType.ENUM(...Object.values(BillsForCollectionProductTypeEnum)),
  })
  billsForCollectionProductType: BillsForCollectionProductTypeEnum;

  @AllowNull(true)
  @Unique
  @Column({ type: DataType.STRING })
  @Index
  applicationNumber: string;

  @BelongsTo(() => BillsForCollectionRequest, { onDelete: 'CASCADE' })
  billsForCollectionRequest: BillsForCollectionRequest;

  @Column({
    type: DataType.ENUM(...Object.values(BillsForCollectionActionTypeEnum)),
  })
  status: BillsForCollectionActionTypeEnum;

  @Column({
    type: DataType.ENUM(...Object.values(BillsForCollectionStateEnum)),
    defaultValue: BillsForCollectionStateEnum.ACTIVE,
  })
  state: BillsForCollectionStateEnum;

  @AllowNull(false)
  @Unique
  @Column({ type: DataType.STRING })
  @Index
  referenceNumber: string;

  @Column({ type: DataType.STRING })
  receivedFromReference: string;

  @Column({ type: DataType.DATE })
  receivedOnDate: Date;

  @Column({
    type: DataType.ENUM(...Object.values(DocumentReleaseConditionEnum)),
  })
  documentReleaseCondition: DocumentReleaseConditionEnum;

  @Column({ type: DataType.DATE })
  issueDate: Date;

  @Column({ type: DataType.DATE })
  shipmentOnboardDate: Date;

  @Column({ type: DataType.DATE })
  expiryDate: Date;

  @Column({ type: DataType.STRING })
  behalfOfBranch: string;

  @Column({
    type: DataType.ENUM(...Object.values(AcknowledgementTransmissionEnum)),
  })
  acknowledgementTransmission: AcknowledgementTransmissionEnum;

  @Column({ type: DataType.BOOLEAN })
  directCollection: boolean;

  @Column({ type: DataType.BOOLEAN })
  sharedLiability: boolean;

  @Column({ type: DataType.BOOLEAN })
  urcApply: boolean;

  @Column({ type: DataType.BOOLEAN })
  holdDocumentsUntilArrivalGoods: boolean;

  // @Column({
  //   type: DataType.ENUM(...Object.values(AcceptanceOptionsEnum)),
  // })
  // acceptanceOptions: AcceptanceOptionsEnum;

  // @Column({
  //   type: DataType.ENUM(...Object.values(PaymentOptionsEnum)),
  // })
  // paymentOptions: PaymentOptionsEnum;

  // @Column({ type: DataType.BOOLEAN })
  // protestNonAcceptance: boolean;

  // @Column({ type: DataType.BOOLEAN })
  // protestNonPayment: boolean;

  // @Column({ type: DataType.BOOLEAN })
  // insureGoods: boolean;

  // @Column({ type: DataType.BOOLEAN })
  // warehouseGoods: boolean;

  @Column({ type: DataType.STRING })
  remittingBankBicCode: string;

  @Column({ type: DataType.STRING })
  remittingBankName: string;

  @Column({ type: DataType.STRING })
  remittingBankAddress: string;

  @Column({ type: DataType.STRING })
  drawer: string;

  @Column({ type: DataType.STRING })
  drawerCountry: string;

  @Column({ type: DataType.STRING })
  drawee: string;

  @Column({ type: DataType.STRING })
  draweeCountry: string;

  @Column({ type: DataType.STRING })
  presentingBankBicCode: string;

  @Column({ type: DataType.STRING })
  presentingBankName: string;

  @Column({ type: DataType.STRING })
  presentingBankAddress: string;

  @Column({ type: DataType.STRING })
  payee: string;

  @Column({ type: DataType.STRING })
  payeeAddress: string;

  @Column({ type: DataType.STRING })
  consignee: string;

  @Column({ type: DataType.STRING })
  consigneeAddress: string;

  @Column({ type: DataType.JSONB, allowNull: true })
  draftDetails: BillsForCollectionDraftDetails[] | null;

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  documentDetails: BillsForCollectionDocumentDetails[] | null;

  @Column({ type: DataType.FLOAT })
  collectionAmount: number;

  @Column({ type: DataType.STRING })
  collectionAmountCurrency: string;

  @Column({ type: DataType.STRING })
  baseCcyCurrency: string;

  @Column({ type: DataType.FLOAT })
  baseCcyRate: number;

  @Column({ type: DataType.FLOAT })
  baseCcyEquivalent: number;

  @Column({ type: DataType.STRING })
  localCcyCurrency: string;

  @Column({ type: DataType.FLOAT })
  localCcyRate: number;

  @Column({ type: DataType.FLOAT })
  localCcyEquivalent: number;

  @Column({ type: DataType.BOOLEAN })
  multiplePayments: boolean;

  @Column({ type: DataType.BOOLEAN })
  allowPartialPayment: boolean;

  @Column({ type: DataType.STRING })
  marginCurrency: string;

  @Column({ type: DataType.FLOAT })
  marginAmount: number;

  @Column({ type: DataType.STRING })
  marginPercentage: string;

  @Column({ type: DataType.STRING })
  collateralCurrency: string;

  @Column({ type: DataType.FLOAT })
  collateralAmount: number;

  @Column({ type: DataType.STRING })
  collateralPercentage: string;

  @Column({ type: DataType.STRING })
  goodsCode: string;

  // @Column({ type: DataType.STRING })
  // goodsCondition: string;

  @Column({ type: DataType.STRING })
  goodsDescription: string;

  @Column({ type: DataType.STRING })
  shipmentFrom: string;

  @Column({ type: DataType.STRING })
  shipmentTo: string;

  @Column({ type: DataType.DATE })
  expectedArrivalDate: Date;

  @Column({ type: DataType.STRING })
  vesselOrAircraft: string;

  @Column({ type: DataType.ENUM(...Object.values(ChargesBorneByEnum)) })
  ourChargesBorneBy: ChargesBorneByEnum;

  @Column({ type: DataType.ENUM(...Object.values(ChargesBorneByEnum)) })
  overseasChargesBorneBy: ChargesBorneByEnum;

  @Column({ type: DataType.STRING })
  preferredCurrencyForCharges: string;

  @Column({ type: DataType.STRING })
  taxPayableBy: string;

  @Column({ type: DataType.ENUM(...Object.values(BillingLevelEnum)) })
  billingLevel: BillingLevelEnum;

  @Column({ type: DataType.BOOLEAN })
  waiveChargesIfRefused: boolean;

  @Column({ type: DataType.BOOLEAN })
  collectAllOverseasCharges: boolean;

  @Column({ type: DataType.BOOLEAN })
  chargesDeferred: boolean;

  @Column({ type: DataType.ENUM(...Object.values(DeliveryMeansEnum)) })
  collectionDeliveryMeans: DeliveryMeansEnum;

  @Column({ type: DataType.ENUM(...Object.values(DeliveryMeansEnum)) })
  returnedBillsDeliveryMeans: DeliveryMeansEnum;

  @Column({ type: DataType.INTEGER })
  numberOfPackagesOrDeliveryItems: number;

  @Column({ type: DataType.INTEGER })
  numberOfDraftsToReturnAfterAcceptance: number;

  @Column({ type: DataType.BOOLEAN })
  traceAcknowledgement: boolean;

  @Column({ type: DataType.BOOLEAN })
  traceAcceptance: boolean;

  @Column({ type: DataType.BOOLEAN })
  tracePayment: boolean;

  @Column({ type: DataType.TEXT })
  instructionsText: string;

  @Column({ type: DataType.TEXT })
  specialInstructions: string;

  @Column({ type: DataType.TEXT })
  responseToSender: string;

  @HasMany(() => BillsForCollectionAmendment, {
    foreignKey: 'billsReferenceNumber',
    sourceKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  amendments?: BillsForCollectionAmendment[];

  @HasMany(() => BillsForCollectionAdjustment, {
    foreignKey: 'billsReferenceNumber',
    sourceKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  adjustments?: BillsForCollectionAdjustment[];

  @HasMany(() => BillsForCollectionNonAcceptanceOrNonPayment, {
    foreignKey: 'billsReferenceNumber',
    sourceKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  nonAcceptanceOrNonPayments?: BillsForCollectionNonAcceptanceOrNonPayment[];

  @HasMany(() => BillsForCollectionPayment, {
    foreignKey: 'billsReferenceNumber',
    sourceKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  payments?: BillsForCollectionPayment[];

  @HasMany(() => BillsForCollectionReceiveAcknowledgement, {
    foreignKey: 'billsReferenceNumber',
    sourceKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  receiveAcknowledgements?: BillsForCollectionReceiveAcknowledgement[];

  @HasMany(() => BillsForCollectionAcceptance, {
    foreignKey: 'billsReferenceNumber',
    sourceKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  acceptances?: BillsForCollectionAcceptance[];

  @HasMany(() => BillsForCollectionFreeFormatMessage, {
    foreignKey: 'billsReferenceNumber',
    sourceKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  freeFormats?: BillsForCollectionFreeFormatMessage[];

  @Column({ type: DataType.JSONB, defaultValue: [] })
  chargesAndTaxesTransactionArray: string[];

  @Column({ type: DataType.JSONB, defaultValue: [] })
  postingEntryTransactionArray: PostingEntryTransactionDto[];

  @Column({ type: DataType.JSONB, defaultValue: [] })
  swiftMessages: SwiftMessageDto[];
}
