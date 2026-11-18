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
import {
  AcknowledgementTransmissionEnum,
  BillingLevelEnum,
  BillsForCollectionProductTypeEnum,
  ChargesBorneByEnum,
  DeliveryMeansEnum,
  DocumentReleaseConditionEnum,
} from 'src/common/enums';
import { uuidv7 } from 'uuidv7';
import { BillsForCollection } from './bills-for-collection.model';
import { BillsForCollectionDraftDetails } from '../types/bills-for-collection-draft-details.types';
import { BillsForCollectionDocumentDetails } from '../types/bills-for-collection-document-details.types';
import { BillsForCollectionRequest } from './bills-for-collection-request.model';

@Table({ modelName: 'bills_for_collection_adjustment' })
export class BillsForCollectionAdjustment extends Model<BillsForCollectionAdjustment> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  billsForCollectionAdjustmentId: string;

  @ForeignKey(() => BillsForCollectionRequest)
  @AllowNull(false)
  @Column({ type: DataType.UUID })
  @Index
  requestId: string;

  @BelongsTo(() => BillsForCollectionRequest, { onDelete: 'CASCADE' })
  billsForCollectionRequest: BillsForCollectionRequest;

  @AllowNull(false)
  @Column({ type: DataType.UUID })
  tradeProductId: string;

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

  @Column({
    type: DataType.ENUM(...Object.values(BillsForCollectionProductTypeEnum)),
  })
  billsForCollectionProductType: BillsForCollectionProductTypeEnum;

  @Column({ type: DataType.DATE })
  adjustmentDate: Date;

  @Column({ type: DataType.STRING })
  instructionsReceived: string;

  @Column({ type: DataType.STRING })
  amendmentNarrative: string;

  @Column({ type: DataType.STRING })
  instructionsToSend: string;

  @Column({ type: DataType.BOOLEAN })
  expire: boolean;

  @Column({ type: DataType.BOOLEAN })
  applyReversalPostings: boolean;

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

  @Column({ type: DataType.FLOAT })
  collectionAmount: number;

  @Column({ type: DataType.STRING })
  collectionAmountCurrency: string;

  @Column({ type: DataType.BOOLEAN })
  multiplePayments: boolean;

  @Column({ type: DataType.BOOLEAN })
  allowPartialPayment: boolean;

  @Column({ type: DataType.JSONB, allowNull: true })
  draftDetails: BillsForCollectionDraftDetails[] | null;

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  documentDetails: BillsForCollectionDocumentDetails[] | null;

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

  @Column({ type: DataType.BOOLEAN })
  waiveChargesIfRefused: boolean;

  @Column({ type: DataType.BOOLEAN })
  collectAllOverseasCharges: boolean;

  @Column({ type: DataType.ENUM(...Object.values(ChargesBorneByEnum)) })
  overseasChargesBorneBy: ChargesBorneByEnum;

  @Column({ type: DataType.BOOLEAN })
  chargesDeferred: boolean;

  @Column({ type: DataType.STRING })
  preferredCurrencyForCharges: string;

  @Column({ type: DataType.STRING })
  taxPayableBy: string;

  @Column({ type: DataType.ENUM(...Object.values(BillingLevelEnum)) })
  billingLevel: BillingLevelEnum;

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
}
