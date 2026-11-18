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
import {
  BillsForCollectionAdviseByEnum,
  BillsForCollectionNonAcceptanceOrNonPaymentActionEventTypeEnum,
} from 'src/common/enums';
import { BillsForCollectionDocumentUploadDto } from '../dto/bills-for-collection-document-upload.dto';
import { BillsForCollection } from './bills-for-collection.model';

@Table({ modelName: 'bills_for_collection_non_acceptance_or_non_payment' })
export class BillsForCollectionNonAcceptanceOrNonPayment extends Model<BillsForCollectionNonAcceptanceOrNonPayment> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  billsForCollectionNonAcceptanceOrNonPaymentId: string;

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
  @Index({ name: 'bfc_non_acceptance_or_non_payment_bills_ref_no_idx' })
  billsReferenceNumber: string;

  @BelongsTo(() => BillsForCollection, {
    foreignKey: 'billsReferenceNumber',
    targetKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  billsForCollection: BillsForCollection;

  @Column({
    type: DataType.ENUM(
      ...Object.values(
        BillsForCollectionNonAcceptanceOrNonPaymentActionEventTypeEnum,
      ),
    ),
  })
  actionEventType: BillsForCollectionNonAcceptanceOrNonPaymentActionEventTypeEnum;

  @Column({ type: DataType.DATE })
  adviseDate: Date;

  @Column({ type: DataType.STRING })
  reasonOrNarrative: string;

  @Column({
    type: DataType.ENUM(...Object.values(BillsForCollectionAdviseByEnum)),
  })
  adviseBy: BillsForCollectionAdviseByEnum;

  @Column({ type: DataType.STRING })
  addresseeRemittingBankBicCode: string;

  @Column({ type: DataType.STRING })
  addresseeRemittingBankName: string;

  @Column({ type: DataType.STRING })
  addresseeRemittingBankAddress: string;

  @Column({ type: DataType.BOOLEAN })
  protestInstructions: boolean;

  @Column({ type: DataType.STRING })
  instructionsFromSender: string;

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  draftsToRefuse: string[] | null;

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: [] })
  documents: BillsForCollectionDocumentUploadDto[] | null;
}
