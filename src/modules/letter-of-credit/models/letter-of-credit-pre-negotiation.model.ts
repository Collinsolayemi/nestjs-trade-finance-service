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
// import { uuidv7 } from 'uuidv7';

// @Table({ modelName: 'letter_of_credit_pre_negotiation' })
// export class LetterOfCreditPreNegotiation extends Model<LetterOfCreditPreNegotiation> {
//   @PrimaryKey
//   @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
//   preNegotiationId: string;

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

//   @Column({ type: DataType.FLOAT })
//   preNegotiationAmount: number;

//   @Column({ type: DataType.STRING })
//   preNegotiationCurrencyCode: string;

//   @Column({ type: DataType.STRING })
//   confirmationBankName: string;

//   @Column({ type: DataType.STRING })
//   creditLine: string;

//   @Column({ type: DataType.FLOAT })
//   costOfFundsRate: number;

//   @Column({ type: DataType.FLOAT })
//   marginRate: number;

//   @Column({ type: DataType.FLOAT })
//   totalInterestRate: number;

//   @Column({ type: DataType.DATE })
//   startDate: Date;

//   @Column({ type: DataType.DATE })
//   maturityDate: Date;
// }
