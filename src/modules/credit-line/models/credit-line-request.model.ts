import {
  Column,
  DataType,
  Index,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from 'src/common/base.model';
import { uuidv7 } from 'uuidv7';

@Table({ modelName: 'credit_line_request' })
export class CreditLineRequest extends BaseModel<CreditLineRequest> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  requestId: string;

  @Column(DataType.STRING)
  requestName: string;

  @Column(DataType.STRING)
  requestType: string;

  @Column(DataType.UUID)
  creditLineId: string;

  @Column(DataType.STRING)
  creditLineName: string;

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

  @Column(DataType.STRING)
  supportingDocumentUrl: string;

  @Column(DataType.STRING)
  reasonForDeactivation: string;
}
