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
import { Guarantees } from './guarantees.model';
import { GuaranteesRequest } from './guarantees-request.model';
import {
  GuaranteesPaymentAvailableByEnum,
  GuaranteesPresentersActionEnum,
  GuaranteesTenorStartBoundaryEnum,
  PaymentActionTypeEnum,
  TenorPeriodEnum,
} from 'src/common/enums';
import { uuidv7 } from 'uuidv7';
import { GuaranteesMixedPaymentDetail } from '../types/guarantees-mixed-payment-details.types';
import { GuaranteesDocumentUploadDto } from '../dto/guarantees-document-upload.dto';

@Table({ modelName: 'guarantees_receive_claim' })
export class GuaranteesReceiveClaim extends Model<GuaranteesReceiveClaim> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  guaranteesReceiveClaimId: string;

  @ForeignKey(() => GuaranteesRequest)
  @AllowNull(false)
  @Column({ type: DataType.UUID })
  @Index
  requestId: string;

  @BelongsTo(() => GuaranteesRequest, { onDelete: 'CASCADE' })
  guaranteesRequest: GuaranteesRequest;

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

  @Column({ type: DataType.STRING })
  presentersReference: string;

  @Column({ type: DataType.STRING })
  presentingPartyBicCode: string;

  @Column({ type: DataType.STRING })
  presentingPartyName: string;

  @Column({ type: DataType.STRING })
  presentingPartyAddress: string;

  @Column({
    type: DataType.ENUM(...Object.values(GuaranteesPresentersActionEnum)),
  })
  presentersAction: GuaranteesPresentersActionEnum;

  @Column({ type: DataType.FLOAT })
  presentationAmount: number;

  @Column({ type: DataType.STRING })
  presentationAmountCurrency: string;

  @Column({ type: DataType.FLOAT })
  additionalAmount: number;

  @Column({ type: DataType.STRING })
  additionalAmountCurrency: string;

  @Column({ type: DataType.FLOAT })
  chargesAddedAmount: number;

  @Column({ type: DataType.STRING })
  chargesAddedAmountCurrency: string;

  @Column({ type: DataType.FLOAT })
  chargesDeductedAmount: number;

  @Column({ type: DataType.STRING })
  chargesDeductedAmountCurrency: string;

  @Column({ type: DataType.FLOAT })
  totalClaimedAmount: number;

  @Column({ type: DataType.STRING })
  totalClaimedAmountCurrency: string;

  @Column({ type: DataType.DATE })
  presentationDate: Date;

  @Column({ type: DataType.DATE })
  paymentDueDate: Date;

  @Column({ type: DataType.DATE })
  chargeDueDate: Date;

  @Column({ type: DataType.TEXT })
  presentersDiscrepancies: string;

  @Column({ type: DataType.TEXT })
  notesFromPresenter: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  mixedPayment: boolean;

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  mixedPaymentDetails: GuaranteesMixedPaymentDetail[] | null;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentActionTypeEnum)),
  })
  paymentAction: PaymentActionTypeEnum;

  @Column({
    type: DataType.ENUM(...Object.values(GuaranteesPaymentAvailableByEnum)),
  })
  availableBy: GuaranteesPaymentAvailableByEnum;

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

  @Column({ type: DataType.DATE })
  valueDate: Date;

  @Column({ type: DataType.FLOAT })
  paymentAmount: number;

  @Column({ type: DataType.STRING })
  paymentAmountCurrency: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  withRecourse: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  finalPayment: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  cancelReimbursementAuthority: boolean;

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  documents: GuaranteesDocumentUploadDto[] | null;
}
