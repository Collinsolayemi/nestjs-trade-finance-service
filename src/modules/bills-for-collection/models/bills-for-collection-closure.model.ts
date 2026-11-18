import {
  AllowNull,
  Column,
  ForeignKey,
  DataType,
  Index,
  Model,
  PrimaryKey,
  BelongsTo,
  Table,
} from 'sequelize-typescript';
import { uuidv7 } from 'uuidv7';
import { BillsForCollectionRequest } from './bills-for-collection-request.model';
import { BillsForCollection } from './bills-for-collection.model';

@Table({ modelName: 'bills_for_collection_closure' })
export class BillsForCollectionClosure extends Model<BillsForCollectionClosure> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  billsForCollectionClosureId: string;

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
  closureDate: Date;
}
