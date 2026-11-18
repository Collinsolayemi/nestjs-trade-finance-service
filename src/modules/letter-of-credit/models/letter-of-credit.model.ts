import {
  AllowNull,
  BelongsTo,
  BeforeSave,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  HasMany,
  HasOne,
  // HasMany,
  // HasOne,
  Index,
  Max,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { LetterOfCreditRequest } from './letter-of-credit-request.model';
// import { LetterOfCreditPreNegotiation } from './letter-of-credit-pre-negotiation.model';
// import { LetterOfCreditFxBidRequest } from './letter-of-credit-fx-bid-request.model';
// import { LetterOfCreditSettlementDetails } from './letter-of-credit-settlemet-details.model';
// import { LetterOfCreditAdjustment } from './letter-of-credit-adjustment.model';
// import { LetterOfCreditCancellation } from './letter-of-credit-cancellation.model';
// import { LetterOfCreditNegotiation } from './letter-of-credit-negotiation.model';
import { uuidv7 } from 'uuidv7';
import {
  ApplicationRulesEnum,
  ConfirmationInstructionEnum,
  CreditAvailableByEnum,
  CreditAvailableWithEnum,
  DraftModeEnum,
  DraweeEnum,
  FormOfDocumentaryCreditEnum,
  // ILCProductSubTypeEnum,
  LetterOfCreditActionTypeEnum,
  LetterOfCreditProductTypeEnum,
  LetterOfCreditStateEnum,
  PaymentMethodEnum,
  RequestedConfirmationPartyEnum,
  ShipmentEnum,
  TenorPeriodEnum,
} from 'src/common/enums';
import { LetterOfCreditDocumentUploadDto } from '../dto/letter-of-credit-document-upload.dto';
import { MixedPaymentDto } from '../dto/mixed-payment.dto';
import { LetterOfCreditAmendment } from './letter-of-credit-amendment.model';
import { LetterOfCreditAdjustment } from './letter-of-credit-adjustment.model';
import { LetterOfCreditCancellation } from './letter-of-credit-cancellation.model';
import { PostingEntryTransactionDto } from '../dto/posting-entry-transaction-ids.dto';
import { LetterOfCreditPayment } from './letter-of-credit-payment.model';
import { LetterOfCreditFreeFormatMessage } from './letter-of-credit-free-format-message.model';
import { LetterOfCreditDocumentLodgement } from './letter-of-credit-document-lodgement.model';
import { LetterOfCreditAssignmentOfProceed } from './letter-of-credit-assignment-of-proceed.model';
import { SwiftMessageDto } from '../dto/swift-message.dto';

@DefaultScope(() => ({
  include: [
    // { model: LetterOfCreditRequest },
    // { model: LetterOfCreditAdjustment },
    // { model: LetterOfCreditCancellation },
    // { model: LetterOfCreditNegotiation },
    // { model: LetterOfCreditPreNegotiation, required: false },
    // { model: LetterOfCreditFxBidRequest },
    // { model: LetterOfCreditSettlementDetails },
  ],
}))
@Table({ modelName: 'letter_of_credit' })
export class LetterOfCredit extends Model<LetterOfCredit> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  letterOfCreditId: string;

  @ForeignKey(() => LetterOfCreditRequest)
  @AllowNull(false)
  @Column({ type: DataType.UUID })
  @Index
  requestId: string;

  @AllowNull(false)
  @Column({ type: DataType.UUID })
  tradeProductId: string;

  @Column({
    type: DataType.ENUM(...Object.values(LetterOfCreditProductTypeEnum)),
  })
  letterOfCreditProductType: LetterOfCreditProductTypeEnum;

  // @Column({
  //   type: DataType.ENUM(...Object.values(ILCProductSubTypeEnum)),
  // })
  // letterOfCreditProductSubType: ILCProductSubTypeEnum;

  @AllowNull(true)
  @Unique
  @Column({ type: DataType.STRING })
  @Index
  applicationNumber: string;

  @BelongsTo(() => LetterOfCreditRequest, { onDelete: 'CASCADE' })
  letterOfCreditRequest: LetterOfCreditRequest;

  @Column({
    type: DataType.ENUM(...Object.values(LetterOfCreditActionTypeEnum)),
  })
  status: LetterOfCreditActionTypeEnum;

  @Column({
    type: DataType.ENUM(...Object.values(LetterOfCreditStateEnum)),
    defaultValue: LetterOfCreditStateEnum.ACTIVE,
  })
  state: LetterOfCreditStateEnum;

  @AllowNull(false)
  @Unique
  @Column({ type: DataType.STRING })
  @Index
  referenceNumber: string;

  @Column({
    type: DataType.ENUM(...Object.values(FormOfDocumentaryCreditEnum)),
  })
  formOfDocumentaryCredit: FormOfDocumentaryCreditEnum;

  @Unique
  @Column({ type: DataType.STRING })
  preAdviceReferenceNumber: string;

  @Column({ type: DataType.DATE })
  issueDate: Date;

  @Column({ type: DataType.DATE })
  previousIssueDate: Date;

  @Column({ type: DataType.DATE })
  expiryDate: Date;

  @Column({ type: DataType.DATE })
  previousExpiryDate: Date;

  @Column({ type: DataType.STRING })
  expiryPlace: string;

  @Column({ type: DataType.ENUM(...Object.values(ApplicationRulesEnum)) })
  applicableRules: ApplicationRulesEnum;

  @Column({ type: DataType.STRING })
  otherApplicableRules: string;

  @Column({ type: DataType.STRING })
  applicantName: string;

  @Column({ type: DataType.STRING })
  applicantAddress: string;

  @Column({ type: DataType.STRING })
  applicantAccount: string;

  @Column({ type: DataType.STRING })
  beneficiaryName: string;

  @Column({ type: DataType.STRING })
  beneficiaryAddress: string;

  @Column({ type: DataType.STRING })
  beneficiaryAccount: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  adviseDirect: boolean;

  @Column({ type: DataType.STRING })
  advisingBankBicCode: string;

  @Column({ type: DataType.STRING })
  advisingBankName: string;

  @Column({ type: DataType.STRING })
  advisingBankAddress: string;

  @Column({ type: DataType.FLOAT })
  lcAmount: number;

  @Max(10)
  @Column({ type: DataType.FLOAT })
  minCreditAmountTolerance: number;

  @Max(10)
  @Column({ type: DataType.FLOAT })
  maxCreditAmountTolerance: number;

  @Column({ type: DataType.STRING })
  additionalAmount: string;

  @Column({ type: DataType.STRING })
  lcCurrencyCode: string;

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

  @Column({
    type: DataType.ENUM(...Object.values(ConfirmationInstructionEnum)),
  })
  confirmationInstruction: ConfirmationInstructionEnum;

  @Column({ type: DataType.FLOAT })
  totalPaymentAmount: number;

  @Column({ type: DataType.FLOAT })
  confirmationAmount: number;

  @Column({ type: DataType.FLOAT })
  unconfirmedAmount: number;

  @Column({ type: DataType.FLOAT })
  outstandingBalance: number;

  @Column({ type: DataType.STRING })
  confirmationAmountCurrency: string;

  @Column({
    type: DataType.ENUM(...Object.values(RequestedConfirmationPartyEnum)),
  })
  requestedConfirmationParty: RequestedConfirmationPartyEnum;

  @Column({ type: DataType.STRING })
  requestedConfirmationBankBicCode: string;

  @Column({ type: DataType.STRING })
  requestedConfirmationBankName: string;

  @Column({ type: DataType.STRING })
  requestedConfirmationBankAddress: string;

  @Column({ type: DataType.ENUM(...Object.values(CreditAvailableWithEnum)) })
  creditAvailableWith: CreditAvailableWithEnum;

  @Column({ type: DataType.STRING })
  creditAvailableWithBankSwiftCode: string;

  @Column({ type: DataType.STRING })
  creditAvailableWithBankName: string;

  @Column({ type: DataType.STRING })
  creditAvailableWithBankAddress: string;

  @Column({
    type: DataType.ENUM(...Object.values(CreditAvailableByEnum)),
  })
  creditAvailableBy: CreditAvailableByEnum;

  @Column({ type: DataType.DATE })
  paymentDate: Date;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentMethodEnum)),
  })
  paymentMethod: PaymentMethodEnum;

  @Column({ type: DataType.JSONB })
  mixedPaymentDetails: MixedPaymentDto[];

  @Column({ type: DataType.BOOLEAN })
  draftDrawn: boolean;

  //new
  @Column({
    type: DataType.ENUM(...Object.values(DraweeEnum)),
  })
  drawee: DraweeEnum;

  @Column({ type: DataType.STRING })
  draweeBankBicCode: string;

  @Column({ type: DataType.STRING })
  draweeBankName: string;

  @Column({ type: DataType.STRING })
  draweeBankAddress: string;

  //new
  @Column({
    type: DataType.ENUM(...Object.values(DraftModeEnum)),
  })
  draftMode: DraftModeEnum;

  @Column({ type: DataType.DATE })
  maturityDate: Date;

  //new
  @Column({ type: DataType.INTEGER })
  tenorPeriod: number;

  //new
  @Column({
    type: DataType.ENUM(...Object.values(TenorPeriodEnum)),
  })
  tenorPeriodType: TenorPeriodEnum;

  @Column({ type: DataType.STRING })
  beneficiaryBankSwiftCode: string;

  @Column({ type: DataType.STRING })
  beneficiaryBankName: string;

  @Column({ type: DataType.STRING })
  beneficiaryBankAddress: string;

  @Column({ type: DataType.STRING })
  applicantBankBicCode: string;

  @Column({ type: DataType.STRING })
  applicantBankName: string;

  @Column({ type: DataType.STRING })
  applicantBankAddress: string;

  @Column({ type: DataType.STRING })
  adviseThroughBankBicCode: string;

  @Column({ type: DataType.STRING })
  adviseThroughBankName: string;

  @Column({ type: DataType.STRING })
  adviseThroughBankAddress: string;

  @Column({ type: DataType.STRING })
  reimbursingBankBicCode: string;

  @Column({ type: DataType.STRING })
  reimbursingBankName: string;

  @Column({ type: DataType.STRING })
  reimbursingBankAddress: string;

  @Column({ type: DataType.ENUM(...Object.values(ShipmentEnum)) })
  partialShipment: ShipmentEnum;

  @Column({ type: DataType.ENUM(...Object.values(ShipmentEnum)) })
  transShipment: ShipmentEnum;

  @Column({ type: DataType.STRING })
  portOfLoading: string;

  @Column({ type: DataType.STRING })
  portOfDischarge: string;

  @Column({ type: DataType.STRING })
  placeOfChargeTaken: string;

  @Column({ type: DataType.STRING })
  finalDestination: string;

  @Column({ type: DataType.DATE })
  latestShipmentDate: Date;

  @Column({ type: DataType.DATE })
  previousLatestShipmentDate: Date;

  @Column({ type: DataType.TEXT })
  shipmentPeriod: string;

  @Column({ type: DataType.TEXT })
  descriptionOfGoods: string;

  @Column({ type: DataType.STRING })
  presentationDays: string;

  @Column({
    type: DataType.ENUM(...Object.values(TenorPeriodEnum)),
  })
  presentationDaysType: TenorPeriodEnum;

  @Column({ type: DataType.TEXT })
  documentsRequired: string;

  @Column({ type: DataType.TEXT })
  additionalConditions: string;

  //rename
  @Column({ type: DataType.TEXT })
  specialPaymentConditionsForBeneficiary: string;

  //rename
  @Column({ type: DataType.TEXT })
  specialPaymentConditionsForBank: string;

  @Column({ type: DataType.STRING })
  charges: string;

  //rename - each entry: max 780 chars, 12 rows with max 65 chars per row
  @Column({ type: DataType.JSONB, defaultValue: [] })
  instructionsToThePayingOrAcceptingOrNegotiatingBank: string[];

  @Column({ type: DataType.STRING })
  senderToReceiverInformation: string;

  @Column({ type: DataType.STRING })
  marginCurrency: string;

  @Column({ type: DataType.FLOAT })
  marginAmount: number;

  @Column({ type: DataType.STRING })
  marginPercentage: string;

  @Column({ type: DataType.STRING })
  marginAccount: string;

  @Column({ type: DataType.STRING })
  collateralCurrency: string;

  @Column({ type: DataType.FLOAT })
  collateralAmount: number;

  @Column({ type: DataType.STRING })
  collateralAccount: string;

  @Column({ type: DataType.STRING })
  collateralPercentage: string;

  //new
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  preNegotiation: boolean;

  //new
  @Column({ type: DataType.FLOAT })
  preNegotiationAmount: number;

  @Column({ type: DataType.STRING })
  preNegotationAmountCurrency: string;

  //new
  @Column({ type: DataType.STRING })
  confirmationBankName: string;

  //new
  @Column({ type: DataType.STRING })
  creditLine: string;

  @Column({ type: DataType.FLOAT })
  costOfFundsRate: number;

  @Column({ type: DataType.FLOAT })
  marginRate: number;

  @Column({ type: DataType.FLOAT })
  totalInterestRate: number;

  //new
  @Column({ type: DataType.DATE })
  preNegotiationStartDate: Date;

  //new
  @Column({ type: DataType.DATE })
  preNegotiationMaturityDate: Date;

  @Column({ type: DataType.STRING })
  relatedReference: string;

  //new all the way down
  @Column({ type: DataType.STRING })
  beneficiaryInstituitionBicCode: string;

  @Column({ type: DataType.STRING })
  beneficiaryInstituitionBankName: string;

  @Column({ type: DataType.STRING })
  beneficiaryInstituitionAddress: string;

  @Column({ type: DataType.STRING })
  beneficiaryInstituitionAccount: string;

  @Column({ type: DataType.STRING })
  beneficiaryInstituitionAccountCurrency: string;

  @Column({ type: DataType.STRING })
  accountWithInstituitionBicCode: string;

  @Column({ type: DataType.STRING })
  accountWithInstituitionBankName: string;

  @Column({ type: DataType.STRING })
  accountWithInstituitionAddress: string;

  @Column({ type: DataType.STRING })
  accountWithInstituitionAccount: string;

  @Column({ type: DataType.STRING })
  accountWithInstituitionAccountCurrency: string;

  @Column({ type: DataType.STRING })
  orderingInstituionBicCode: string;

  @Column({ type: DataType.STRING })
  orderingInstituionBankName: string;

  @Column({ type: DataType.STRING })
  orderingInstituionAddress: string;

  @Column({ type: DataType.STRING })
  orderingInstituionAccount: string;

  @Column({ type: DataType.STRING })
  orderingInstituionAccountCurrency: string;

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
  intermediaryBicCode: string;

  @Column({ type: DataType.STRING })
  intermediaryBankName: string;

  @Column({ type: DataType.STRING })
  intermediaryAddress: string;

  @Column({ type: DataType.STRING })
  intermediaryAccount: string;

  @Column({ type: DataType.STRING })
  intermediaryAccountCurrency: string;

  @Column({ type: DataType.STRING })
  fundsTransferSenderToReceiverInformation: string;

  @Column({ type: DataType.JSONB })
  documentAttachments: LetterOfCreditDocumentUploadDto[];

  @Column({ type: DataType.STRING })
  mt700Url: string;

  @Column({ type: DataType.JSONB, defaultValue: [] })
  chargesAndTaxesTransactionArray: string[];

  @Column({ type: DataType.JSONB, defaultValue: [] })
  postingEntryTransactionArray: PostingEntryTransactionDto[];

  @HasMany(() => LetterOfCreditAmendment, {
    foreignKey: 'lcReferenceNumber',
    sourceKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  amendments?: LetterOfCreditAmendment[];

  @HasMany(() => LetterOfCreditAdjustment, {
    foreignKey: 'lcReferenceNumber',
    sourceKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  adjustments?: LetterOfCreditAdjustment[];

  @HasOne(() => LetterOfCreditCancellation, {
    foreignKey: 'lcReferenceNumber',
    sourceKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  cancellation?: LetterOfCreditCancellation;

  @HasMany(() => LetterOfCreditFreeFormatMessage, {
    foreignKey: 'lcReferenceNumber',
    sourceKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  freeFormatMessages?: LetterOfCreditFreeFormatMessage[];

  @HasMany(() => LetterOfCreditPayment, {
    foreignKey: 'lcReferenceNumber',
    sourceKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  payments?: LetterOfCreditPayment[];

  @HasMany(() => LetterOfCreditDocumentLodgement, {
    foreignKey: 'lcReferenceNumber',
    sourceKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  documentLodgements?: LetterOfCreditDocumentLodgement[];

  @HasMany(() => LetterOfCreditAssignmentOfProceed, {
    foreignKey: 'lcReferenceNumber',
    sourceKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  assignmentsOfProceeds?: LetterOfCreditAssignmentOfProceed[];

  @Column({ type: DataType.JSONB, defaultValue: [] })
  swiftMessages: SwiftMessageDto[];

  @BeforeSave
  static calculateUnconfirmedAmount(letterOfCredit: LetterOfCredit) {
    const lcAmount = Number(letterOfCredit.lcAmount ?? 0);
    const confirmationAmount = Number(letterOfCredit.confirmationAmount ?? 0);

    letterOfCredit.unconfirmedAmount = lcAmount - confirmationAmount;
  }
}
