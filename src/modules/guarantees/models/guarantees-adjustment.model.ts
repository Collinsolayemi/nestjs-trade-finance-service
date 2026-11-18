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
import { GuaranteesRequest } from './guarantees-request.model';
import { Guarantees } from './guarantees.model';
import {
  ConfirmationInstructionEnum,
  DeliveryMeansEnum,
  GuaranteesApplicableRulesEnum,
  GuaranteesAvailableByEnum,
  GuaranteesClassificationEnum,
  GuaranteesContractReferenceEnum,
  GuaranteesOurChargesPaidByEnum,
  GuaranteesOverseasChargesPaidByEnum,
  GuaranteesRenewOnEnum,
  GuaranteesTaxPaidByEnum,
  GuaranteesTenorStartBoundaryEnum,
  TenorPeriodEnum,
} from 'src/common/enums';
import { GuaranteesAvailableByMixedPaymentDetail } from '../types/guarantees-available-by-mixed-payment-details.types';
import { Max } from 'class-validator';
import { GuaranteesDocumentUploadDto } from '../dto/guarantees-document-upload.dto';

@Table({ modelName: 'guarantees_adjustment' })
export class GuaranteesAdjustment extends Model<GuaranteesAdjustment> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  guaranteesAdjustmentId: string;

  @ForeignKey(() => GuaranteesRequest)
  @AllowNull(false)
  @Column({ type: DataType.UUID })
  @Index
  requestId: string;

  @BelongsTo(() => GuaranteesRequest, { onDelete: 'CASCADE' })
  guaranteesRequest: GuaranteesRequest;

  @AllowNull(false)
  @Column({ type: DataType.UUID })
  tradeProductId: string;

  @ForeignKey(() => Guarantees)
  @AllowNull(false)
  @Column({ type: DataType.STRING })
  @Index
  guaranteesReferenceNumber: string;

  @BelongsTo(() => Guarantees, {
    foreignKey: 'guaranteesReferenceNumber',
    targetKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  guarantees: Guarantees;

  @Column({ type: DataType.DATE })
  adjustmentDate: Date;

  @Column({ type: DataType.TEXT })
  adjustmentNarrative: string;

  @Column({ type: DataType.TEXT })
  instructionsFromApplicant: string;

  @Column({ type: DataType.TEXT })
  responseToApplicant: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  applyReversalPostings: boolean;

  @Column({ type: DataType.STRING })
  principalsReference: string;

  @Column({ type: DataType.STRING })
  relatedReference: string;

  @Column({ type: DataType.DATE })
  applicationDate: Date;

  @Column({ type: DataType.DATE })
  issueDate: Date;

  @Column({ type: DataType.DATE })
  expiryDate: Date;

  @Column({ type: DataType.STRING })
  placeOfExpiry: string;

  @Column({
    type: DataType.ENUM(...Object.values(GuaranteesClassificationEnum)),
  })
  guaranteeClassification: GuaranteesClassificationEnum;

  @Column({
    type: DataType.ENUM(...Object.values(GuaranteesApplicableRulesEnum)),
  })
  applicableRules: GuaranteesApplicableRulesEnum;

  @Column({ type: DataType.STRING })
  otherApplicableRules: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  domesticExpiry: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  operative: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  provisionalDraft: boolean;

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

  @Column({ type: DataType.STRING })
  beneficiaryCountry: string;

  @Column({ type: DataType.STRING })
  advisingBankBicCode: string;

  @Column({ type: DataType.STRING })
  advisingBankName: string;

  @Column({ type: DataType.STRING })
  advisingBankAddress: string;

  @Column({ type: DataType.FLOAT })
  guaranteesAmount: number;

  @Column({ type: DataType.STRING })
  guaranteesCurrencyCode: string;

  @Max(10)
  @Column({ type: DataType.FLOAT })
  minAmountTolerance: number;

  @Max(10)
  @Column({ type: DataType.FLOAT })
  maxAmountTolerance: number;

  @Column({ type: DataType.STRING })
  additionalAmount: string;

  @Column({ type: DataType.STRING })
  additionalAmountCurrency: string;

  @Column({ type: DataType.STRING })
  additionalAmountDetails: string;

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
  confirmationAmount: number;

  @Column({ type: DataType.STRING })
  confirmationAmountCurrency: string;

  @Column({ type: DataType.STRING })
  confirmationBankBicCode: string;

  @Column({ type: DataType.STRING })
  confirmationBankName: string;

  @Column({ type: DataType.STRING })
  confirmationBankAddress: string;

  @Column({
    type: DataType.ENUM(...Object.values(GuaranteesAvailableByEnum)),
  })
  availableBy: GuaranteesAvailableByEnum;

  @Column({ type: DataType.INTEGER })
  availableByPeriod: number;

  @Column({
    type: DataType.ENUM(...Object.values(TenorPeriodEnum)),
  })
  availableByPeriodUnit: TenorPeriodEnum;

  @Column({
    type: DataType.ENUM(...Object.values(GuaranteesTenorStartBoundaryEnum)),
  })
  tenorStartBoundary: GuaranteesTenorStartBoundaryEnum;

  @Column({ type: DataType.DATE })
  startDate: Date;

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  availableByMixedPaymentDetails:
    | GuaranteesAvailableByMixedPaymentDetail[]
    | null;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  partialDrawing: boolean;

  @Column({ type: DataType.DATE })
  notPayableBefore: Date;

  @Column({
    type: DataType.ENUM(...Object.values(GuaranteesOurChargesPaidByEnum)),
  })
  ourChargesPaidBy: GuaranteesOurChargesPaidByEnum;

  @Column({
    type: DataType.ENUM(...Object.values(GuaranteesOverseasChargesPaidByEnum)),
  })
  overseasChargesPaidBy: GuaranteesOverseasChargesPaidByEnum;

  @Column({
    type: DataType.ENUM(...Object.values(GuaranteesTaxPaidByEnum)),
  })
  taxPaidBy: GuaranteesTaxPaidByEnum;

  @Column({ type: DataType.STRING })
  beneficiaryBankBicCode: string;

  @Column({ type: DataType.STRING })
  beneficiaryBankName: string;

  @Column({ type: DataType.STRING })
  beneficiaryBankAddress: string;

  @Column({ type: DataType.STRING })
  nextAdvisingBankBicCode: string;

  @Column({ type: DataType.STRING })
  nextAdvisingBankName: string;

  @Column({ type: DataType.STRING })
  nextAdvisingBankAddress: string;

  @Column({ type: DataType.STRING })
  adviseThroughBankBicCode: string;

  @Column({ type: DataType.STRING })
  adviseThroughBankName: string;

  @Column({ type: DataType.STRING })
  adviseThroughBankAddress: string;

  @Column({ type: DataType.STRING })
  adviseThroughBankAccountNumber: string;

  @Column({ type: DataType.STRING })
  reimbursingBankBicCode: string;

  @Column({ type: DataType.STRING })
  reimbursingBankName: string;

  @Column({ type: DataType.STRING })
  reimbursingBankAddress: string;

  @Column({ type: DataType.STRING })
  principalsBankBicCode: string;

  @Column({ type: DataType.STRING })
  principalsBankName: string;

  @Column({ type: DataType.STRING })
  principalsBankAddress: string;

  @Column({ type: DataType.STRING })
  issuingBankBicCode: string;

  @Column({ type: DataType.STRING })
  issuingBankName: string;

  @Column({ type: DataType.STRING })
  issuingBankAddress: string;

  // Goods and shipment details
  @Column({ type: DataType.STRING })
  goodsCode: string;

  @Column({ type: DataType.TEXT })
  goodsDescription: string;

  @Column({ type: DataType.TEXT })
  guaranteeAdditionalInformation: string;

  @Column({ type: DataType.STRING })
  shipmentFrom: string;

  @Column({ type: DataType.STRING })
  shipmentTo: string;

  @Column({ type: DataType.DATE })
  shipmentDate: Date;

  @Column({ type: DataType.TEXT })
  shipmentPeriod: string;

  @Column({ type: DataType.STRING })
  billOfLadingAirWaybillNo: string;

  @Column({ type: DataType.STRING })
  vesselName: string;

  @Column({ type: DataType.ENUM(...Object.values(DeliveryMeansEnum)) })
  documentsToBeSentBy: DeliveryMeansEnum;

  @Column({ type: DataType.INTEGER })
  numberOfPackagesOrDeliveryItems: number;

  @Column({ type: DataType.STRING })
  shippingCo: string;

  @Column({ type: DataType.STRING })
  flightNoOrDetails: string;

  @Column({ type: DataType.INTEGER })
  periodForPresentation: number;

  @Column({
    type: DataType.ENUM(...Object.values(TenorPeriodEnum)),
  })
  periodForPresentationUnit: TenorPeriodEnum;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  letterOfIndemnity: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  useFreeFormat: boolean;

  @Column({ type: DataType.TEXT })
  documentsRequired: string;

  @Column({ type: DataType.TEXT })
  additionalConditions: string;

  @Column({ type: DataType.TEXT })
  responseToSender: string;

  @Column({ type: DataType.TEXT })
  instructionsReceived: string;

  @Column({ type: DataType.TEXT })
  instructionsToReimbursingBank: string;

  @Column({ type: DataType.TEXT })
  instructionsToPayingBank: string;

  @Column({ type: DataType.TEXT })
  instructionsToNextAdvisingBank: string;

  @Column({
    type: DataType.ENUM(...Object.values(GuaranteesContractReferenceEnum)),
  })
  contractReference: GuaranteesContractReferenceEnum;

  @Column({ type: DataType.TEXT })
  contractReferenceNarrative: string;

  @Column({ type: DataType.DATE })
  referenceDate: Date;

  @Column({ type: DataType.FLOAT })
  totalOrderContractAmount: number;

  @Column({ type: DataType.STRING })
  totalOrderContractAmountCurrency: string;

  @Column({ type: DataType.FLOAT })
  guaranteeValuePercentage: number;

  @Column({
    type: DataType.ENUM(...Object.values(GuaranteesRenewOnEnum)),
    defaultValue: GuaranteesRenewOnEnum.DONT_RENEW,
  })
  renewOn: GuaranteesRenewOnEnum;

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  documents: GuaranteesDocumentUploadDto[] | null;
}
