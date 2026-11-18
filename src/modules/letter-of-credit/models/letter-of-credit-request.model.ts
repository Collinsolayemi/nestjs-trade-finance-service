import {
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  HasOne,
  Index,
  Length,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { BaseModel } from 'src/common/base.model';
import {
  LetterOfCreditActionTypeEnum,
  LetterOfCreditProductTypeEnum,
} from 'src/common/enums';
import { LetterOfCredit } from './letter-of-credit.model';
// import { LetterOfCreditNegotiation } from './letter-of-credit-negotiation.model';
import { uuidv7 } from 'uuidv7';
import { LetterOfCreditDocumentLodgement } from './letter-of-credit-document-lodgement.model';
import { LetterOfCreditAmendment } from './letter-of-credit-amendment.model';
import { LetterOfCreditAdjustment } from './letter-of-credit-adjustment.model';
import { LetterOfCreditCancellation } from './letter-of-credit-cancellation.model';
import { LetterOfCreditFreeFormatMessage } from './letter-of-credit-free-format-message.model';
import { LetterOfCreditPayment } from './letter-of-credit-payment.model';

@DefaultScope(() => ({
  include: [
    { model: LetterOfCredit, as: 'letterOfCredit' },
    { model: LetterOfCredit, as: 'issuedLetterOfCredit' },
    { model: LetterOfCreditDocumentLodgement },
    { model: LetterOfCreditAmendment },
    { model: LetterOfCreditAdjustment },
    { model: LetterOfCreditCancellation },
    { model: LetterOfCreditFreeFormatMessage },
    // { model: LetterOfCreditNegotiation },
  ],
}))
@Table({ modelName: 'letter_of_credit_request' })
export class LetterOfCreditRequest extends BaseModel<LetterOfCreditRequest> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  @Index
  requestId: string;

  @Column({
    type: DataType.ENUM(...Object.values(LetterOfCreditActionTypeEnum)),
    defaultValue: LetterOfCreditActionTypeEnum.ISSUANCE,
  })
  letterOfCreditActionType: LetterOfCreditActionTypeEnum;

  @Column({
    type: DataType.ENUM(...Object.values(LetterOfCreditProductTypeEnum)),
    defaultValue: LetterOfCreditProductTypeEnum.IMPORT,
  })
  letterOfCreditProductType: LetterOfCreditProductTypeEnum;

  @Column(DataType.STRING)
  applicationNumber?: string;

  // @HasOne(() => LetterOfCreditPreIssuance, {
  //   foreignKey: 'requestId',
  //   onDelete: 'CASCADE',
  // })
  // preIssuance?: LetterOfCreditPreIssuance;

  @HasOne(() => LetterOfCredit, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  letterOfCredit?: LetterOfCredit;

  @ForeignKey(() => LetterOfCredit)
  @Length({
    msg: `LC reference number character length can not be longer than 16`,
    max: 16,
  })
  @Column({ type: DataType.STRING })
  @Index
  lcReferenceNumber?: string;

  @BelongsTo(() => LetterOfCredit, {
    foreignKey: 'lcReferenceNumber',
    targetKey: 'referenceNumber',
    as: 'issuedLetterOfCredit',
    onDelete: 'CASCADE',
  })
  issuedLetterOfCredit?: LetterOfCredit;

  @HasOne(() => LetterOfCreditAmendment, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  amendment?: LetterOfCreditAmendment;

  @HasOne(() => LetterOfCreditAdjustment, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  adjustment?: LetterOfCreditAdjustment;

  @HasOne(() => LetterOfCreditCancellation, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  cancellation?: LetterOfCreditCancellation;

  @HasOne(() => LetterOfCreditPayment, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  payment?: LetterOfCreditPayment;

  @HasOne(() => LetterOfCreditFreeFormatMessage, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  freeFormatMessage?: LetterOfCreditFreeFormatMessage;

  @HasOne(() => LetterOfCreditDocumentLodgement, {
    foreignKey: 'requestId',
    onDelete: 'CASCADE',
  })
  documentLodgement?: LetterOfCreditDocumentLodgement;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isDraft: boolean;

  // @HasOne(() => LetterOfCreditNegotiation, {
  //   foreignKey: 'requestId',
  //   onDelete: 'CASCADE',
  // })
  // negotiation?: LetterOfCreditNegotiation;

  @Column({ type: DataType.JSONB })
  metadata: object;
}
