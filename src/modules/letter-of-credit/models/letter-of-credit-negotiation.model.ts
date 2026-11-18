// import {
//   AllowNull,
//   BelongsTo,
//   Column,
//   DataType,
//   ForeignKey,
//   Index,
//   Length,
//   Model,
//   PrimaryKey,
//   Table,
// } from 'sequelize-typescript';
// import { LetterOfCredit } from './letter-of-credit.model';
// import { LetterOfCreditRequest } from './letter-of-credit-request.model';
// import {
//   NegotiationSourceOfFundsEnum,
//   ProductClassificationEnum,
//   ScanningAgentEnum,
//   SectoralClassificationEnum,
//   SetTypeEnum,
// } from 'src/common/enums';
// import { uuidv7 } from 'uuidv7';

// @Table({ modelName: 'letter_of_credit_negotiation' })
// export class LetterOfCreditNegotiation extends Model<LetterOfCreditNegotiation> {
//   @PrimaryKey
//   @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
//   negotiationId: string;

//   @ForeignKey(() => LetterOfCreditRequest)
//   @AllowNull(false)
//   @Column({ type: DataType.UUID })
//   @Index
//   requestId: string;

//   @BelongsTo(() => LetterOfCreditRequest, { onDelete: 'CASCADE' })
//   letterOfCreditRequest: LetterOfCreditRequest;

//   @ForeignKey(() => LetterOfCredit)
//   @AllowNull(false)
//   @Length({
//     msg: 'LC Reference Number character length can not be longer than 16',
//     max: 16,
//   })
//   @Column({ type: DataType.STRING })
//   @Index
//   lcReferenceNumber: string;

//   @BelongsTo(() => LetterOfCredit, {
//     foreignKey: 'lcReferenceNumber',
//     targetKey: 'referenceNumber',
//     onDelete: 'CASCADE',
//   })
//   letterOfCredit: LetterOfCredit;

//   @Column({ type: DataType.STRING })
//   lcRelatedReferenceNumber: string;

//   @Column({ type: DataType.STRING })
//   applicantName: string;

//   @Column({ type: DataType.FLOAT })
//   lcAmount: number;

//   @Column({ type: DataType.STRING })
//   lcCurrencyCode: string;

//   @Column({ type: DataType.STRING })
//   receivedFromBankBicCode: string;

//   @Column({ type: DataType.STRING })
//   advisingBankName: string;

//   @Column({ type: DataType.STRING })
//   advisingBankAddress: string;

//   @Column({ type: DataType.STRING })
//   documentAmount: string;

//   @Column({
//     type: DataType.ENUM(...Object.values(NegotiationSourceOfFundsEnum)),
//   })
//   sourceOfFunds: NegotiationSourceOfFundsEnum;

//   @Column({ type: DataType.STRING })
//   shipmentType: string;

//   @Column({ type: DataType.ENUM(...Object.values(SetTypeEnum)) })
//   setType: SetTypeEnum;

//   @Column({ type: DataType.DATE })
//   receivedDate: Date;

//   @Column({ type: DataType.DATE })
//   presentationDate: Date;

//   @Column({ type: DataType.STRING })
//   numberOfCopies: string;

//   @Column({ type: DataType.STRING })
//   courierName: string;

//   @Length({
//     msg: 'Courier Number character length can not be longer than 35',
//     max: 39,
//   })
//   @Column({ type: DataType.STRING })
//   courierNumber: string;

//   @Column({ type: DataType.ENUM(...Object.values(ScanningAgentEnum)) })
//   scanningAgent: ScanningAgentEnum;

//   @Length({
//     msg: 'Invoice Number character length can not be longer than 35',
//     max: 39,
//   })
//   @Column({ type: DataType.STRING })
//   invoiceNumber: string;

//   @Column({ type: DataType.DATE })
//   invoiceDate: Date;

//   @Column({ type: DataType.ENUM(...Object.values(SectoralClassificationEnum)) })
//   sectoralClassification: SectoralClassificationEnum;

//   @Column({ type: DataType.ENUM(...Object.values(ProductClassificationEnum)) })
//   productClassification: ProductClassificationEnum;

//   @Column({ type: DataType.STRING })
//   boeNumber: string;

//   @Column({ type: DataType.DATE })
//   boeIssueDate: Date;

//   @Column({ type: DataType.DATE })
//   tenorStartDate: Date;

//   @Column({ type: DataType.DATE })
//   tenorMaturityDate: Date;

//   @Column({ type: DataType.STRING })
//   description: string;

//   @Column({ type: DataType.STRING })
//   paymentInstruction: string;

//   @Column({ type: DataType.JSONB })
//   documentAttachments: object;
// }
