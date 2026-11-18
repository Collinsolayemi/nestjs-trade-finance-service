import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  Index,
  Length,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { LetterOfCredit } from './letter-of-credit.model';
import { uuidv7 } from 'uuidv7';

@DefaultScope(() => ({
  include: [{ model: LetterOfCredit }],
}))
@Table({ modelName: 'letter_of_credit_template' })
export class LetterOfCreditTemplate extends Model<LetterOfCreditTemplate> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  templateId: string;

  @Unique
  @Column({ type: DataType.TEXT })
  templateName: string;

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
}
