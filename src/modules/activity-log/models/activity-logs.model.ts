import {
  Table,
  Column,
  DataType,
  Index,
  PrimaryKey,
  Model,
} from 'sequelize-typescript';
import { uuidv7 } from 'uuidv7';

@Table({ modelName: 'trade_activity_logs' })
export class TradeActivityLog extends Model<TradeActivityLog> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  activityLogId: string;

  @Column({ type: DataType.UUID })
  requestId: string;

  @Column({ type: DataType.STRING })
  description: string;
}
