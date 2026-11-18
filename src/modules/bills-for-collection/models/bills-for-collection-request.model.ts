import {
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  HasOne,
  Index,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import {
  BillsForCollectionActionTypeEnum,
  BillsForCollectionProductTypeEnum,
} from 'src/common/enums';
import { uuidv7 } from 'uuidv7';
import { BillsForCollection } from './bills-for-collection.model';
import { BillsForCollectionAmendment } from './bills-for-collection-amendment.model';
import { BillsForCollectionAdjustment } from './bills-for-collection-adjustment.model';
import { BillsForCollectionNonAcceptanceOrNonPayment } from './bills-for-collection-non-acceptance-or-non-payment.model';
import { BillsForCollectionPayment } from './bills-for-collection-payment.model';
import { BillsForCollectionReceiveAcknowledgement } from './bills-for-collection-receive-akcnowledgement.model';
import { BillsForCollectionAcceptance } from './bills-for-collection-acceptance.model';
import { BaseModel } from 'src/common/base.model';
import { BillsForCollectionFreeFormatMessage } from './bills-for-collection-free-format-message.model';

@DefaultScope(() => ({
  include: [
    { model: BillsForCollection, as: 'billsForCollection' },
    { model: BillsForCollection, as: 'bookedBillsForCollection' },
    { model: BillsForCollectionAmendment },
    { model: BillsForCollectionAdjustment },
    { model: BillsForCollectionNonAcceptanceOrNonPayment },
    { model: BillsForCollectionPayment },
    { model: BillsForCollectionReceiveAcknowledgement },
    { model: BillsForCollectionAcceptance },
    { model: BillsForCollectionFreeFormatMessage },
  ],
}))
@Table({ modelName: 'bills_for_collection_request' })
export class BillsForCollectionRequest extends BaseModel<BillsForCollectionRequest> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  requestId: string;

  @Column({
    type: DataType.ENUM(...Object.values(BillsForCollectionActionTypeEnum)),
  })
  billsForCollectionActionType: BillsForCollectionActionTypeEnum;

  @Column({
    type: DataType.ENUM(...Object.values(BillsForCollectionProductTypeEnum)),
  })
  billsForCollectionProductType: BillsForCollectionProductTypeEnum;

  @Column({ type: DataType.STRING })
  applicationNumber?: string;

  @HasOne(() => BillsForCollection, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  billsForCollection?: BillsForCollection;

  @ForeignKey(() => BillsForCollection)
  @Column({ type: DataType.STRING })
  @Index
  billsReferenceNumber: string;

  @BelongsTo(() => BillsForCollection, {
    foreignKey: 'billsReferenceNumber',
    targetKey: 'referenceNumber',
    as: 'bookedBillsForCollection',
    onDelete: 'CASCADE',
  })
  bookedBillsForCollection?: BillsForCollection;

  @HasOne(() => BillsForCollectionAmendment, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  amendment?: BillsForCollectionAmendment;

  @HasOne(() => BillsForCollectionAdjustment, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  adjustment?: BillsForCollectionAdjustment;

  @HasOne(() => BillsForCollectionNonAcceptanceOrNonPayment, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  nonAcceptanceOrNonPayment?: BillsForCollectionNonAcceptanceOrNonPayment;

  @HasOne(() => BillsForCollectionPayment, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  payment?: BillsForCollectionPayment;

  @HasOne(() => BillsForCollectionReceiveAcknowledgement, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  receiveAcknowledgement?: BillsForCollectionReceiveAcknowledgement;

  @HasOne(() => BillsForCollectionAcceptance, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  acceptance?: BillsForCollectionAcceptance;

  @HasOne(() => BillsForCollectionFreeFormatMessage, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  freeFormat?: BillsForCollectionFreeFormatMessage;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isDraft: boolean;

  @Column({ type: DataType.JSONB })
  metadata: object;
}
