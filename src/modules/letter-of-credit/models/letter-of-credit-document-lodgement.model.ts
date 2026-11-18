import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { LetterOfCreditRequest } from './letter-of-credit-request.model';
import { uuidv7 } from 'uuidv7';
import { LetterOfCredit } from './letter-of-credit.model';
import {
  ScanningAgentEnum,
  SetTypeEnum,
  SourceOfFundsEnum,
} from 'src/common/enums';
import { LetterOfCreditDocumentUploadDto } from '../dto/letter-of-credit-document-upload.dto';

@Table({ modelName: 'letter_of_credit_document_lodgement' })
export class LetterOfCreditDocumentLodgement extends Model<LetterOfCreditDocumentLodgement> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
  documentLodgementId: string;

  @ForeignKey(() => LetterOfCreditRequest)
  @AllowNull(false)
  @Column({ type: DataType.UUID })
  @Index
  requestId: string;

  @BelongsTo(() => LetterOfCreditRequest, { onDelete: 'CASCADE' })
  letterOfCreditRequest: LetterOfCreditRequest;

  @ForeignKey(() => LetterOfCredit)
  @AllowNull(false)
  @Column({ type: DataType.STRING })
  @Index
  lcReferenceNumber: string;

  @Column({ type: DataType.STRING })
  relatedReference: string;

  @Column({ type: DataType.INTEGER })
  lcAmount: number;

  @Column({ type: DataType.STRING })
  receivedFromBankName: string;

  @Column({ type: DataType.STRING })
  receivedFromBankBicCode: string;

  @Column({ type: DataType.STRING })
  receivedFromBankAddress: string;

  @Column({ type: DataType.STRING })
  documentAmount: string;

  @Column({ type: DataType.STRING })
  documentAmountCurrency: string;

  @Column({
    type: DataType.ENUM(...Object.values(SourceOfFundsEnum)),
  })
  sourceOfFunds: SourceOfFundsEnum;

  @Column({
    type: DataType.ENUM(...Object.values(SetTypeEnum)),
  })
  setType: SetTypeEnum;

  @Column({ type: DataType.INTEGER })
  numberOfCopies: number;

  @Column({ type: DataType.DATE })
  dateReceived: Date;

  @Column({ type: DataType.DATE })
  presentationDate: Date;

  @Column({ type: DataType.STRING })
  courierName: string;

  @Column({ type: DataType.STRING })
  courierNumber: string;

  @Column({
    type: DataType.ENUM(...Object.values(ScanningAgentEnum)),
  })
  scanningAgent: ScanningAgentEnum;

  @Column({ type: DataType.STRING })
  invoiceNumber: string;

  @Column({ type: DataType.DATE })
  invoiceDate: Date;

  @Column({ type: DataType.STRING })
  sectoralClassification: string;

  @Column({ type: DataType.STRING })
  productClassification: string;

  @Column({ type: DataType.STRING })
  description: string;

  @Column({ type: DataType.STRING })
  boeNumber: string;

  @Column({ type: DataType.DATE })
  boeIssueDate: Date;

  @Column({ type: DataType.DATE })
  tenorStartDate: Date;

  @Column({ type: DataType.DATE })
  tenorMaturityDate: Date;

  @Column({ type: DataType.STRING })
  paymentInstruction: string;

  @Column({ type: DataType.BOOLEAN })
  paar: boolean;

  @Column({ type: DataType.STRING })
  paarReferenceNumber: string;

  @Column({ type: DataType.DATE })
  paarDueDate: Date;

  @Column({ type: DataType.JSONB })
  documentAttachments: LetterOfCreditDocumentUploadDto[];
}
