import {
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  HasMany,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { StpExceptionRequest } from './stp-exception-request.model';
import { RegulatoryFormTypeEnum, StpExceptionTypeEnum } from 'src/common/enums';
import { uuidv7 } from 'uuidv7';
import { FormM } from './form-m.model';
import { FormNXP } from './form-nxp.model';
import { FormNCX } from './form-ncx.model';

@DefaultScope(() => ({
  include: [{ model: FormM }, { model: FormNXP }, { model: FormNCX }],
}))
@Table({ modelName: 'stp_exception' })
export class StpException extends Model<StpException> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  stpExceptionId: string;

  @Column({ type: DataType.STRING })
  applicationNumber: string;

  @Column({ type: DataType.ENUM(...Object.values(StpExceptionTypeEnum)) })
  stpExceptionType: StpExceptionTypeEnum;

  @Column({ type: DataType.STRING })
  stpExceptionReason: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isStpExceptionResolved: boolean;

  @HasMany(() => StpExceptionRequest)
  stpExceptionResolveRequest: StpExceptionRequest[];

  @Column({ type: DataType.ENUM(...Object.values(RegulatoryFormTypeEnum)) })
  regulatoryFormType: RegulatoryFormTypeEnum;

  @BelongsTo(() => FormM, {
    foreignKey: 'applicationNumber',
    targetKey: 'applicationNumber',
    constraints: false,
  })
  formM: FormM;

  @BelongsTo(() => FormNXP, {
    foreignKey: 'applicationNumber',
    targetKey: 'applicationNumber',
    constraints: false,
  })
  formNXP: FormNXP;

  @BelongsTo(() => FormNCX, {
    foreignKey: 'applicationNumber',
    targetKey: 'applicationNumber',
    constraints: false,
  })
  formNCX: FormNCX;
}
