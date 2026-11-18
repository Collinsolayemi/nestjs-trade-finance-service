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
import { BillsForCollectionFreeFormaSwifttMessageTypeEnum } from 'src/common/enums';
import { BillsForCollectionRequest } from './bills-for-collection-request.model';
import { BillsForCollection } from './bills-for-collection.model';

@Table({ modelName: 'bills_for_collection_free_format_message' })
export class BillsForCollectionFreeFormatMessage extends Model<BillsForCollectionFreeFormatMessage> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  billsForCollectionFreeFormatMessageId: string;

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
  @Index({ name: 'bfc_free_format_message_bills_reference_number_index' })
  billsReferenceNumber: string;

  @BelongsTo(() => BillsForCollection, {
    foreignKey: 'billsReferenceNumber',
    targetKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  billsForCollection: BillsForCollection;

  @Column({ type: DataType.STRING })
  billsRelatedReferenceNumber: string;

  @Column({
    type: DataType.ENUM(
      ...Object.values(BillsForCollectionFreeFormaSwifttMessageTypeEnum),
    ),
  })
  swiftMessageType: BillsForCollectionFreeFormaSwifttMessageTypeEnum;

  @Column({ type: DataType.STRING })
  receiversBankBicCode: string;

  @Column({ type: DataType.STRING })
  receiversBankName: string;

  @Column({ type: DataType.STRING })
  receiversBankAddress: string;

  // each entry: max 1750 chars, 30 rows with max 50 chars per row
  @Column({ type: DataType.JSONB, defaultValue: [] })
  narrative: string[];
}
