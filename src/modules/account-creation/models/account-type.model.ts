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

@Table({ modelName: 'account_type' })
export class AccountType extends BaseModel<AccountType> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  accountTypeId: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  accountCode: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  accountTypeName: string;

  @AllowNull(false)
  @Column({ type: DataType.STRING })
  ledgerCategory: string;

  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  contingent: boolean;

  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  internal: boolean;

  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  status: boolean;
}
