import {
  Index,
  BelongsTo,
  DataType,
  Model,
  Column,
  AllowNull,
  ForeignKey,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Guarantees } from './guarantees.model';
import { GuaranteesRequest } from './guarantees-request.model';
import { GuaranteesFreeFormatSwiftMessageTypeEnum } from 'src/common/enums';
import { uuidv7 } from 'uuidv7';

@Table({ modelName: 'guarantees_free_format' })
export class GuaranteesFreeFormat extends Model<GuaranteesFreeFormat> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  guaranteesFreeFormatId: string;

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

  @Column({
    type: DataType.ENUM(
      ...Object.values(GuaranteesFreeFormatSwiftMessageTypeEnum),
    ),
  })
  messageType: GuaranteesFreeFormatSwiftMessageTypeEnum;

  @Column({ type: DataType.STRING })
  relatedReference: string;

  @Column({ type: DataType.STRING })
  receiversBankBicCode: string;

  @Column({ type: DataType.STRING })
  receiversBankName: string;

  @Column({ type: DataType.STRING })
  receiversBankAddress: string;

  @Column({ type: DataType.TEXT })
  narration: string;
}
