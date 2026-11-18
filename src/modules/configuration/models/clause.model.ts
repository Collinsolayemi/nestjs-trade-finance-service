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
  Unique,
} from 'sequelize-typescript';
import { uuidv7 } from 'uuidv7';
import { ClauseRequest } from './clause-request.model';

@Table({ modelName: 'clause' })
export class Clause extends Model<Clause> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  clauseId: string;

  @Index
  @Unique
  @Column({ type: DataType.STRING })
  clauseCode: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  clauseField: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  clauseName: string;

  @AllowNull(false)
  @Column({ type: DataType.TEXT })
  clauseText: string;

  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isActive: boolean;

  @ForeignKey(() => ClauseRequest)
  @Column({ type: DataType.UUID, allowNull: true })
  @Index
  requestId: string;

  @BelongsTo(() => ClauseRequest)
  clauseRequest: ClauseRequest;
}
