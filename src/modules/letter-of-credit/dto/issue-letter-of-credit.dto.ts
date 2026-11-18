import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsEnum,
  MaxLength,
  Max,
  IsUUID,
  ValidateNested,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import {
  LetterOfCreditActionTypeEnum,
  TenorPeriodEnum,
  FormOfDocumentaryCreditEnum,
  ApplicationRulesEnum,
  ConfirmationInstructionEnum,
  DraweeEnum,
  DraftModeEnum,
  ShipmentEnum,
  LetterOfCreditProductTypeEnum,
  RequestedConfirmationPartyEnum,
  PaymentMethodEnum,
  CreditAvailableByEnum,
  CreditAvailableWithEnum,
  // ILCProductSubTypeEnum,
} from 'src/common/enums';
import { UserDetails } from 'src/common/types';
import { IsValidLcTextField } from 'src/common/validators';
import { LetterOfCreditDocumentUploadDto } from './letter-of-credit-document-upload.dto';
import { MixedPaymentDto } from './mixed-payment.dto';
import { Type } from 'class-transformer';

export class BankDetails {
  @ApiProperty({ example: 'name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Councodetry' })
  @IsString()
  code: string;
}

export class IssueLetterOfCreditDto extends UserDetails {
  @IsUUID()
  @IsOptional()
  requestId?: string;

  @ApiProperty({
    example: '811ed888-47ba-4126-bbbf-969f62366940',
  })
  @IsUUID()
  tradeProductId: string;

  @ApiProperty({
    description: 'Letter Of Credit Product Type',
    example: LetterOfCreditProductTypeEnum.IMPORT,
  })
  @IsEnum(LetterOfCreditProductTypeEnum, {
    message: `letterOfCreditProductType must be one of: ${Object.values(LetterOfCreditProductTypeEnum).join(', ')}`,
  })
  letterOfCreditProductType: LetterOfCreditProductTypeEnum =
    LetterOfCreditProductTypeEnum.IMPORT;

  // @ApiProperty({
  //   description: 'Letter of Credit Product Subtype',
  //   example: ILCProductSubTypeEnum.CASH_BACKED_CONFIRMED,
  // })
  // @IsEnum(ILCProductSubTypeEnum)
  // letterOfCreditProductSubType?: ILCProductSubTypeEnum =
  //   ILCProductSubTypeEnum.CASH_BACKED_CONFIRMED;

  @ApiProperty({
    description: 'Action type of the Letter of Credit',
    example: LetterOfCreditActionTypeEnum.ISSUANCE,
  })
  @IsEnum([
    LetterOfCreditActionTypeEnum.ISSUANCE,
    LetterOfCreditActionTypeEnum.ADVISEMENT,
  ])
  letterOfCreditActionType: LetterOfCreditActionTypeEnum =
    LetterOfCreditActionTypeEnum.ISSUANCE;

  @ApiPropertyOptional({
    description: 'Form M Reference Number',
    example: 'MF20220000420',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  applicationNumber?: string;

  @ApiProperty({
    description: 'Form of documentary credit',
    example: FormOfDocumentaryCreditEnum.IRREVOCABLE,
  })
  @IsEnum(FormOfDocumentaryCreditEnum)
  formOfDocumentaryCredit: FormOfDocumentaryCreditEnum =
    FormOfDocumentaryCreditEnum.IRREVOCABLE;

  @ApiPropertyOptional({
    description: 'Pre-advise reference number',
    example: 'SB/ILC202304CULC',
  })
  @IsString()
  @MaxLength(16)
  @IsOptional()
  preAdviceReferenceNumber?: string;

  @ApiProperty({ description: 'Date of issuance', example: '2023-03-15' })
  @IsDateString(
    {},
    {
      message: 'issueDate must be a valid date string (YYYY-MM-DD or ISO 8601)',
    },
  )
  issueDate: Date;

  @ApiProperty({
    description: 'Expiry date of the letter of credit',
    example: '2023-09-15',
  })
  @IsDateString(
    {},
    {
      message:
        'expiryDate must be a valid date string (YYYY-MM-DD or ISO 8601)',
    },
  )
  expiryDate: Date;

  @ApiProperty({
    description: 'Place of expiry',
    example: 'New York',
  })
  @IsString()
  @MaxLength(29)
  expiryPlace: string;

  @ApiProperty({
    description: 'Applicable rules',
    example: ApplicationRulesEnum.UCP_LATEST_VERSION,
  })
  @IsEnum(ApplicationRulesEnum)
  applicableRules: ApplicationRulesEnum =
    ApplicationRulesEnum.UCP_LATEST_VERSION;

  @ApiPropertyOptional({
    description: 'Other applicable rules',
    example: 'ISBP',
  })
  @IsOptional()
  @IsString()
  @MaxLength(35)
  otherApplicableRules?: string;

  @ApiProperty({
    description: 'Name of the applicant',
    example: 'ABC Trading Co.',
  })
  @IsString()
  @MaxLength(35)
  applicantName: string;

  @ApiProperty({
    description: 'Address of the applicant',
    example: '123 Trade Street, NY',
  })
  @IsString()
  applicantAddress: string;

  @ApiProperty({
    description: 'Applicant account number',
    example: '0098978637',
  })
  @IsString()
  @MaxLength(34)
  applicantAccount: string;

  @ApiProperty({
    description: 'Name of the beneficiary',
    example: 'XYZ Exports Ltd.',
  })
  @IsString()
  beneficiaryName: string;

  @ApiProperty({
    description: 'Address of the beneficiary',
    example: '456 Export Road, London',
  })
  @IsString()
  @MaxLength(109, {
    message:
      'Beneficiary Address character length can not be longer than 109. 3 rows with each row having a max of 35 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(3, 35)
  beneficiaryAddress: string;

  @ApiPropertyOptional({
    description: 'Beneficiary account number',
    example: 'BEN987654',
  })
  @IsString()
  @MaxLength(34)
  @IsOptional()
  beneficiaryAccount: string;

  @ApiPropertyOptional({
    description: 'Whether to advise directly',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  adviseDirect?: boolean;

  @ApiPropertyOptional({
    description: 'Advising bank BIC code',
    example: 'GBNKUS33',
  })
  @IsString()
  @IsOptional()
  advisingBankBicCode?: string;

  @ApiPropertyOptional({
    description: 'Advising bank name',
    example: 'Global Bank',
  })
  @IsString()
  @MaxLength(35)
  @IsOptional()
  advisingBankName?: string;

  @ApiPropertyOptional({
    description: 'Advising bank name',
    example: 'Global Bank',
  })
  @IsString()
  @MaxLength(109, {
    message:
      'Advising Bank Address character length can not be longer than 109. 3 rows with each row having a max of 35 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(3, 35)
  @IsOptional()
  advisingBankAddress?: string;

  @ApiProperty({ description: 'LC amount', example: '148500.00' })
  @IsNumber()
  lcAmount: number;

  @ApiPropertyOptional({
    description: 'Minimum credit amount tolerance',
    example: 5.0,
  })
  @IsNumber()
  @Max(10)
  @IsOptional()
  minCreditAmountTolerance?: number;

  @ApiPropertyOptional({
    description: 'Maximum credit amount tolerance',
    example: 5.0,
  })
  @IsNumber()
  @Max(10)
  @IsOptional()
  maxCreditAmountTolerance?: number;

  @ApiPropertyOptional({ description: 'Additional amount', example: 50000.0 })
  @IsString()
  @MaxLength(146, {
    message:
      'Additional Amount character length can not be longer than 146. 4 rows with each row having a max of 35 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(4, 35)
  @IsOptional()
  additionalAmount?: string;

  @ApiProperty({ description: 'LC Currency Code', example: 'USD' })
  @IsString()
  lcCurrencyCode: string;

  @ApiProperty({ description: 'Base currency', example: 'USD' })
  @IsString()
  baseCcyCurrency: string;

  @ApiProperty({ description: 'Base currency rate', example: 1.0 })
  @IsNumber()
  baseCcyRate: number;

  @ApiProperty({
    description: 'Base currency equivalent',
    example: '1000000.00',
  })
  @IsNumber()
  baseCcyEquivalent: number;

  @ApiProperty({ description: 'Local currency', example: 'EUR' })
  @IsString()
  localCcyCurrency: string;

  @ApiProperty({ description: 'Local currency rate', example: 0.95 })
  @IsNumber()
  localCcyRate: number;

  @ApiProperty({
    description: 'Local currency equivalent',
    example: '950000.00',
  })
  @IsNumber()
  localCcyEquivalent: number;

  @ApiProperty({
    description: 'Confirmation instruction',
    example: ConfirmationInstructionEnum.CONFIRM,
  })
  @IsEnum(ConfirmationInstructionEnum)
  confirmationInstruction: ConfirmationInstructionEnum =
    ConfirmationInstructionEnum.CONFIRM;

  @ApiPropertyOptional({
    description: 'Confirmation Amount',
    example: '950000.00',
  })
  @IsNumber()
  @IsOptional()
  confirmationAmount?: number;

  @ApiPropertyOptional({
    description: 'Confirmation amount currency',
    example: 'USD',
  })
  @IsString()
  @IsOptional()
  confirmationAmountCurrency?: string;

  @ApiPropertyOptional({
    description: 'Confirmation instruction',
    example: RequestedConfirmationPartyEnum.OURSELVES,
  })
  @IsEnum(RequestedConfirmationPartyEnum)
  @IsOptional()
  requestedConfirmationParty?: RequestedConfirmationPartyEnum =
    RequestedConfirmationPartyEnum.OURSELVES;

  @ApiPropertyOptional({
    description: 'SWIFT code of the requested confirmation bank',
    example: 'BOFAUS3N',
  })
  @IsOptional()
  @IsString()
  requestedConfirmationBankBicCode: string;

  @ApiPropertyOptional({
    description: 'Confirmation bank city',
    example: 'New York',
  })
  @IsString()
  @MaxLength(35)
  @IsOptional()
  requestedConfirmationBankName: string;

  @ApiPropertyOptional({
    description: 'Confirmation bank country',
    example: 'USA',
  })
  @IsString()
  @MaxLength(109, {
    message:
      'Requested Confirmation Bank Address character length can not be longer than 109. 3 rows with each row having a max of 35 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsOptional()
  requestedConfirmationBankAddress: string;

  @ApiProperty({
    description: 'Credit available by',
    example: CreditAvailableWithEnum.OURSELVES,
  })
  @IsEnum(CreditAvailableWithEnum)
  creditAvailableWith: CreditAvailableWithEnum =
    CreditAvailableWithEnum.OURSELVES;

  @ApiPropertyOptional({
    description: 'SWIFT code of the credit available with bank',
    example: 'BOFAUS3N',
  })
  @IsString()
  @IsOptional()
  creditAvailableWithBankSwiftCode: string;

  @ApiPropertyOptional({
    description: 'Name of the credit availabble with bank',
    example: 'Jane Smith Ltd',
  })
  @IsString()
  @MaxLength(35)
  @IsOptional()
  creditAvailableWithBankName: string;

  @ApiPropertyOptional({
    description: 'Address of the beneficiary bank',
    example: '123 Main St, City\nCountry',
  })
  @IsString()
  @MaxLength(109, {
    message:
      'Credit Available With Bank Address character length can not be longer than 109. 3 rows with each row having a max of 35 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsOptional()
  creditAvailableWithBankAddress: string;

  @ApiProperty({
    description: 'Credit available by',
    example: CreditAvailableByEnum.BY_ACCEPTANCE,
  })
  @IsEnum(CreditAvailableByEnum)
  creditAvailableBy: CreditAvailableByEnum =
    CreditAvailableByEnum.BY_ACCEPTANCE;

  @ApiPropertyOptional({
    description: 'Payment date of the letter of credit',
    example: '2023-09-15',
  })
  @IsDateString(
    {},
    {
      message:
        'paymentDate must be a valid date string (YYYY-MM-DD or ISO 8601)',
    },
  )
  @IsOptional()
  paymentDate: Date;

  @ApiPropertyOptional({
    description: 'Confirmation instruction',
    example: PaymentMethodEnum.METHOD_PROVIDED,
  })
  @IsEnum(PaymentMethodEnum)
  @IsOptional()
  paymentMethod?: PaymentMethodEnum = PaymentMethodEnum.METHOD_PROVIDED;

  @ApiPropertyOptional({
    description: 'List of mixed payment details',
    type: [MixedPaymentDto],
    example: [
      {
        paymentDate: '2023-09-15',
        paymentAmount: 950000.0,
        paymentMethod: 'Method Provided',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MixedPaymentDto)
  mixedPaymentDetails?: MixedPaymentDto[];

  @ApiPropertyOptional({ description: 'Whether draft is drawn', example: true })
  @IsBoolean()
  @IsOptional()
  draftDrawn?: boolean;

  @ApiPropertyOptional({
    description: 'Drawee',
    example: DraweeEnum.OURSELVES,
  })
  @IsEnum(DraweeEnum)
  @IsOptional()
  drawee?: DraweeEnum = DraweeEnum.OURSELVES;

  @ApiPropertyOptional({
    description: 'Drawee bank BIC code',
    example: 'DRBKUS33',
  })
  @IsString()
  @IsOptional()
  draweeBankBicCode?: string;

  @ApiProperty({ description: 'Drawee bank name', example: 'Drawee Bank' })
  @IsString()
  @MaxLength(35)
  @IsOptional()
  draweeBankName?: string;

  @ApiProperty({ description: 'Drawee bank address', example: '404 Drawee St' })
  @IsString()
  @MaxLength(109, {
    message:
      'Drawee Bank Address character length can not be longer than 109. 3 rows with each row having a max of 35 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(3, 35)
  @IsOptional()
  draweeBankAddress?: string;

  @ApiPropertyOptional({
    description: 'Draft Mode',
    example: DraftModeEnum.MATURITY,
  })
  @IsEnum(DraftModeEnum)
  @IsOptional()
  draftMode?: DraftModeEnum = DraftModeEnum.MATURITY;

  @ApiPropertyOptional({ description: 'Maturity date', example: '2023-09-15' })
  @IsDateString(
    {},
    {
      message:
        'maturityDate must be a valid date string (YYYY-MM-DD or ISO 8601)',
    },
  )
  @IsOptional()
  maturityDate?: Date;

  @ApiPropertyOptional({
    description: 'Tenor period',
    example: '5',
  })
  @IsNumber()
  @IsOptional()
  tenorPeriod?: number;

  @ApiPropertyOptional({
    description: 'Tenor Period Type',
    example: TenorPeriodEnum.DAYS,
  })
  @IsEnum(TenorPeriodEnum)
  @IsOptional()
  tenorPeriodType?: TenorPeriodEnum = TenorPeriodEnum.DAYS;

  @ApiPropertyOptional({
    description: 'SWIFT code of the beneficiary bank',
    example: 'BOFAUS3N',
  })
  @IsString()
  @IsOptional()
  beneficiaryBankSwiftCode: string;

  @ApiPropertyOptional({
    description: 'Name of the beneficiary bank',
    example: 'Jane Smith Ltd',
  })
  @IsString()
  @MaxLength(35)
  @IsOptional()
  beneficiaryBankName: string;

  @ApiPropertyOptional({
    description: 'Address of the beneficiary bank',
    example: '123 Main St, City\nCountry',
  })
  @IsString()
  @MaxLength(109, {
    message:
      'Beneficiary Bank Address character length can not be longer than 109. 3 rows with each row having a max of 35 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsOptional()
  beneficiaryBankAddress: string;

  @ApiPropertyOptional({
    description: 'Applicant bank BIC code',
    example: 'APBKUS33',
  })
  @IsString()
  @IsOptional()
  applicantBankBicCode?: string;

  @ApiPropertyOptional({
    description: 'Applicant bank name',
    example: 'Applicant Bank',
  })
  @IsString()
  @MaxLength(35)
  @IsOptional()
  applicantBankName?: string;

  @ApiPropertyOptional({
    description: 'Applicant bank address',
    example: '101 Bank Ave',
  })
  @IsString()
  @MaxLength(109, {
    message:
      'Applicant Bank Address character length can not be longer than 109. 3 rows with each row having a max of 35 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(3, 35)
  @IsOptional()
  applicantBankAddress?: string;

  @ApiPropertyOptional({
    description: 'Advise through BIC code',
    example: 'XYXYXYXYXY',
  })
  @IsString()
  @IsOptional()
  adviseThroughBankBicCode?: string;

  @ApiPropertyOptional({
    description: 'Advise through bank name',
    example: 'Intermediary Bank',
  })
  @IsString()
  @MaxLength(35)
  @IsOptional()
  adviseThroughBankName?: string;

  @ApiPropertyOptional({
    description: 'Advise through bank address',
    example: '789 Bank St',
  })
  @IsString()
  @MaxLength(109, {
    message:
      'Advise Through Bank Address character length can not be longer than 109. 3 rows with each row having a max of 35 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(3, 35)
  @IsOptional()
  adviseThroughBankAddress?: string;

  @ApiPropertyOptional({
    description: 'Reimbursing Bank BIC code',
    example: 'XYXYXYXYXY',
  })
  @IsString()
  @IsOptional()
  reimbursingBankBicCode?: string;

  @ApiPropertyOptional({
    description: 'Reimbursing bank name',
    example: 'Intermediary Bank',
  })
  @IsString()
  @MaxLength(35)
  @IsOptional()
  reimbursingBankName?: string;

  @ApiPropertyOptional({
    description: 'Advise through bank address',
    example: '789 Bank St',
  })
  @IsString()
  @MaxLength(109, {
    message:
      'Address character length can not be longer than 109. 3 rows with each row having a max of 35 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(3, 35)
  @IsOptional()
  reimbursingBankAddress?: string;

  @ApiPropertyOptional({
    description: 'Partial shipment status',
    example: ShipmentEnum.ALLOWED,
  })
  @IsEnum(ShipmentEnum)
  @IsOptional()
  partialShipment?: ShipmentEnum = ShipmentEnum.ALLOWED;

  @ApiPropertyOptional({
    description: 'Transhipment status',
    example: ShipmentEnum.ALLOWED,
  })
  @IsEnum(ShipmentEnum)
  @IsOptional()
  transShipment?: ShipmentEnum = ShipmentEnum.ALLOWED;

  @ApiPropertyOptional({
    description: 'Port of loading',
    example: 'New York Port',
  })
  @IsString()
  @MaxLength(65)
  @IsOptional()
  portOfLoading?: string;

  @ApiPropertyOptional({
    description: 'Port of discharge',
    example: 'Rotterdam Port',
  })
  @IsString()
  @MaxLength(35)
  @IsOptional()
  portOfDischarge?: string;

  @ApiPropertyOptional({
    description: 'Place of charge taken',
    example: 'ISSUING BANK',
  })
  @IsString()
  @MaxLength(65)
  @IsOptional()
  placeOfChargeTaken?: string;

  @ApiPropertyOptional({
    description: 'Final destination',
    example: 'London Port',
  })
  @IsString()
  @MaxLength(65)
  @IsOptional()
  finalDestination?: string;

  @ApiPropertyOptional({
    description: 'Final destination',
    example: '2023-03-15',
  })
  @IsDateString(
    {},
    {
      message:
        'latestShipmentDate must be a valid date string (YYYY-MM-DD or ISO 8601)',
    },
  )
  @IsOptional()
  latestShipmentDate?: Date;

  @ApiPropertyOptional({ description: 'Shipment period', example: '30 days' })
  @IsString()
  @MaxLength(400, {
    message:
      'Shipment Period character length can not be longer than 400. 6 rows with each row having a max of 65 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(6, 65)
  @IsOptional()
  shipmentPeriod?: string;

  @ApiPropertyOptional({
    description: 'Description of goods',
    example: 'Electronics - 1000 units',
  })
  @IsString()
  @IsString()
  @MaxLength(6698, {
    message:
      'Description of Goods character length can not be longer than 6698. 100 rows with each row having a max of 65 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(100, 65)
  @IsOptional()
  descriptionOfGoods?: string;

  @ApiPropertyOptional({
    description: 'Number of presentation days',
    example: '30',
  })
  @IsString()
  @IsOptional()
  presentationDays?: string;

  @ApiPropertyOptional({
    description: 'Presentation days type',
    example: TenorPeriodEnum.DAYS,
  })
  @IsEnum(TenorPeriodEnum)
  @IsOptional()
  presentationDaysType?: TenorPeriodEnum = TenorPeriodEnum.DAYS;

  @ApiPropertyOptional({
    description: 'Documents required',
    example: 'Invoice, BL',
  })
  @IsString()
  @MaxLength(6698, {
    message:
      'Documents Required character length can not be longer than 6698. 100 rows with each row having a max of 65 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(100, 65)
  @IsOptional()
  documentsRequired?: string;

  @ApiPropertyOptional({
    description: 'Additional conditions',
    example: 'Subject to inspection',
  })
  @IsString()
  @MaxLength(6698, {
    message:
      'Additional Conditions character length can not be longer than 6698. 100 rows with each row having a max of 65 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(100, 65)
  @IsOptional()
  additionalConditions?: string;

  @ApiPropertyOptional({
    description: 'Payment conditions for beneficiary',
    example: '90 days',
  })
  @IsString()
  @MaxLength(6698, {
    message:
      'Payment Conditions for Beneficiary character length can not be longer than 6698. 100 rows with each row having a max of 65 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(100, 65)
  @IsOptional()
  specialPaymentConditionsForBeneficiary?: string;

  @ApiPropertyOptional({
    description: 'Payment conditions for bank',
    example: 'At sight',
  })
  @IsString()
  @MaxLength(6698, {
    message:
      'Payment Conditions for Bank character length can not be longer than 6698. 100 rows with each row having a max of 65 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(100, 65)
  @IsOptional()
  specialPaymentConditionsForBank?: string;

  @ApiPropertyOptional({
    description: 'Charges details',
    example: 'ALL CHARGES TO BENEFICIARY',
  })
  @IsString()
  @MaxLength(220, {
    message:
      'Charges character length can not be longer than 220. 6 rows with each row having a max of 35 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(6, 35)
  @IsOptional()
  charges?: string;

  @ApiPropertyOptional({
    description:
      'Instructions to paying bank (each entry: max 780 chars, 12 rows with max 65 chars per row)',
    example: ['Pay on due date'],
  })
  @IsArray()
  @IsString({ each: true })
  @MaxLength(802, {
    each: true,
    message:
      'Each Instructions to the Paying/Accepting/Negotiating Bank entry can not be longer than 802. 12 rows with each row having a max of 65 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(12, 65, { each: true })
  @IsOptional()
  instructionsToThePayingOrAcceptingOrNegotiatingBank?: string[];

  @ApiPropertyOptional({
    description: 'Sender to receiver information',
    example: 'Please advise',
  })
  @IsString()
  @MaxLength(220, {
    message:
      'Sender To Receiver Information character length can not be longer than 220. 6 rows with each row having a max of 35 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(6, 35)
  @IsOptional()
  senderToReceiverInformation?: string;

  @ApiPropertyOptional({ description: 'Margin currency', example: 'USD' })
  @IsString()
  @IsOptional()
  marginCurrency?: string;

  @ApiPropertyOptional({ description: 'Margin amount', example: 50000.0 })
  @IsNumber()
  @IsOptional()
  marginAmount?: number;

  @ApiPropertyOptional({ description: 'Margin account', example: 'MAR123456' })
  @IsString()
  @IsOptional()
  marginAccount?: string;

  @ApiPropertyOptional({ description: 'Margin percentage', example: '10%' })
  @IsString()
  @IsOptional()
  marginPercentage?: string;

  @ApiPropertyOptional({ description: 'Collateral currency', example: 'USD' })
  @IsString()
  @IsOptional()
  collateralCurrency?: string;

  @ApiPropertyOptional({ description: 'Collateral amount', example: 100000.0 })
  @IsNumber()
  @IsOptional()
  collateralAmount?: number;

  @ApiPropertyOptional({
    description: 'Collateral account',
    example: 'COL987654',
  })
  @IsString()
  @IsOptional()
  collateralAccount?: string;

  @ApiPropertyOptional({ description: 'Collateral percentage', example: '20%' })
  @IsString()
  @IsOptional()
  collateralPercentage?: string;

  @ApiPropertyOptional({
    description: 'Whether to Pre-negotiate',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  preNegotiation?: boolean;

  @ApiPropertyOptional({
    description: 'Pre Negotiation amount',
    example: 0.0,
  })
  @IsNumber()
  @IsOptional()
  preNegotiationAmount?: number;

  @ApiPropertyOptional({
    description: 'Pre Negotiation amount currency',
    example: 'USD',
  })
  @IsString()
  @IsOptional()
  preNegotiationAmountCurrency?: string;

  @ApiPropertyOptional({
    description: 'Confirmation bank name',
    example: 'Bank of America',
  })
  @IsString()
  @MaxLength(35)
  @IsOptional()
  confirmationBankName?: string;

  @ApiPropertyOptional({ description: 'Credit line', example: 'CL20230315' })
  @IsString()
  @IsOptional()
  creditLine?: string;

  @ApiPropertyOptional({ description: 'Cost of funds rate', example: 2.5 })
  @IsNumber()
  @IsOptional()
  costOfFundsRate?: number;

  @ApiPropertyOptional({ description: 'Margin rate', example: 1.0 })
  @IsNumber()
  @IsOptional()
  marginRate?: number;

  @ApiPropertyOptional({ description: 'Total interest rate', example: 3.5 })
  @IsNumber()
  @IsOptional()
  totalInterestRate?: number;

  @ApiPropertyOptional({
    description: 'Pre Negotiation start date of the letter of credit',
    example: '2023-09-15',
  })
  @IsDateString(
    {},
    {
      message:
        'preNegotiationStartDate must be a valid date string (YYYY-MM-DD or ISO 8601)',
    },
  )
  @IsOptional()
  preNegotiationStartDate?: Date;

  @ApiPropertyOptional({
    description: 'Pre Negotiation maturity date of the letter of credit',
    example: '2023-09-15',
  })
  @IsDateString(
    {},
    {
      message:
        'preNegotiationMaturityDate must be a valid date string (YYYY-MM-DD or ISO 8601)',
    },
  )
  @IsOptional()
  preNegotiationMaturityDate?: Date;

  @ApiPropertyOptional({
    description: 'Pre-advise reference number',
    example: 'SB/ILC202304CULC',
  })
  @IsString()
  @MaxLength(16)
  @IsOptional()
  relatedReference?: string;

  @ApiPropertyOptional({ example: 'CL20230315' })
  @IsString()
  @IsOptional()
  beneficiaryInstituitionBicCode?: string;

  @ApiPropertyOptional({
    example: 'Intermediary Bank',
  })
  @IsString()
  @MaxLength(35)
  @IsOptional()
  beneficiaryInstituitionBankName?: string;

  @ApiPropertyOptional({
    example: '789 Bank St',
  })
  @IsString()
  @MaxLength(109, {
    message:
      'Address character length can not be longer than 109. 3 rows with each row having a max of 35 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(3, 35)
  @IsOptional()
  beneficiaryInstituitionAddress?: string;

  @ApiPropertyOptional({ example: 'CL20230315' })
  @IsString()
  @IsOptional()
  beneficiaryInstituitionAccount?: string;

  @ApiPropertyOptional({ example: 'CL20230315' })
  @IsString()
  @IsOptional()
  beneficiaryInstituitionAccountCurrency?: string;

  @ApiPropertyOptional({ example: 'CL20230315' })
  @IsString()
  @IsOptional()
  accountWithInstituitionBicCode?: string;

  @ApiProperty({
    example: 'Intermediary Bank',
  })
  @IsString()
  @MaxLength(35)
  @IsOptional()
  accountWithInstituitionBankName?: string;

  @ApiPropertyOptional({
    example: '789 Bank St',
  })
  @IsString()
  @MaxLength(109, {
    message:
      'Address character length can not be longer than 109. 3 rows with each row having a max of 35 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(3, 35)
  @IsOptional()
  accountWithInstituitionAddress?: string;

  @ApiPropertyOptional({ example: 'CL20230315' })
  @IsString()
  @IsOptional()
  accountWithInstituitionAccount?: string;

  @ApiPropertyOptional({ example: 'CL20230315' })
  @IsString()
  @IsOptional()
  accountWithInstituitionAccountCurrency?: string;

  @ApiPropertyOptional({ example: 'CL20230315' })
  @IsString()
  @IsOptional()
  orderingInstituionBicCode?: string;

  @ApiPropertyOptional({
    example: 'Intermediary Bank',
  })
  @IsString()
  @MaxLength(35)
  @IsOptional()
  orderingInstituionBankName?: string;

  @ApiPropertyOptional({
    example: '789 Bank St',
  })
  @IsString()
  @MaxLength(109, {
    message:
      'Address character length can not be longer than 109. 3 rows with each row having a max of 35 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(3, 35)
  @IsOptional()
  orderingInstituionAddress?: string;

  @ApiPropertyOptional({ example: 'CL20230315' })
  @IsString()
  @IsOptional()
  orderingInstituionAccount?: string;

  @ApiPropertyOptional({ example: 'CL20230315' })
  @IsString()
  @IsOptional()
  orderingInstituionAccountCurrency?: string;

  @ApiPropertyOptional({ example: 'CL20230315' })
  @IsString()
  @IsOptional()
  sendersCorrespondentBicCode?: string;

  @ApiPropertyOptional({
    example: 'Intermediary Bank',
  })
  @IsString()
  @MaxLength(35)
  @IsOptional()
  sendersCorrespondentBankName?: string;

  @ApiPropertyOptional({
    example: '789 Bank St',
  })
  @IsString()
  @MaxLength(109, {
    message:
      'Address character length can not be longer than 109. 3 rows with each row having a max of 35 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(3, 35)
  @IsOptional()
  sendersCorrespondentAddress?: string;

  @ApiPropertyOptional({ example: 'CL20230315' })
  @IsString()
  @IsOptional()
  sendersCorrespondentAccount?: string;

  @ApiPropertyOptional({ example: 'CL20230315' })
  @IsString()
  @IsOptional()
  sendersCorrespondentAccountCurrency?: string;

  @ApiPropertyOptional({ example: 'CL20230315' })
  @IsString()
  @IsOptional()
  receiversCorrespondentBicCode?: string;

  @ApiPropertyOptional({
    example: 'Intermediary Bank',
  })
  @IsString()
  @MaxLength(35)
  @IsOptional()
  receiversCorrespondentBankName?: string;

  @ApiPropertyOptional({
    example: '789 Bank St',
  })
  @IsString()
  @MaxLength(109, {
    message:
      'Address character length can not be longer than 109. 3 rows with each row having a max of 35 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(3, 35)
  @IsOptional()
  receiversCorrespondentAddress?: string;

  @ApiPropertyOptional({ example: 'CL20230315' })
  @IsString()
  @IsOptional()
  receiversCorrespondentAccount?: string;

  @ApiPropertyOptional({ example: 'CL20230315' })
  @IsString()
  @IsOptional()
  receiversCorrespondentAccountCurrency?: string;

  @ApiPropertyOptional({ example: 'CL20230315' })
  @IsString()
  @IsOptional()
  intermediaryBicCode?: string;

  @ApiPropertyOptional({
    example: 'Intermediary Bank',
  })
  @IsString()
  @MaxLength(35)
  @IsOptional()
  intermediaryBankName?: string;

  @ApiPropertyOptional({
    example: '789 Bank St',
  })
  @IsString()
  @MaxLength(109, {
    message:
      'Address character length can not be longer than 109. 3 rows with each row having a max of 35 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(3, 35)
  @IsOptional()
  intermediaryAddress?: string;

  @ApiPropertyOptional({ example: 'CL20230315' })
  @IsString()
  @IsOptional()
  intermediaryAccount?: string;

  @ApiPropertyOptional({ example: 'CL20230315' })
  @IsString()
  @IsOptional()
  intermediaryAccountCurrency?: string;

  @ApiPropertyOptional({
    description: 'Sender to receiver information',
    example: 'Please advise',
  })
  @IsString()
  @MaxLength(220, {
    message:
      'Sender To Receiver Information character length can not be longer than 220. 6 rows with each row having a max of 35 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(6, 35)
  @IsOptional()
  fundsTransferSenderToReceiverInformation?: string;

  @ApiPropertyOptional({
    description: 'SWIFT code of the external bank',
    example: 'EXTBUS33',
  })
  @IsString()
  @IsOptional()
  externalBankSwiftCode?: string;

  @ApiPropertyOptional({
    description: 'List of document attachments',
    type: [LetterOfCreditDocumentUploadDto],
    example: [
      {
        document: 'Bill of Lading',
        uploadDocument: 'https://example.com/docs/bill_of_lading.pdf',
        documentDate: '2025-05-25',
        documentDescription:
          'Original copy couriered. This is scanned copy for pre-check',
      },
    ],
  })
  @IsOptional()
  documentAttachments?: LetterOfCreditDocumentUploadDto[];

  @ApiPropertyOptional({
    description: 'Whether previously a draft',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;

  @ApiPropertyOptional({
    description: 'Whether previously pre-issued',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isPreIssued?: boolean;

  @ApiPropertyOptional({
    description: 'Save as a template',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  saveAsTemplate?: boolean;

  @ApiPropertyOptional({
    description: 'SWIFT code of the external bank',
    example: 'EXTBUS33',
  })
  @IsString()
  @IsOptional()
  templateName?: string;

  // @ApiProperty({
  //   description: 'Name of the customer',
  //   example: 'John Doe Corp',
  // })
  // @IsString()
  // @IsOptional()
  // customerName?: string;

  // @ApiProperty({
  //   description: 'Source of funds account identifier',
  //   example: 'ACC123456',
  // })
  // @IsString()
  // @IsOptional()
  // sourceOfFundsAccount?: string;

  // @ApiProperty({
  //   description: 'Source of funds',
  //   example: SourceOfFundsEnum.DOM_EXPORT_PROCEEDS,
  // })
  // @IsEnum(SourceOfFundsEnum)
  // @IsOptional()
  // sourceOfFunds?: SourceOfFundsEnum = SourceOfFundsEnum.DOM_EXPORT_PROCEEDS;

  // @ApiProperty({
  //   description: 'Reference number for the letter of credit',
  //   example: 'SB/ILC202303CULC',
  // })
  // @IsString()
  // @MaxLength(16)
  // @IsOptional()
  // referenceNumber?: string;

  // @ApiProperty({
  //   description: 'Receiver bank reference',
  //   example: 'RB20230315',
  // })
  // @IsString()
  // @IsOptional()
  // receiverBankReference?: string;

  // @ApiProperty({
  //   description: 'Product subtype',
  //   example: ILCProductSubTypeEnum.CASH_BACKED_CONFIRMED,
  // })
  // @IsEnum(ILCProductSubTypeEnum)
  // @IsOptional()
  // productSubType?: ILCProductSubTypeEnum =
  //   ILCProductSubTypeEnum.CASH_BACKED_CONFIRMED;

  // @ApiProperty({ description: 'Charge account number', example: 'CHG987654' })
  // @IsString()
  // @IsOptional()
  // chargeAccount?: string;

  // @ApiProperty({ description: 'Place of expiry', example: 'New York' })
  // @IsString()
  // @MaxLength(29)
  // @IsOptional()
  // expiryPlace?: string;

  // @ApiProperty({
  //   description: 'Amendment date if applicable',
  //   example: '2023-04-01',
  // })
  // @IsDateString(
  //   {},
  //   {
  //     message:
  //       'ammendmentDate must be a valid date string (YYYY-MM-DD or ISO 8601)',
  //   },
  // )
  // @IsOptional()
  // ammendmentDate?: Date;

  // @ApiProperty({ description: 'Purpose of the message', example: 'ISSUANCE' })
  // @IsString()
  // @IsOptional()
  // purposeOfMessage?: string;

  // @ApiProperty({
  //   description: 'Charge payable details',
  //   example: 'BENEFICIARY',
  // })
  // @IsString()
  // @IsOptional()
  // chargePayable?: string;

  // @ApiProperty({
  //   description: 'Message sending method',
  //   example: SendMessageByEnum.SWIFT,
  // })
  // @IsEnum(SendMessageByEnum)
  // @IsOptional()
  // sendMessageBy?: SendMessageByEnum = SendMessageByEnum.SWIFT;

  // @ApiProperty({ description: 'Whether to advise directly', example: false })
  // @IsBoolean()
  // @IsOptional()
  // revolving?: boolean;

  // @ApiProperty({ description: 'Whether to draft MT700', example: false })
  // @IsBoolean()
  // @IsOptional()
  // draftMt700?: boolean;

  // @ApiProperty({ description: 'Whether to seek beneficiary', example: false })
  // @IsBoolean()
  // @IsOptional()
  // seekBeneficiary?: boolean;

  // @ApiProperty({
  //   description: 'Changed applicant details',
  //   example: 'New address',
  // })
  // @IsString()
  // @IsOptional()
  // changedApplicantDetails?: string;

  // @ApiProperty({ description: 'ILC increase amount', example: 100000.0 })
  // @IsNumber()
  // @IsOptional()
  // ilcIncreaseAmount?: number;

  // @ApiProperty({ description: 'ILC decrease amount', example: 50000.0 })
  // @IsNumber()
  // @IsOptional()
  // ilcDecreaseAmount?: number;

  // @ApiProperty({ description: 'ILC confirmation amount', example: 1000000.0 })
  // @IsNumber()
  // @IsOptional()
  // ilcConfirmationAmount?: number;

  // @ApiProperty({
  //   description: 'Advise through bank details',
  //   example: 'Swift details',
  // })
  // @IsString()
  // @IsOptional()
  // adviseThroughBankDetails?: string;

  // @ApiProperty({ description: 'Confirming bank BIC code', example: 'CFBKUS33' })
  // @IsString()
  // @IsOptional()
  // confirmingBankBicCode?: string;

  // @ApiProperty({
  //   description: 'Confirming bank name',
  //   example: 'Confirming Bank',
  // })
  // @IsString()
  // @MaxLength(35)
  // @IsOptional()
  // confirmingBankName?: string;

  // @ApiProperty({
  //   description: 'Confirming bank address',
  //   example: '202 Confirm St',
  // })
  // @IsString()
  // @MaxLength(105, {
  //   message:
  //     'Confirming Bank Address character length can not be longer than 105. 3 rows with each row having a max of 35 characters. carriage return (\\r) and new line (\\n) characters exclusive (at the end of each line except the last line).',
  // })
  // @IsValidLcTextField(3, 35)
  // @IsOptional()
  // confirmingBankAddress?: string;

  // @ApiProperty({
  //   description: 'Credit available with bank BIC code',
  //   example: 'CAWBUS33',
  // })
  // @IsString()
  // @IsOptional()
  // creditAvailableWithBankBicCode?: string;

  // @ApiProperty({
  //   description: 'Credit available with bank name',
  //   example: 'Available Bank',
  // })
  // @IsString()
  // @MaxLength(35)
  // @IsOptional()
  // creditAvailableWithBankName?: string;

  // @ApiProperty({
  //   description: 'Credit available with bank address',
  //   example: '303 Credit St',
  // })
  // @IsString()
  // @MaxLength(105, {
  //   message:
  //     'Credit Available With Bank Address character length can not be longer than 105. 3 rows with each row having a max of 35 characters. carriage return (\\r) and new line (\\n) characters exclusive (at the end of each line except the last line).',
  // })
  // @IsValidLcTextField(3, 35)
  // @IsOptional()
  // creditAvailableWithBankAddress?: string;

  // @ApiProperty({ description: 'Drawee bank BIC code', example: 'DRBKUS33' })
  // @IsString()
  // @IsOptional()
  // draweeBankBicCode?: string;

  // @ApiProperty({ description: 'Drawee bank name', example: 'Drawee Bank' })
  // @IsString()
  // @MaxLength(35)
  // @IsOptional()
  // draweeBankName?: string;

  // @ApiProperty({ description: 'Drawee bank address', example: '404 Drawee St' })
  // @IsString()
  // @MaxLength(105, {
  //   message:
  //     'Drawee Bank Address character length can not be longer than 105. 3 rows with each row having a max of 35 characters. carriage return (\\r) and new line (\\n) characters exclusive (at the end of each line except the last line).',
  // })
  // @IsValidLcTextField(3, 35)
  // @IsOptional()
  // draweeBankAddress?: string;

  // @ApiProperty({
  //   description: 'Reimbursing bank BIC code',
  //   example: 'RBBKUS33',
  // })
  // @IsString()
  // @IsOptional()
  // reimbursingBankBicCode?: string;

  // @ApiProperty({
  //   description: 'Reimbursing bank name',
  //   example: 'Reimbursing Bank',
  // })
  // @IsString()
  // @MaxLength(35)
  // @IsOptional()
  // reimbursingBankName?: string;

  // @ApiProperty({
  //   description: 'Reimbursing bank address',
  //   example: '505 Reimburse St',
  // })
  // @IsString()
  // @MaxLength(105, {
  //   message:
  //     'Reimbursing Bank Address character length can not be longer than 105. 3 rows with each row having a max of 35 characters. carriage return (\\r) and new line (\\n) characters exclusive (at the end of each line except the last line).',
  // })
  // @IsValidLcTextField(3, 35)
  // @IsOptional()
  // reimbursingBankAddress?: string;

  // @ApiProperty({ description: 'Tenor from date', example: '2023-03-15' })
  // @IsDateString(
  //   {},
  //   {
  //     message: 'tenorFrom must be a valid date string (YYYY-MM-DD or ISO 8601)',
  //   },
  // )
  // @IsOptional()
  // tenorFrom?: Date;

  // @ApiProperty({ description: 'Tenor to date', example: '2023-09-15' })
  // @IsDateString(
  //   {},
  //   {
  //     message: 'tenorTo must be a valid date string (YYYY-MM-DD or ISO 8601)',
  //   },
  // )
  // @IsOptional()
  // tenorTo?: Date;

  // @ApiProperty({
  //   description: 'Tenor Period',
  //   example: TenorPeriodEnum.DAYS,
  // })
  // @IsEnum(TenorPeriodEnum)
  // tenorPeriod?: TenorPeriodEnum = TenorPeriodEnum.DAYS;

  // @ApiProperty({ description: 'Exchange rate', example: 1.05 })
  // @IsNumber()
  // @IsOptional()
  // exchangeRate?: number;

  // @ApiProperty({ description: 'Interest rate', example: 3.5 })
  // @IsNumber()
  // @IsOptional()
  // interestRate?: number;

  // @ApiProperty({ description: 'ILC SWIFT charge currency', example: 'USD' })
  // @IsString()
  // @IsOptional()
  // ilcSwiftChargeCurrency?: string;

  // @ApiProperty({ description: 'ILC SWIFT charge pay amount', example: 50.0 })
  // @IsNumber()
  // @IsOptional()
  // ilcSwiftChargePayAmount?: number;

  // @ApiProperty({ description: 'ILC SWIFT charge tax amount', example: 5.0 })
  // @IsNumber()
  // @IsOptional()
  // ilcSwiftChargeTaxAmount?: number;

  // @ApiProperty({ description: 'Waive ILC SWIFT charge', example: false })
  // @IsBoolean()
  // @IsOptional()
  // waiveIlcSwiftCharge?: boolean;

  // @ApiProperty({ description: 'Defer ILC SWIFT charge', example: false })
  // @IsBoolean()
  // @IsOptional()
  // deferIlcSwiftCharge?: boolean;

  // @ApiProperty({ description: 'ILC SWIFT charge status', example: false })
  // @IsBoolean()
  // @IsOptional()
  // ilcSwiftChargeStatus?: boolean;

  // @ApiProperty({ description: 'ILC issue commission currency', example: 'USD' })
  // @IsString()
  // @IsOptional()
  // ilcIssueCommissionCurrency?: string;

  // @ApiProperty({
  //   description: 'ILC issue commission pay amount',
  //   example: 100.0,
  // })
  // @IsNumber()
  // @IsOptional()
  // ilcIssueCommissionPayAmount?: number;

  // @ApiProperty({
  //   description: 'ILC issue commission tax amount',
  //   example: 10.0,
  // })
  // @IsNumber()
  // @IsOptional()
  // ilcIssueCommissionTaxAmount?: number;

  // @ApiProperty({ description: 'Waive ILC issue commission', example: false })
  // @IsBoolean()
  // @IsOptional()
  // waiveIlcIssueCommission?: boolean;

  // @ApiProperty({ description: 'Defer ILC issue commission', example: false })
  // @IsBoolean()
  // @IsOptional()
  // deferIlcIssueCommission?: boolean;

  // @ApiProperty({ description: 'ILC issue commission status', example: false })
  // @IsBoolean()
  // @IsOptional()
  // ilcIssueCommissionStatus?: boolean;

  // @ApiProperty({ description: 'Original ILC VAT currency', example: 'USD' })
  // @IsString()
  // @IsOptional()
  // originalIlcVatCurrency?: string;

  // @ApiProperty({ description: 'Original ILC VAT pay amount', example: 20.0 })
  // @IsNumber()
  // @IsOptional()
  // originalIlcVatPayAmount?: number;

  // @ApiProperty({ description: 'Original ILC VAT tax amount', example: 2.0 })
  // @IsNumber()
  // @IsOptional()
  // originalIlcVatTaxAmount?: number;

  // @ApiProperty({ description: 'Waive original ILC VAT', example: false })
  // @IsBoolean()
  // @IsOptional()
  // waiveOriginalIlcVat?: boolean;

  // @ApiProperty({ description: 'Defer original ILC VAT', example: false })
  // @IsBoolean()
  // @IsOptional()
  // deferOriginalIlcVat?: boolean;

  // @ApiProperty({ description: 'Original ILC VAT status', example: false })
  // @IsBoolean()
  // @IsOptional()
  // originalIlcVatStatus?: boolean;

  // @ApiProperty({ description: 'MT202 COV entry debit amount', example: 1000.0 })
  // @IsNumber()
  // @IsOptional()
  // mt202CovEntryDebitAmount?: number;

  // @ApiProperty({
  //   description: 'MT202 COV entry credit amount',
  //   example: 1000.0,
  // })
  // @IsNumber()
  // @IsOptional()
  // mt202CovEntryCreditAmount?: number;

  // @ApiProperty({ description: 'Waive MT202 COV entry charge', example: false })
  // @IsBoolean()
  // @IsOptional()
  // waiveMt202CovEntryCharge?: boolean;

  // @ApiProperty({ description: 'Defer MT202 COV entry charge', example: false })
  // @IsBoolean()
  // @IsOptional()
  // deferMt202CovEntryCharge?: boolean;

  // @ApiProperty({ description: 'MT202 COV entry status', example: false })
  // @IsBoolean()
  // @IsOptional()
  // mt202CovEntryStatus?: boolean;

  // @ApiProperty({
  //   description: 'Collateral entry debit amount',
  //   example: 50000.0,
  // })
  // @IsNumber()
  // @IsOptional()
  // collateralEntryDebitAmount?: number;

  // @ApiProperty({
  //   description: 'Collateral entry credit amount',
  //   example: 50000.0,
  // })
  // @IsNumber()
  // @IsOptional()
  // collateralEntryCreditAmount?: number;

  // @ApiProperty({ description: 'Waive collateral entry charge', example: false })
  // @IsBoolean()
  // @IsOptional()
  // waiveCollateralEntryCharge?: boolean;

  // @ApiProperty({ description: 'Defer collateral entry charge', example: false })
  // @IsBoolean()
  // @IsOptional()
  // deferCollateralEntryCharge?: boolean;

  // @ApiProperty({ description: 'Collateral entry status', example: false })
  // @IsBoolean()
  // @IsOptional()
  // collateralEntryStatus?: boolean;

  // @ApiProperty({ description: 'Margin entry debit amount', example: 25000.0 })
  // @IsNumber()
  // @IsOptional()
  // marginEntryDebitAmount?: number;

  // @ApiProperty({ description: 'Margin entry credit amount', example: 25000.0 })
  // @IsNumber()
  // @IsOptional()
  // marginEntryCreditAmount?: number;

  // @ApiProperty({ description: 'Waive margin entry charge', example: false })
  // @IsBoolean()
  // @IsOptional()
  // waiveMarginlEntryCharge?: boolean;

  // @ApiProperty({ description: 'Defer margin entry charge', example: false })
  // @IsBoolean()
  // @IsOptional()
  // deferMarginEntryCharge?: boolean;

  // @ApiProperty({ description: 'Margin entry status', example: false })
  // @IsBoolean()
  // @IsOptional()
  // marginEntryStatus?: boolean;

  // // "Pre-Negotiation" section
  // @ApiProperty({ description: 'Pre-negotiation amount', example: 800000.0 })
  // @IsNumber()
  // @IsOptional()
  // preNegotiationAmount?: number;

  // @ApiProperty({
  //   description: 'Pre-negotiation currency code',
  //   example: 'USD',
  // })
  // @IsString()
  // @IsOptional()
  // preNegotiationCurrencyCode?: string;

  // @ApiProperty({ description: 'Start date', example: '2023-03-15' })
  // @IsDateString(
  //   {},
  //   {
  //     message: 'startDate must be a valid date string (YYYY-MM-DD or ISO 8601)',
  //   },
  // )
  // @IsOptional()
  // startDate?: string;

  // // "FX-Bid Request" section
  // @ApiProperty({
  //   description: 'Bid Fund Type',
  //   enum: BidFundTypeEnum,
  //   example: BidFundTypeEnum.FORM_Q,
  // })
  // @IsEnum(BidFundTypeEnum)
  // @IsOptional()
  // bidFundType?: BidFundTypeEnum;

  // @ApiProperty({
  //   description: 'FX Category',
  //   enum: FxCategoryEnum,
  //   example: FxCategoryEnum.SPOT,
  // })
  // @IsEnum(FxCategoryEnum)
  // @IsOptional()
  // fxCategory?: FxCategoryEnum;

  // @ApiProperty({ description: 'Forward Tenor in days', example: 30 })
  // @IsNumber()
  // @IsOptional()
  // forwardTenor?: number;

  // @ApiProperty({
  //   description: 'Rate Type',
  //   enum: RateTypeEnum,
  //   example: RateTypeEnum.BANK_RATE,
  // })
  // @IsEnum(RateTypeEnum)
  // @IsOptional()
  // rateType?: RateTypeEnum;

  // @ApiProperty({ description: 'Bid Amount', example: 1000000.0 })
  // @IsNumber()
  // @IsOptional()
  // bidAmount?: number;

  // @ApiProperty({ description: 'Bid Rate', example: 1.25 })
  // @IsNumber()
  // @IsOptional()
  // bidRate?: number;

  // @ApiProperty({ description: 'USD Equivalent Amount', example: 1000000.0 })
  // @IsNumber()
  // @IsOptional()
  // usdEquivalentAmount?: number;

  // @ApiProperty({ description: 'NGN Equivalent Amount', example: 1500000000.0 })
  // @IsNumber()
  // @IsOptional()
  // ngnEquivalentAmount?: number;

  // // "Funds Transfer" (Settlement Details??) section
  // @ApiProperty({ description: 'Receiver BIC', example: 'RECVUS33' })
  // @IsString()
  // @IsOptional()
  // receiverBicCode?: string;

  // @ApiProperty({ description: 'Receiver bank name', example: 'Receiver Bank' })
  // @IsString()
  // @IsOptional()
  // receiverBankName?: string;

  // @ApiProperty({ description: 'Receiver address', example: '606 Receiver St' })
  // @IsString()
  // @IsOptional()
  // receiverAddress?: string;

  // @ApiProperty({
  //   description: "Receiver's correspondent BIC code",
  //   example: 'RVCBUS33',
  // })
  // @IsString()
  // @IsOptional()
  // receiverCorrespondentBicCode?: string;

  // @ApiProperty({
  //   description: "Receiver's correspondent bank name",
  //   example: 'Receiver Corr Bank',
  // })
  // @IsString()
  // @IsOptional()
  // receiverCorrespondentBankName?: string;

  // @ApiProperty({
  //   description: "Receiver's correspondent address",
  //   example: '707 Corr St',
  // })
  // @IsString()
  // @IsOptional()
  // receiverCorrespondentAddress?: string;

  // @ApiProperty({
  //   description: 'Receiver correspondent amount',
  //   example: 1000000.0,
  // })
  // @IsNumber()
  // @IsOptional()
  // receiverCorrespondentAmount?: number;

  // @ApiProperty({
  //   description: 'Ordering institution BIC code',
  //   example: 'ORBKUS33',
  // })
  // @IsString()
  // @IsOptional()
  // orderingInstitutionBicCode?: string;

  // @ApiProperty({
  //   description: 'Ordering institution bank name',
  //   example: 'Ordering Bank',
  // })
  // @IsString()
  // @IsOptional()
  // orderingInstitutionBankName?: string;

  // @ApiProperty({
  //   description: 'Ordering institution address',
  //   example: '808 Order St',
  // })
  // @IsString()
  // @IsOptional()
  // orderingInstitutionAddress?: string;

  // @ApiProperty({ description: 'Intermediary BIC code', example: 'INTMUS33' })
  // @IsString()
  // @IsOptional()
  // intermediaryBicCode?: string;

  // @ApiProperty({
  //   description: 'Intermediary bank name',
  //   example: 'Intermediary Bank',
  // })
  // @IsString()
  // @IsOptional()
  // intermediaryBankName?: string;

  // @ApiProperty({ description: 'Intermediary address', example: '909 Inter St' })
  // @IsString()
  // @IsOptional()
  // intermediaryAddress?: string;

  // @ApiProperty({ description: 'Intermediary amount', example: 1000000.0 })
  // @IsNumber()
  // @IsOptional()
  // intermediaryAmount?: number;

  // @ApiProperty({
  //   description: "Sender's correspondent BIC code",
  //   example: 'SNCBUS33',
  // })
  // @IsString()
  // @IsOptional()
  // senderCorrespondentBicCode?: string;

  // @ApiProperty({
  //   description: "Sender's correspondent bank name",
  //   example: 'Sender Corr Bank',
  // })
  // @IsString()
  // @IsOptional()
  // senderCorrespondentBankName?: string;

  // @ApiProperty({
  //   description: "Sender's correspondent address",
  //   example: '1010 Sender St',
  // })
  // @IsString()
  // @IsOptional()
  // senderCorrespondentAddress?: string;

  // @ApiProperty({
  //   description: "Sender's correspondent amount",
  //   example: 1000000.0,
  // })
  // @IsNumber()
  // @IsOptional()
  // senderCorrespondentAmount?: number;

  // @ApiProperty({
  //   description: 'Account with institution BIC code',
  //   example: 'AWIBUS33',
  // })
  // @IsString()
  // @IsOptional()
  // accountWithInstitutionBicCode?: string;

  // @ApiProperty({
  //   description: 'Account with institution bank name',
  //   example: 'Account With Bank',
  // })
  // @IsString()
  // @IsOptional()
  // accountWithInstitutionBankName?: string;

  // @ApiProperty({
  //   description: 'Account with institution address',
  //   example: '1111 Account St',
  // })
  // @IsString()
  // @IsOptional()
  // accountWithInstitutionAddress?: string;

  // @ApiProperty({
  //   description: 'Account with institution amount',
  //   example: 1000000.0,
  // })
  // @IsNumber()
  // @IsOptional()
  // accountWithInstitutionAmount?: number;

  // @ApiProperty({
  //   description: 'Beneficiary institution BIC code',
  //   example: 'BENBUS33',
  // })
  // @IsString()
  // @IsOptional()
  // beneficiaryInstitutionBicCode?: string;

  // @ApiProperty({
  //   description: 'Beneficiary institution address',
  //   example: '1212 Beneficiary St',
  // })
  // @IsString()
  // @IsOptional()
  // beneficiaryInstitutionAddress?: string;

  // @ApiProperty({ description: 'Beneficiary amount', example: 1000000.0 })
  // @IsNumber()
  // @IsOptional()
  // beneficiaryAmount?: number;

  // @ApiProperty({ description: 'Document attachments', example: {} })
  // @IsOptional()
  // documentAttachments?: object;
}

// export class IssueLetterOfCreditDto extends UserDetails {
//   @ApiProperty({
//     description: 'Action type of the Letter of Credit',
//     example: LetterOfCreditActionTypeEnum.ISSUANCE,
//   })
//   @IsEnum(LetterOfCreditActionTypeEnum, {
//     message: `letterOfCreditActionType must be one of: ${Object.values(LetterOfCreditActionTypeEnum).join(', ')}`,
//   })
//   letterOfCreditActionType: LetterOfCreditActionTypeEnum =
//     LetterOfCreditActionTypeEnum.ISSUANCE;

//   @ApiProperty({
//     description: 'Form M Reference Number',
//     example: 'MF20220120991',
//   })
//   @IsString()
//   formMApplicationNumber: string;

//   @ApiProperty({
//     description: 'Form M Reference Number',
//     example: 'MF20220120991',
//   })
//   @IsString()
//   @IsOptional()
//   masterLCReferenceNumber: string;

//   @ApiProperty({
//     description: 'Indicates if the Letter of Credit is Back to Back',
//     example: false,
//   })
//   @IsBoolean()
//   isBackToBack: boolean;

//   @ApiProperty({
//     description: 'Indicates if the Letter of Credit is Standby',
//     example: false,
//   })
//   @IsBoolean()
//   isStandBy: boolean;

//   @ApiProperty({
//     description: 'Indicates if the Letter of Credit is Confirmed',
//     example: false,
//   })
//   @IsBoolean()
//   isConfirmed: boolean;

//   @ApiProperty({
//     description: 'Indicates if the Letter of Credit is Transferrable',
//     example: false,
//   })
//   @IsBoolean()
//   isTransferrable: boolean;

//   @ApiProperty({
//     description: 'Type of clause for the Letter of Credit',
//     enum: LCClauseTypeEnum,
//   })
//   @IsEnum(LCClauseTypeEnum, {
//     message: `clauseType must be one of: ${Object.values(LCClauseTypeEnum).join(', ')}`,
//   })
//   @IsOptional()
//   clauseType: LCClauseTypeEnum = LCClauseTypeEnum.GREEN;

//   @ApiProperty({
//     description: 'Name of the applicant',
//     example: 'John Doe Corp',
//   })
//   @IsString()
//   @MaxLength(35)
//   applicantName: string;

//   @ApiProperty({
//     description: 'Applicant account number',
//     example: '1234567890',
//   })
//   @IsString()
//   applicantAccountNumber: string;

//   @ApiProperty({
//     description: 'Name of the beneficiary',
//     example: 'Jane Smith Ltd',
//   })
//   @IsString()
//   @MaxLength(35)
//   beneficiaryName: string;

//   @ApiProperty({
//     description: 'Address of the beneficiary',
//     example: '123 Main St, City\nCountry',
//   })
//   @IsString()
//   @MaxLength(105)
//   beneficiaryAddress: string;

//   @ApiProperty({
//     description: 'Name of the beneficiary bank',
//     example: 'Jane Smith Ltd',
//   })
//   @IsString()
//   @MaxLength(35)
//   beneficiaryBankName: string;

//   @ApiProperty({
//     description: 'Address of the beneficiary bank',
//     example: '123 Main St, City\nCountry',
//   })
//   @IsString()
//   @MaxLength(105)
//   beneficiaryBankAddress: string;

//   @ApiProperty({
//     description: 'SWIFT code of the beneficiary bank',
//     example: 'BOFAUS3N',
//   })
//   @IsString()
//   beneficiaryBankSwiftCode: string;

//   @ApiProperty({
//     description: 'Name of the secondary beneficiary',
//     example: 'Jane Smith Ltd',
//   })
//   @IsString()
//   @IsOptional()
//   @MaxLength(35)
//   secondaryBeneficiaryName: string;

//   @ApiProperty({
//     description: 'Address of the secondary beneficiary',
//     example: '123 Main St, City\nCountry',
//   })
//   @IsString()
//   @IsOptional()
//   @MaxLength(105)
//   secondaryBeneficiaryAddress: string;

//   @ApiProperty({
//     description: 'Name of the secondary beneficiary bank',
//     example: 'Jane Smith Ltd',
//   })
//   @IsString()
//   @IsOptional()
//   @MaxLength(35)
//   secondaryBeneficiaryBankName: string;

//   @ApiProperty({
//     description: 'Address of the secondary beneficiary bank',
//     example: '123 Main St, City\nCountry',
//   })
//   @IsString()
//   @IsOptional()
//   @MaxLength(105)
//   secondaryBeneficiaryBankAddress: string;

//   @ApiProperty({
//     description: 'Indicates if partial transfer is allowed',
//     example: false,
//   })
//   @IsOptional()
//   @IsBoolean()
//   allowPartialTransfer: boolean;

//   @ApiProperty({
//     description: 'Number Of Transfers Allowed',
//     example: 1000,
//   })
//   @IsOptional()
//   @IsNumber()
//   numberOfTransfersAllowed: number;

//   @ApiProperty({
//     description: 'Name of the transferee',
//     example: 'Jane Smith Ltd',
//   })
//   @IsString()
//   @IsOptional()
//   @MaxLength(35)
//   transfereeName: string;

//   @ApiProperty({
//     description: 'Bank of the transferee',
//     example: 'Jane Smith Ltd',
//   })
//   @IsString()
//   @IsOptional()
//   @MaxLength(35)
//   transfereeBank: string;

//   @ApiProperty({
//     description: 'Transferee Conditional Notes',
//     example: '',
//   })
//   @IsString()
//   @IsOptional()
//   transferConditionalNotes: string;

//   @ApiProperty({
//     description: 'Address of the secondary beneficiary',
//     example: '123 Main St, City\nCountry',
//   })
//   @IsString()
//   @IsOptional()
//   transferAuthorizationDocument: string;

//   @ApiProperty({
//     description: 'Latest shipment date',
//     example: '2025-12-31',
//   })
//   @IsDateString(
//     {},
//     {
//       message:
//         'latestShipmentDate must be a valid date string (YYYY-MM-DD or ISO 8601)',
//     },
//   )
//   @IsOptional()
//   transferExpiryDate: Date;

//   @ApiProperty({
//     description: 'Corresponding bank details',
//     example: 'Bank Name, City\nCountry',
//     type: String,
//   })
//   @IsString()
//   @MaxLength(105)
//   correspondingBankName: string;

//   @ApiProperty({
//     description: 'Corresponding bank details',
//     example: 'Bank Name, City\nCountry',
//     type: String,
//   })
//   @IsString()
//   @MaxLength(105)
//   correspondingBankCode: string;

//   @ApiProperty({
//     description: 'Advising bank details',
//     example: 'Advising Bank Name, City\nCountry',
//     type: String,
//   })
//   @IsString()
//   @MaxLength(105)
//   advisingBankName: string;

//   @ApiProperty({
//     description: 'Advising bank details',
//     example: 'Advising Bank Name, City\nCountry',
//     type: String,
//   })
//   @IsString()
//   @MaxLength(105)
//   advisingBankCode: string;

//   @ApiProperty({
//     description: 'Confirming bank details',
//     example: 'Confirming Bank Name, City\nCountry',
//     type: String,
//   })
//   @IsString()
//   @MaxLength(105)
//   confirmingBank: string;

//   @ApiProperty({
//     description: 'Amount of the Letter of Credit',
//     example: 100000.5,
//   })
//   @IsNumber()
//   lcAmount: number;

//   @ApiProperty({
//     description: 'Upfront amount required to initiate the Letter of Credit',
//     example: 100000.5,
//   })
//   @IsNumber()
//   upfrontLcAmount: number;

//   @ApiProperty({
//     description: 'Cost of insuring the goods covered by the Letter of Credit',
//     example: 100000.5,
//   })
//   @IsNumber()
//   insuranceCost: number;

//   @ApiProperty({
//     description:
//       'Cost associated with storing the goods before or during shipment',
//     example: 100000.5,
//   })
//   @IsNumber()
//   storageCost: number;

//   @ApiProperty({
//     description: 'Quantity of goods',
//     example: 1000,
//   })
//   @IsNumber()
//   goodsQuantity: number;

//   @ApiProperty({
//     description: 'Type of tolerance for the Letter of Credit',
//     enum: LCToleranceTypeEnum,
//   })
//   @IsEnum(LCToleranceTypeEnum, {
//     message: `toleranceType must be one of: ${Object.values(LCToleranceTypeEnum).join(', ')}`,
//   })
//   toleranceType: LCToleranceTypeEnum = LCToleranceTypeEnum.AMOUNT;

//   @ApiProperty({
//     description: 'Quantity tolerance percentage',
//     example: 5,
//   })
//   @IsNumber()
//   @Max(10)
//   @IsOptional()
//   quantityTolerance: number;

//   @ApiProperty({
//     description: 'Amount tolerance percentage',
//     example: 5,
//   })
//   @IsNumber()
//   @Max(10)
//   @IsOptional()
//   amountTolerance: number;

//   @ApiProperty({
//     description: 'Currency of the seller',
//     example: 'USD',
//   })
//   @IsString()
//   sellerCurrency: string;

//   @ApiProperty({
//     description: 'Currency of the buyer',
//     example: 'EUR',
//   })
//   @IsString()
//   buyerCurrency: string;

//   @ApiProperty({
//     description: 'Exchange rate between buyer and seller currencies',
//     example: 1.2,
//   })
//   @IsNumber()
//   exchangeRate: number;

//   @ApiProperty({
//     description: 'Indicates if partial shipment is allowed',
//     example: false,
//   })
//   @IsBoolean()
//   partShipmentAllowed: boolean;

//   @ApiProperty({
//     description: 'Indicates if transshipment is allowed',
//     example: false,
//   })
//   @IsBoolean()
//   transShipmentAllowed: boolean;

//   @ApiProperty({
//     description: 'Description of goods',
//     example: '1000 units of electronic components',
//   })
//   @IsString()
//   @MaxLength(6500)
//   goodsDescription: string;

//   @ApiProperty({
//     description: 'Incoterms for the transaction',
//     enum: IncotermsEnum,
//   })
//   @IsEnum(IncotermsEnum, {
//     message: `incoterms must be one of: ${Object.values(IncotermsEnum).join(', ')}`,
//   })
//   incoterms: IncotermsEnum = IncotermsEnum.CIF;

//   @ApiProperty({
//     description: 'Port of loading',
//     example: 'Shanghai Port',
//   })
//   @IsString()
//   portOfLoading: string;

//   @ApiProperty({
//     description: 'Country of the port of loading',
//     example: 'China',
//   })
//   @IsString()
//   portOfLoadingCountry: string;

//   @ApiProperty({
//     description: 'Port of discharge',
//     example: 'Los Angeles Port',
//   })
//   @IsString()
//   portOfDischarge: string;

//   @ApiProperty({
//     description: 'Country of the port of discharge',
//     example: 'USA',
//   })
//   @IsString()
//   portOfDischargeCountry: string;

//   @ApiProperty({
//     description: 'Latest shipment date',
//     example: '2025-12-31',
//   })
//   @IsDateString(
//     {},
//     {
//       message:
//         'latestShipmentDate must be a valid date string (YYYY-MM-DD or ISO 8601)',
//     },
//   )
//   latestShipmentDate: Date;

//   @ApiProperty({
//     description:
//       'Number of units for documentation presentation period (e.g., 5, 10)',
//     example: 5,
//   })
//   @IsNumber()
//   documentationPresentationPeriodAmount: number;

//   @ApiProperty({
//     description: 'Unit of time for the documentation presentation period',
//     enum: TenorPeriodEnum,
//     example: TenorPeriodEnum.DAYS,
//   })
//   @IsEnum(TenorPeriodEnum, {
//     message: `documentationPresentationPeriodUnit must be one of: ${Object.values(TenorPeriodEnum).join(', ')}`,
//   })
//   documentationPresentationPeriodUnit: TenorPeriodEnum;

//   @ApiProperty({
//     description: 'Expiry date of the Letter of Credit',
//     example: '2026-01-31',
//   })
//   @IsDateString(
//     {},
//     {
//       message:
//         'expiryDate must be a valid date string (YYYY-MM-DD or ISO 8601)',
//     },
//   )
//   expiryDate: Date;

//   @ApiProperty({
//     description: 'Settlement Account Type',
//     enum: SettlementAccountTypeEnum,
//   })
//   @IsEnum(SettlementAccountTypeEnum, {
//     message: `settlementAccountType must be one of: ${Object.values(SettlementAccountTypeEnum).join(', ')}`,
//   })
//   settlementAccountType: SettlementAccountTypeEnum =
//     SettlementAccountTypeEnum.INTERNAL;

//   @ApiProperty({
//     description: 'Settlement account number',
//     example: '9876543210',
//   })
//   @IsString()
//   @IsOptional()
//   settlementAccount: string;

//   @ApiProperty({
//     description: 'Relationship Officer',
//     example: 'xyz@testmail.com',
//   })
//   @IsString()
//   @IsOptional()
//   relationshipOfficer: string;

//   @ApiProperty({
//     description: 'Name of the external bank',
//     example: 'External Bank Ltd',
//   })
//   @IsString()
//   @IsOptional()
//   externalBankName: string;

//   @ApiProperty({
//     description: 'Branch of the external bank',
//     example: 'Main Branch',
//   })
//   @IsString()
//   @IsOptional()
//   externalBankBranch: string;

//   @ApiProperty({
//     description: 'Account name at the external bank',
//     example: 'John Doe Corp',
//   })
//   @IsString()
//   @IsOptional()
//   externalBankAccountName: string;

//   @ApiProperty({
//     description: 'Account number at the external bank',
//     example: '1122334455',
//   })
//   @IsString()
//   @IsOptional()
//   externalBankAccountNumber: string;

//   @ApiProperty({
//     description: 'Currency of the external bank account',
//     example: 'USD',
//   })
//   @IsString()
//   @IsOptional()
//   externalBankAccountCurrency: string;

//   @ApiProperty({
//     description: 'Additional conditions',
//     example: 'Subject to inspection',
//   })
//   @IsString()
//   @MaxLength(780, {
//     message:
//       'Documents Required character length can not be longer than 780. 12 rows with each row having a max of 65 characters. carriage return (\\r) and new line (\\n) characters exclusive (at the end of each line except the last line).',
//   })
//   @IsValidLcTextField(100, 65)
//   @IsOptional()
//   documentsRequired?: string;

//   @ApiProperty({
//     description: 'Additional conditions',
//     example: 'Subject to inspection',
//   })
//   @IsString()
//   @MaxLength(6500, {
//     message:
//       'Additional Conditions character length can not be longer than 6500. 100 rows with each row having a max of 65 characters. carriage return (\\r) and new line (\\n) characters exclusive (at the end of each line except the last line).',
//   })
//   @IsValidLcTextField(100, 65)
//   @IsOptional()
//   additionalConditions?: string;

//   @ApiProperty({
//     description: 'Instructions to paying bank',
//     example: 'Pay on due date',
//   })
//   @IsString()
//   @MaxLength(780, {
//     message:
//       'Instructions to the Paying/Accepting/Negotiating Bank character length can not be longer than 780. 12 rows with each row having a max of 65 characters. carriage return (\\r) and new line (\\n) characters exclusive (at the end of each line except the last line).',
//   })
//   @IsValidLcTextField(12, 65)
//   instructionsToThePayingAcceptingNegotiatingBank?: string;
// }
