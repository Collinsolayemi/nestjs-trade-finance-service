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
import { BillsForCollectionTenorStartBoundaryEnum } from 'src/common/enums';
import { BillsForCollectionDocumentUploadDto } from '../dto/bills-for-collection-document-upload.dto';

@Table({ modelName: 'bills_for_collection_receive_acknowledgement' })
export class BillsForCollectionReceiveAcknowledgement extends Model<BillsForCollectionReceiveAcknowledgement> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  billsForCollectionReceiveAcknowledgementId: string;

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
  @Index({
    name: 'bfc_receive_ack_bills_ref_no_idx',
  })
  billsReferenceNumber: string;

  @BelongsTo(() => BillsForCollection, {
    foreignKey: 'billsReferenceNumber',
    targetKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  billsForCollection: BillsForCollection;

  @Column({ type: DataType.STRING })
  receivedFromReference: string;

  @Column({ type: DataType.DATE })
  dateReceived: Date;

  @Column({ type: DataType.STRING })
  sendersReference: string;

  @Column({ type: DataType.INTEGER })
  amountAcknowledged: number;

  @Column({ type: DataType.STRING })
  amountAcknowledgedCurrency: string;

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

  @Column({ type: DataType.STRING })
  instructionsReceived: string;

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  paymentsToAcknowledge: string[] | null;

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  documents: BillsForCollectionDocumentUploadDto[] | null;
}
