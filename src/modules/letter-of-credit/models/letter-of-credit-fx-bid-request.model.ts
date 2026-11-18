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
// import {
//   BidFundTypeEnum,
//   FxCategoryEnum,
//   RateTypeEnum,
// } from 'src/common/enums';

// @Table({ modelName: 'letter_of_credit_fx_bid_request' })
// export class LetterOfCreditFxBidRequest extends Model<LetterOfCreditFxBidRequest> {
//   @PrimaryKey
//   @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
//   fxBidRequestId: string;

//   @ForeignKey(() => LetterOfCredit)
//   @AllowNull(false)
//   @Length({
//     msg: 'Reference Number character length can not be longer than 16',
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

//   @Column({ type: DataType.ENUM(...Object.values(BidFundTypeEnum)) })
//   bidFundType: BidFundTypeEnum;

//   @Column({ type: DataType.ENUM(...Object.values(FxCategoryEnum)) })
//   fxCategory: FxCategoryEnum;

//   @Column({ type: DataType.INTEGER })
//   forwardTenor: number;

//   @Column({ type: DataType.ENUM(...Object.values(RateTypeEnum)) })
//   rateType: RateTypeEnum;

//   @Column({ type: DataType.FLOAT })
//   bidAmount: number;

//   @Column({ type: DataType.FLOAT })
//   bidRate: number;

//   @Column({ type: DataType.FLOAT })
//   usdEquivalentAmount: number;

//   @Column({ type: DataType.FLOAT })
//   ngnEquivalentAmount: number;
// }
