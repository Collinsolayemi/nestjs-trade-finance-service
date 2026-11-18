import {
  Column,
  DataType,
  Index,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from 'src/common/base.model';
import { uuidv7 } from 'uuidv7';

@Table({ modelName: 'credit_line' })
export class CreditLine extends BaseModel<CreditLine> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  creditLineId: string;

  @Column(DataType.STRING)
  creditLineName: string;

  @Column(DataType.STRING)
  creditLineReferenceCode: string;

  @Column(DataType.STRING)
  currencyCode: string;

  @Column(DataType.STRING)
  counterparty: string;

  @Column(DataType.DECIMAL)
  confirmationLineAmount: number;

  @Column(DataType.DECIMAL)
  costOfFundRate: number;

  @Column(DataType.DECIMAL)
  marginRate: number;

  @Column(DataType.DECIMAL)
  totalInterestRate: number;

  @Column(DataType.BOOLEAN)
  isActive: boolean;

  @Column(DataType.STRING)
  status: string;
}
