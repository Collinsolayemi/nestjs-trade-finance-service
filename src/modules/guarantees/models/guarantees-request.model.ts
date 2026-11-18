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
  GuaranteesActionTypeEnum,
  GuaranteesProductTypeEnum,
} from 'src/common/enums';
import { uuidv7 } from 'uuidv7';
import { Guarantees } from './guarantees.model';
import { GuaranteesAmendment } from './guarantess-amendment.model';
import { GuaranteesAdjustment } from './guarantees-adjustment.model';
import { GuaranteesReceiveAcknowledgement } from './guarantees-receive-acknowledgement.model';
import { GuaranteesReceiveClaim } from './guarantees-receive-claim.model';
import { GuaranteesDocumentsPresented } from './guarantees-documents-presented.model';
import { GuaranteesCancellation } from './gurantees-cancellation.model';
import { GuaranteesFreeFormat } from './guarantees-free-format.model';
import { BaseModel } from 'src/common/base.model';

@DefaultScope(() => ({
  include: [
    { model: Guarantees, as: 'guarantees' },
    { model: Guarantees, as: 'bookedGuarantees' },
    { model: GuaranteesAmendment },
    { model: GuaranteesAdjustment },
    { model: GuaranteesReceiveAcknowledgement },
    { model: GuaranteesReceiveClaim },
    { model: GuaranteesDocumentsPresented },
    { model: GuaranteesCancellation },
    { model: GuaranteesFreeFormat },
  ],
}))
@Table({ modelName: 'guarantees_request' })
export class GuaranteesRequest extends BaseModel<GuaranteesRequest> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  requestId: string;

  @Column({
    type: DataType.ENUM(...Object.values(GuaranteesActionTypeEnum)),
  })
  guaranteesActionType: GuaranteesActionTypeEnum;

  @Column({
    type: DataType.ENUM(...Object.values(GuaranteesProductTypeEnum)),
  })
  guaranteesProductType: GuaranteesProductTypeEnum;

  @Column({ type: DataType.STRING })
  applicationNumber?: string;

  @HasOne(() => Guarantees, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  guarantees?: Guarantees;

  @ForeignKey(() => Guarantees)
  @Column({ type: DataType.STRING })
  @Index
  guaranteesReferenceNumber: string;

  @BelongsTo(() => Guarantees, {
    foreignKey: 'guaranteesReferenceNumber',
    targetKey: 'referenceNumber',
    as: 'bookedGuarantees',
    onDelete: 'CASCADE',
  })
  bookedGuarantees?: Guarantees;

  @HasOne(() => GuaranteesAmendment, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  amendment?: GuaranteesAmendment;

  @HasOne(() => GuaranteesAdjustment, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  adjustment?: GuaranteesAdjustment;

  @HasOne(() => GuaranteesReceiveAcknowledgement, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  receiveAcknowledgement?: GuaranteesReceiveAcknowledgement;

  @HasOne(() => GuaranteesReceiveClaim, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  receiveClaim?: GuaranteesReceiveClaim;

  @HasOne(() => GuaranteesDocumentsPresented, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  documentsPresented?: GuaranteesDocumentsPresented;

  @HasOne(() => GuaranteesCancellation, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  cancellation?: GuaranteesCancellation;

  @HasOne(() => GuaranteesFreeFormat, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  freeFormat?: GuaranteesFreeFormat;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isDraft: boolean;

  @Column({ type: DataType.JSONB })
  metadata: object;
}
