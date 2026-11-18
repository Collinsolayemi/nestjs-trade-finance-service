import {
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  Index,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from 'src/common/base.model';
import {
  RegulatoryFormTypeEnum,
  StpExceptionResolveTypeEnum,
} from 'src/common/enums';
import { StpException } from './stp-exception.model';
import { uuidv7 } from 'uuidv7';

@DefaultScope(() => ({
  include: [{ model: StpException }],
}))
@Table({ modelName: 'stp_exception_resolve_request' })
export class StpExceptionRequest extends BaseModel<StpExceptionRequest> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  requestId: string;

  @Column({ type: DataType.STRING })
  generatedRequestId: string;

  @ForeignKey(() => StpException)
  @Column({ type: DataType.UUID })
  stpExceptionId: string;

  @Column({ type: DataType.ENUM(...Object.values(RegulatoryFormTypeEnum)) })
  regulatoryFormType: RegulatoryFormTypeEnum;

  @Column({
    type: DataType.ENUM(...Object.values(StpExceptionResolveTypeEnum)),
  })
  stpExceptionResolveType: StpExceptionResolveTypeEnum;

  @Column({ type: DataType.STRING })
  customerAccount: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  addTinToCustomerAccount: boolean;

  @BelongsTo(() => StpException)
  stpException: StpException;
}
