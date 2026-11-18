import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Length,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { LetterOfCredit } from './letter-of-credit.model';
import { LetterOfCreditRequest } from './letter-of-credit-request.model';
import { uuidv7 } from 'uuidv7';
import { LetterOfCreditFreeFormaSwifttMessageTypeEnum } from 'src/common/enums';

@Table({ modelName: 'letter_of_credit_free_format_message' })
export class LetterOfCreditFreeFormatMessage extends Model<LetterOfCreditFreeFormatMessage> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  letterOfCreditFreeFormatMessageId: string;

  @ForeignKey(() => LetterOfCreditRequest)
  @AllowNull(false)
  @Column({ type: DataType.UUID })
  @Index
  requestId: string;

  @BelongsTo(() => LetterOfCreditRequest, { onDelete: 'CASCADE' })
  letterOfCreditRequest: LetterOfCreditRequest;

  @ForeignKey(() => LetterOfCredit)
  @AllowNull(false)
  @Length({
    msg: 'LC Reference Number character length can not be longer than 16',
    max: 16,
  })
  @Column({ type: DataType.STRING })
  @Index
  lcReferenceNumber: string;

  @BelongsTo(() => LetterOfCredit, {
    foreignKey: 'lcReferenceNumber',
    targetKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  letterOfCredit: LetterOfCredit;

  @Column({ type: DataType.STRING })
  lcRelatedReferenceNumber: string;

  @Column({
    type: DataType.ENUM(
      ...Object.values(LetterOfCreditFreeFormaSwifttMessageTypeEnum),
    ),
  })
  swiftMessageType: LetterOfCreditFreeFormaSwifttMessageTypeEnum;

  @Column({ type: DataType.STRING })
  receiversBankBicCode: string;

  @Column({ type: DataType.STRING })
  receiversBankName: string;

  @Column({ type: DataType.STRING })
  receiversBankAddress: string;

  // each entry: max 1750 chars, 30 rows with max 50 chars per row
  @Column({ type: DataType.JSONB, defaultValue: [] })
  narrative: string[];
}
