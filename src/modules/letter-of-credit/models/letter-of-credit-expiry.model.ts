// import {
//   AllowNull,
//   BelongsTo,
//   Column,
//   DataType,
//   ForeignKey,
//   Index,
//   Model,
//   PrimaryKey,
//   Table,
// } from 'sequelize-typescript';
// import { LetterOfCreditRequest } from './letter-of-credit-request.model';
// import { uuidv7 } from 'uuidv7';

// @Table({ modelName: 'letter_of_credit_expiry' })
// export class LetterOfCreditExpiry extends Model<LetterOfCreditExpiry> {
//   @PrimaryKey
//   @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
//   expiryId: string;

//   @ForeignKey(() => LetterOfCreditRequest)
//   @AllowNull(false)
//   @Column({ type: DataType.UUID })
//   @Index
//   requestId: string;

//   @BelongsTo(() => LetterOfCreditRequest, { onDelete: 'CASCADE' })
//   letterOfCreditRequest: LetterOfCreditRequest;

//   @Column({ type: DataType.DATE })
//   oldExpiryDate: Date;

//   @Column({ type: DataType.DATE })
//   expiryDate: Date;
// }
