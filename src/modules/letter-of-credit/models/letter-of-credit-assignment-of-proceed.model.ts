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
import { uuidv7 } from 'uuidv7';
import { AssignmentOfProceedItemDto } from '../dto/add-letter-of-credit-assignment-of-proceed.dto';

@Table({ modelName: 'letter_of_credit_assignment_of_proceed' })
export class LetterOfCreditAssignmentOfProceed extends Model<LetterOfCreditAssignmentOfProceed> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  requestId: string;

  @ForeignKey(() => LetterOfCredit)
  @AllowNull(false)
  @Length({
    msg: 'LC Reference Number character length can not be longer than 16',
    max: 16,
  })
  @Column({ type: DataType.STRING, allowNull: false })
  @Index
  lcReferenceNumber: string;

  @BelongsTo(() => LetterOfCredit, {
    foreignKey: 'lcReferenceNumber',
    targetKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  letterOfCredit: LetterOfCredit;

  @Column({
    type: DataType.JSONB,
    defaultValue: [],
    get(this: LetterOfCreditAssignmentOfProceed): AssignmentOfProceedItemDto[] {
      return this.getDataValue('assignments') || [];
    },
  })
  assignments: AssignmentOfProceedItemDto[];
}
