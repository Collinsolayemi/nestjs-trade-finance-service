import {
  Column,
  DataType,
  DefaultScope,
  HasOne,
  Index,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from 'src/common/base.model';
import { uuidv7 } from 'uuidv7';
import { Clause } from './clause.model';
import { ClauseRequestTypeEnum } from 'src/common/enums';

@DefaultScope(() => ({
  include: [{ model: Clause }],
}))
@Table({ modelName: 'clause_request' })
export class ClauseRequest extends BaseModel<ClauseRequest> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  requestId: string;

  @Index
  @Column({ type: DataType.STRING })
  clauseCode: string;

  @Column({ type: DataType.STRING })
  clauseField: string;

  @Column({ type: DataType.STRING })
  clauseName: string;

  @Column({ type: DataType.TEXT })
  clauseText: string;

  @Column({
    type: DataType.ENUM(...Object.values(ClauseRequestTypeEnum)),
    defaultValue: ClauseRequestTypeEnum.CREATION,
  })
  requestType: ClauseRequestTypeEnum;

  @HasOne(() => Clause, { onDelete: 'CASCADE' })
  clause: Clause;
}
