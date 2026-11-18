import {
  AllowNull,
  Column,
  DataType,
  Index,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { BaseModel } from 'src/common/base.model';
import {
  TradeJournalPostingReversalStatusEnum,
  TradeJournalPostingTypeEnum,
} from 'src/common/enums';
import { uuidv7 } from 'uuidv7';

@Table({ modelName: 'trade_api_journal_posting' })
export class TradeJournalPosting extends BaseModel<TradeJournalPosting> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  tradeJournalPostingId: string;

  @AllowNull(false)
  @Unique
  @Column({ type: DataType.STRING })
  @Index
  referenceId: string;

  @Column({ type: DataType.JSONB })
  debitAccountDetails: object;

  @Column({ type: DataType.JSONB })
  creditAccountDetails: object;

  @Column({ type: DataType.STRING })
  debitAccountNo: string;

  @Column({ type: DataType.STRING })
  debitAccountName: string;

  @Column({ type: DataType.STRING })
  creditAccountNo: string;

  @Column({ type: DataType.STRING })
  creditAccountName: string;

  @Column({ type: DataType.FLOAT })
  postingAmount: number;

  @Column({ type: DataType.STRING })
  debitCurrencyCode: string;

  @Column({ type: DataType.BOOLEAN })
  isSameCurrency: boolean;

  @Column({ type: DataType.FLOAT })
  exchangeRate: number;

  @Column({ type: DataType.FLOAT })
  computationRate: number;

  @Column({ type: DataType.FLOAT })
  incrementAmount: number;

  @Column({ type: DataType.FLOAT })
  creditAmount: number;

  @Column({ type: DataType.STRING })
  creditCurrencyCode: string;

  @Column({ type: DataType.STRING })
  postingNarration: string;

  @Column({ type: DataType.STRING })
  supportingDocumentUrl: string;

  @Column({ type: DataType.DATE })
  postingDate: Date;

  @Column({ type: DataType.STRING })
  valueDate: Date;

  @Column({ type: DataType.UUID })
  transactionId: string;

  @Column({
    type: DataType.ENUM(...Object.values(TradeJournalPostingTypeEnum)),
  })
  transactionType: TradeJournalPostingTypeEnum;

  @Column({
    type: DataType.ENUM(
      ...Object.values(TradeJournalPostingReversalStatusEnum),
    ),
    defaultValue: TradeJournalPostingReversalStatusEnum.NONE,
  })
  postingReversalStatus: string;

  @Column({ type: DataType.BOOLEAN })
  isReversalPosting: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  canBeCharged: boolean;

  @Column({ type: DataType.STRING })
  daoCode: string;

  @Column({ type: DataType.STRING })
  daoName: string;

  @Column({ type: DataType.STRING })
  department: string;

  @Column({ type: DataType.STRING })
  departmentCode: string;

  @Column({ type: DataType.UUID })
  chargeId: string;

  @Column({ type: DataType.UUID })
  taxId: string;

  @Column({ type: DataType.BOOLEAN })
  isRerouted: boolean;
}
