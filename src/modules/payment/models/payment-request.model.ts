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
import {
  PaymentActionTypeEnum,
  PaymentProductTypeEnum,
} from '../enums/payment.enum';
import { InwardBankPayment } from './inward-bank-payment.model';
import { InwardCustomerPayment } from './inward-customer-payment.model';

@DefaultScope(() => ({
  include: [{ model: InwardBankPayment }, { model: InwardCustomerPayment }],
}))
@Table({ modelName: 'payment_request' })
export class PaymentRequest extends BaseModel<PaymentRequest> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  requestId: string;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentActionTypeEnum)),
    defaultValue: PaymentActionTypeEnum.INWARD_BANK_PAYMENT,
  })
  paymentActionType: PaymentActionTypeEnum;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentProductTypeEnum)),
    defaultValue: PaymentProductTypeEnum.INWARD,
  })
  paymentProductType: PaymentProductTypeEnum;

  @Column({ type: DataType.STRING })
  applicationNumber?: string;

  @Column({ type: DataType.STRING })
  @Index
  paymentReferenceNumber?: string;

  @HasOne(() => InwardBankPayment, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  inwardBankPayment?: InwardBankPayment;

  @HasOne(() => InwardCustomerPayment, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  inwardCustomerPayment?: InwardCustomerPayment;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isDraft: boolean;

  @Column({ type: DataType.JSONB })
  metadata: object;
}
