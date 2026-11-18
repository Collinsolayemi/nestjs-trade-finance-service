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
import { LetterOfCreditDocumentUploadDto } from '../dto/letter-of-credit-document-upload.dto';

@Table({ modelName: 'letter_of_credit_cancellation' })
export class LetterOfCreditCancellation extends Model<LetterOfCreditCancellation> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  letterOfCreditCancellationId: string;

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

  @Length({
    msg: 'Related Reference Number character length can not be longer than 16',
    max: 16,
  })
  @Column({ type: DataType.STRING })
  relatedReference: string;

  @BelongsTo(() => LetterOfCredit, {
    foreignKey: 'lcReferenceNumber',
    targetKey: 'referenceNumber',
    onDelete: 'CASCADE',
  })
  letterOfCredit: LetterOfCredit;

  @Column({ type: DataType.FLOAT })
  lcAmount: number;

  @Column({ type: DataType.STRING })
  lcCurrencyCode: string;

  @Column({ type: DataType.DATE })
  cancellationDate: Date;

  @Length({
    msg: 'Instructions from Applicant character length can not be longer than 780. 12 rows with each row having a max of 65 characters',
    max: 780,
  })
  @Column({ type: DataType.TEXT })
  instructionsFromApplicant: string;

  @Length({
    msg: 'Instructions to Advising Bank character length can not be longer than 780. 12 rows with each row having a max of 65 characters',
    max: 780,
  })
  @Column({ type: DataType.TEXT })
  instructionsToAdvisingBank: string;

  @Length({
    msg: 'Instructions to Reimbursing Bank character length can not be longer than 780. 12 rows with each row having a max of 65 characters',
    max: 780,
  })
  @Column({ type: DataType.TEXT })
  instructionsToReimbursingBank: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  seekBeneficiarysApproval: boolean;

  @Column({ type: DataType.JSONB })
  documentAttachments: LetterOfCreditDocumentUploadDto[];
}
