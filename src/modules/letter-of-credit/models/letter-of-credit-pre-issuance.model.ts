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
//   Unique,
// } from 'sequelize-typescript';
// import { LetterOfCreditRequest } from './letter-of-credit-request.model';
// import { uuidv7 } from 'uuidv7';
// import {
//   IncotermsEnum,
//   LCClauseTypeEnum,
//   LCToleranceTypeEnum,
//   SettlementAccountTypeEnum,
// } from 'src/common/enums';

// @Table({ modelName: 'letter_of_credit_pre_issuance' })
// export class LetterOfCreditPreIssuance extends Model<LetterOfCreditPreIssuance> {
//   @PrimaryKey
//   @Column({ type: DataType.UUID, defaultValue: () => uuidv7() })
//   @Index
//   letterOfCreditId: string;

//   @ForeignKey(() => LetterOfCreditRequest)
//   @AllowNull(false)
//   @Column({ type: DataType.UUID })
//   @Index
//   requestId: string;

//   @AllowNull(false)
//   @Column({ type: DataType.UUID })
//   tradeProductId: string;

//   @AllowNull(false)
//   @Unique
//   @Column({ type: DataType.STRING })
//   @Index
//   formMApplicationNumber: string;

//   @AllowNull(false)
//   @Length({
//     msg: 'Reference Number character length can not be longer than 16',
//     max: 16,
//   })
//   @Unique
//   @Column({ type: DataType.STRING })
//   @Index
//   referenceNumber: string;

//   @Length({
//     msg: 'Master LC Reference Number character length can not be longer than 16',
//     max: 16,
//   })
//   @Column({ type: DataType.STRING })
//   masterLCReferenceNumber: string;

//   @BelongsTo(() => LetterOfCreditRequest, { onDelete: 'CASCADE' })
//   letterOfCreditRequest: LetterOfCreditRequest;

//   @Column({ type: DataType.BOOLEAN, defaultValue: false })
//   isBackToBack: boolean;

//   @Column({ type: DataType.BOOLEAN, defaultValue: false })
//   isStandBy: boolean;

//   @Column({ type: DataType.BOOLEAN, defaultValue: false })
//   isConfirmed: boolean;

//   @Column({ type: DataType.BOOLEAN, defaultValue: false })
//   isTransferrable: boolean;

//   @Column({ type: DataType.ENUM(...Object.values(LCClauseTypeEnum)) })
//   clauseType: LCClauseTypeEnum;

//   @Length({
//     msg: 'Applicant Name character length can not be longer than 35',
//     max: 35,
//   })
//   @Column({ type: DataType.STRING })
//   applicantName: string;

//   @Column({ type: DataType.STRING })
//   applicantAccountNumber: string;

//   @Length({
//     msg: 'Beneficiary Name character length can not be longer than 35',
//     max: 35,
//   })
//   @Column({ type: DataType.STRING })
//   beneficiaryName: string;

//   @Length({
//     msg: 'Beneficiary Address character length can not be longer than 105. 3 rows with each row having a max of 35 characters. carriage return (\\r) and new line (\\n) characters exclusive (at the end of each line except the last line).',
//     max: 105,
//   })
//   @Column({ type: DataType.STRING })
//   beneficiaryAddress: string;

//   @Length({
//     msg: 'Beneficiary Bank Name character length can not be longer than 35',
//     max: 35,
//   })
//   @Column({ type: DataType.STRING })
//   beneficiaryBankName: string;

//   @Length({
//     msg: 'Beneficiary Bank Address character length can not be longer than 105. 3 rows with each row having a max of 35 characters. carriage return (\\r) and new line (\\n) characters exclusive (at the end of each line except the last line).',
//     max: 105,
//   })
//   @Column({ type: DataType.STRING })
//   beneficiaryBankAddress: string;

//   @Column({ type: DataType.STRING })
//   beneficiaryBankSwiftCode: string;

//   @Length({
//     msg: 'Secondary Beneficiary Bank Name character length can not be longer than 35',
//     max: 35,
//   })
//   @Column({ type: DataType.STRING })
//   secondaryBeneficiaryName: string;

//   @Length({
//     msg: 'Secondary Beneficiary Bank Address character length can not be longer than 105. 3 rows with each row having a max of 35 characters. carriage return (\\r) and new line (\\n) characters exclusive (at the end of each line except the last line).',
//     max: 105,
//   })
//   @Column({ type: DataType.STRING })
//   secondaryBeneficiaryAddress: string;

//   @Length({
//     msg: 'Secondary Beneficiary Bank Name character length can not be longer than 35',
//     max: 35,
//   })
//   @Column({ type: DataType.STRING })
//   secondaryBeneficiaryBankName: string;

//   @Column({ type: DataType.STRING })
//   secondaryBeneficiaryAccountNumber: string;

//   @Column({ type: DataType.BOOLEAN, defaultValue: false })
//   allowPartialTransfer: boolean;

//   @Column({ type: DataType.INTEGER })
//   numberOfTransfersAllowed: number;

//   @Length({
//     msg: 'Transferee Name character length can not be longer than 35',
//     max: 35,
//   })
//   @Column({ type: DataType.STRING })
//   transfereeName: string;

//   @Column({ type: DataType.STRING })
//   transfereeBank: string;

//   @Column({ type: DataType.STRING })
//   transferConditionalNotes: string;

//   @Column({ type: DataType.STRING })
//   transferAuthorizationDocument: string;

//   @Column({ type: DataType.DATE })
//   transferExpiryDate: Date;

//   @Length({
//     msg: 'Corresponding Bank character length can not be longer than 105. 3 rows with each row having a max of 35 characters. carriage return (\\r) and new line (\\n) characters exclusive (at the end of each line except the last line).',
//     max: 105,
//   })
//   @Column({ type: DataType.STRING })
//   correspondingBank: string;

//   @Length({
//     msg: 'Advising Bank Name character length can not be longer than 35',
//     max: 105,
//   })
//   @Column({ type: DataType.STRING })
//   advisingBank: string;

//   @Length({
//     msg: 'Confirming Bank Name character length can not be longer than 35',
//     max: 105,
//   })
//   @Column({ type: DataType.STRING })
//   confirmingBank: string;

//   @Column({ type: DataType.FLOAT })
//   lcAmount: number;

//   @Column({ type: DataType.INTEGER })
//   goodsQuantity: number;

//   @Column({ type: DataType.ENUM(...Object.values(LCToleranceTypeEnum)) })
//   toleranceType: LCToleranceTypeEnum;

//   @Column({ type: DataType.INTEGER })
//   quantityTolerance: number;

//   @Column({ type: DataType.INTEGER })
//   amountTolerance: number;

//   @Column({ type: DataType.STRING })
//   sellerCurrency: string;

//   @Column({ type: DataType.STRING })
//   buyerCurrency: string;

//   @Column({ type: DataType.FLOAT })
//   exchangeRate: number;

//   @Column({ type: DataType.BOOLEAN, defaultValue: false })
//   partShipmentAllowed: boolean;

//   @Column({ type: DataType.BOOLEAN, defaultValue: false })
//   transShipmentAllowed: boolean;

//   @Length({
//     msg: 'Description of Goods character length can not be longer than 6500. 100 rows with each row having a max of 65 characters. carriage return (\\r) and new line (\\n) characters exclusive (at the end of each line except the last line).',
//     max: 6500,
//   })
//   @Column({ type: DataType.TEXT })
//   goodsDescription: string;

//   @Column({ type: DataType.ENUM(...Object.values(IncotermsEnum)) })
//   incoterms: IncotermsEnum;

//   @Column({ type: DataType.STRING })
//   portOfLoading: string;

//   @Column({ type: DataType.STRING })
//   portOfLoadingCountry: string;

//   @Column({ type: DataType.STRING })
//   portOfDischarge: string;

//   @Column({ type: DataType.STRING })
//   portOfDischargeCountry: string;

//   @Column({ type: DataType.DATE })
//   latestShipmentDate: Date;

//   @Column({ type: DataType.DATE })
//   expiryDate: Date;

//   @Length({
//     msg: 'Expiry Place character length can not be longer than 29',
//     max: 29,
//   })
//   @Column({ type: DataType.STRING })
//   expiryPlace: string;

//   @Column({ type: DataType.ENUM(...Object.values(SettlementAccountTypeEnum)) })
//   settlementAccountType: SettlementAccountTypeEnum;

//   @Column({ type: DataType.STRING })
//   settlementAccount: string;

//   @Column({ type: DataType.STRING })
//   relationshipOfficer: string;

//   @Column({ type: DataType.STRING })
//   externalBankName: string;

//   @Column({ type: DataType.STRING })
//   externalBankBranch: string;

//   @Column({ type: DataType.STRING })
//   externalBankAccountName: string;

//   @Column({ type: DataType.STRING })
//   externalBankAccountNumber: string;

//   @Column({ type: DataType.STRING })
//   externalBankAccountCurrency: string;

//   @Column({ type: DataType.STRING })
//   externalBankSwiftCode: string;

//   @Column({ type: DataType.JSONB })
//   documentAttachments: object;

//   @Length({
//     msg: 'Documents Required character length can not be longer than 780. 12 rows with each row having a max of 65 characters. carriage return (\\r) and new line (\\n) characters exclusive (at the end of each line except the last line).',
//     max: 780,
//   })
//   @Column
//   @Column({ type: DataType.STRING })
//   documentsRequired: string;

//   @Length({
//     msg: 'Additional Conditions character length can not be longer than 6500. 100 rows with each row having a max of 65 characters. carriage return (\\r) and new line (\\n) characters exclusive (at the end of each line except the last line).',
//     max: 6500,
//   })
//   @Column
//   @Column({ type: DataType.STRING })
//   additionalConditions: string;

//   @Length({
//     msg: 'Instructions to the Paying/Accepting/Negotiating Bank character length can not be longer than 780. 12 rows with each row having a max of 65 characters. carriage return (\\r) and new line (\\n) characters exclusive (at the end of each line except the last line).',
//     max: 780,
//   })
//   @Column
//   @Column({ type: DataType.TEXT })
//   instructionsToThePayingAcceptingNegotiatingBank: string;
// }
