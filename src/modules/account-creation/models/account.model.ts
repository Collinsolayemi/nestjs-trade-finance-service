import {
  AllowNull,
  Column,
  DataType,
  Index,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from 'src/common/base.model';
import { uuidv7 } from 'uuidv7';

@Table({ modelName: 'account' })
export class Account extends BaseModel<Account> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  accountId: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  accountType: string;

  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  preferredDebit: boolean;

  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  preferredCredit: boolean;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  accountCustomer: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  currency: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  accountNumber: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  ibanNumber: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  externalAccount: string;

  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  status: boolean;
}
