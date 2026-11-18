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
  BillsForCollectionPaymentPartyEnum,
  BillsForCollectionTenorStartBoundaryEnum,
} from 'src/common/enums';
import { BillsForCollectionDocumentUploadDto } from '../dto/bills-for-collection-document-upload.dto';
import { BillsForCollectionPaymentToAccept } from '../types/bills-for-collection-payment-to-accept.types';

@Table({ modelName: 'bills_for_collection_acceptance' })
export class BillsForCollectionAcceptance extends Model<BillsForCollectionAcceptance> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  billsForCollectionAcceptanceId: string;

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

  @Column({ type: DataType.STRING })
  senderBicCode: string;

  @Column({ type: DataType.STRING })
  senderName: string;

  @Column({ type: DataType.STRING })
  senderAddress: string;

  // @Column({ type: DataType.STRING })
  // receivedFromReference: string;

  @Column({ type: DataType.DATE })
  dateReceived: Date;

  @Column({ type: DataType.STRING })
  sendersReference: string;

  @Column({ type: DataType.STRING })
  instructionsReceived: string;

  @Column({ type: DataType.INTEGER })
  tenorPeriod: number;

  @Column({
    type: DataType.ENUM(
      ...Object.values(BillsForCollectionTenorStartBoundaryEnum),
    ),
  })
  tenorStartBoundary: BillsForCollectionTenorStartBoundaryEnum;

  @Column({ type: DataType.DATE })
  tenorStartDate: Date;

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  paymentsToAccept: BillsForCollectionPaymentToAccept[] | null;

  @Column({
    type: DataType.ENUM(...Object.values(BillsForCollectionPaymentPartyEnum)),
  })
  addresseePartyRole: BillsForCollectionPaymentPartyEnum;

  @Column({ type: DataType.STRING })
  addresseeReference: string;

  @Column({
    type: DataType.ENUM(...Object.values(BillsForCollectionAdviseByEnum)),
  })
  advisedBy: BillsForCollectionAdviseByEnum;

  @Column({ type: DataType.STRING })
  instructionsToSend: string;

  @Column({ type: DataType.FLOAT })
  amountAccepted: number;

  @Column({ type: DataType.STRING })
  amountAcceptedCurrency: string;

  @Column({ type: DataType.FLOAT })
  marginDeposit: number;

  @Column({ type: DataType.STRING })
  marginDepositCurrency: string;

  @Column({ type: DataType.BOOLEAN })
  expireCollection: boolean;

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  documents: BillsForCollectionDocumentUploadDto[] | null;
}
