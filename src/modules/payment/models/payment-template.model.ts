import {
  Column,
  DataType,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { uuidv7 } from 'uuidv7';
import { PaymentActionTypeEnum } from '../enums/payment.enum';

@Table({ modelName: 'payment_template' })
export class PaymentTemplate extends Model<PaymentTemplate> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  paymentTemplateId: string;

  @Column({ type: DataType.STRING })
  @Index
  templateName: string;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentActionTypeEnum)),
  })
  paymentActionType: PaymentActionTypeEnum;

  @Column({ type: DataType.STRING })
  applicant: string;

  @Column({ type: DataType.UUID })
  createdById: string;

  @Column({ type: DataType.STRING })
  createdBy: string;

  @Column({ type: DataType.UUID })
  tenantId: string;

  @Column({ type: DataType.JSONB })
  templateData: object;
}
