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

// @Table({ modelName: 'letter_of_credit_settlement_details' })
// export class LetterOfCreditSettlementDetails extends Model<LetterOfCreditSettlementDetails> {
//   @PrimaryKey
//   @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
//   settlementDetailsId: string;

//   @ForeignKey(() => LetterOfCredit)
//   @AllowNull(false)
//   @Length({
//     msg: 'LC Reference Number character length can not be longer than 16',
//     max: 16,
//   })
//   @Column({ type: DataType.STRING, allowNull: false })
//   @Index
//   lcReferenceNumber: string;

//   @BelongsTo(() => LetterOfCredit, {
//     foreignKey: 'lcReferenceNumber',
//     targetKey: 'referenceNumber',
//     onDelete: 'CASCADE',
//   })
//   letterOfCredit: LetterOfCredit;

//   @Column({ type: DataType.STRING })
//   receiverBicCode: string;

//   @Column({ type: DataType.STRING })
//   receiverBankName: string;

//   @Column({ type: DataType.STRING })
//   receiverAddress: string;

//   @Column({ type: DataType.STRING })
//   receiverCorrespondentBicCode: string;

//   @Column({ type: DataType.STRING })
//   receiverCorrespondentBankName: string;

//   @Column({ type: DataType.STRING })
//   receiverCorrespondentAddress: string;

//   @Column({ type: DataType.FLOAT })
//   receiverCorrespondentAmount: number;

//   @Column({ type: DataType.STRING })
//   orderingInstitutionBicCode: string;

//   @Column({ type: DataType.STRING })
//   orderingInstitutionBankName: string;

//   @Column({ type: DataType.STRING })
//   orderingInstitutionAddress: string;

//   @Column({ type: DataType.STRING })
//   intermediaryBicCode: string;

//   @Column({ type: DataType.STRING })
//   intermediaryBankName: string;

//   @Column({ type: DataType.STRING })
//   intermediaryAddress: string;

//   @Column({ type: DataType.FLOAT })
//   intermediaryAmount: number;

//   @Column({ type: DataType.STRING })
//   senderCorrespondentBicCode: string;

//   @Column({ type: DataType.STRING })
//   senderCorrespondentBankName: string;

//   @Column({ type: DataType.STRING })
//   senderCorrespondentAddress: string;

//   @Column({ type: DataType.FLOAT })
//   senderCorrespondentAmount: number;

//   @Column({ type: DataType.STRING })
//   accountWithInstitutionBicCode: string;

//   @Column({ type: DataType.STRING })
//   accountWithInstitutionBankName: string;

//   @Column({ type: DataType.STRING })
//   accountWithInstitutionAddress: string;

//   @Column({ type: DataType.FLOAT })
//   accountWithInstitutionAmount: number;

//   @Column({ type: DataType.STRING })
//   beneficiaryInstitutionBicCode: string;

//   @Column({ type: DataType.STRING })
//   beneficiaryInstitutionAddress: string;

//   @Column({ type: DataType.STRING })
//   senderToReceiverInformation: string;

//   @Column({ type: DataType.FLOAT })
//   beneficiaryAmount: number;
// }
