import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  MaxLength,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  LetterOfCreditActionTypeEnum,
  CreditAvailableByEnum,
  ConfirmationInstructionEnum,
  RequestedConfirmationPartyEnum,
  PaymentTransferMethodEnum,
  PaymentActionTypeEnum,
  DocumentDisposalEnum,
} from 'src/common/enums';
import { UserDetails } from 'src/common/types';
import { LetterOfCreditDocumentUploadDto } from './letter-of-credit-document-upload.dto';
import { PaymentActionMultiplePaymentDto } from './payment-action-multiple-payment.dto';

export class LetterOfCreditPaymentDto extends UserDetails {
  @IsUUID()
  @IsOptional()
  requestId?: string;

  @ApiProperty({
    description: 'Action type of the Letter of Credit',
    example: LetterOfCreditActionTypeEnum.PAYMENT,
  })
  @IsEnum([LetterOfCreditActionTypeEnum.PAYMENT])
  letterOfCreditActionType: LetterOfCreditActionTypeEnum.PAYMENT =
    LetterOfCreditActionTypeEnum.PAYMENT;

  @ApiProperty({
    description: 'LC Reference Number (max 16 characters)',
    example: 'LC2024001',
  })
  @IsString()
  @MaxLength(16, {
    message: 'LC Reference Number character length can not be longer than 16',
  })
  lcReferenceNumber: string;

  @ApiPropertyOptional({
    description: 'Related reference',
    example: 'REF123456',
  })
  @IsOptional()
  @IsString()
  relatedReference?: string;

  @ApiPropertyOptional({
    description: 'Applicant name',
    example: 'ABC Corporation',
  })
  @IsOptional()
  @IsString()
  applicantName?: string;

  @ApiPropertyOptional({
    description: 'Expiry date of the LC',
    example: '2025-12-31T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @ApiPropertyOptional({
    description: 'LC amount',
    example: '100000.00',
  })
  @IsOptional()
  @IsNumber()
  lcAmount?: number;

  @ApiPropertyOptional({
    description: 'Credit available by',
    enum: CreditAvailableByEnum,
  })
  @IsOptional()
  @IsEnum(CreditAvailableByEnum)
  creditAvailableBy?: CreditAvailableByEnum;

  @ApiPropertyOptional({
    description: 'Confirmation instruction',
    enum: ConfirmationInstructionEnum,
  })
  @IsOptional()
  @IsEnum(ConfirmationInstructionEnum)
  confirmationInstruction?: ConfirmationInstructionEnum;

  @ApiPropertyOptional({
    description: 'Confirmation amount',
    example: 50000.0,
  })
  @IsOptional()
  @IsNumber()
  confirmationAmount?: number;

  @ApiPropertyOptional({
    description: 'Requested confirmation party',
    enum: RequestedConfirmationPartyEnum,
  })
  @IsOptional()
  @IsEnum(RequestedConfirmationPartyEnum)
  requestedConfirmationParty?: RequestedConfirmationPartyEnum;

  @ApiPropertyOptional({
    description: 'Bank name from which payment was received',
    example: 'Global Bank',
  })
  @IsOptional()
  @IsString()
  receivedFromBankName?: string;

  @ApiPropertyOptional({
    description: 'BIC code of bank from which payment was received',
    example: 'GBANKXXX',
  })
  @IsOptional()
  @IsString()
  receivedFromBankBicCode?: string;

  @ApiPropertyOptional({
    description: 'Address of bank from which payment was received',
    example: '123 Bank Street, New York, NY',
  })
  @IsOptional()
  @IsString()
  receivedFromBankAddress?: string;

  @ApiPropertyOptional({
    description: "Presenter's action",
    example: 'Document presentation',
  })
  @IsOptional()
  @IsString()
  presentersAction?: string;

  @ApiPropertyOptional({
    description: 'Presentation amount currency',
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  presentationAmountCurrency?: string;

  @ApiPropertyOptional({
    description: 'Presentation amount',
    example: 95000.0,
  })
  @IsOptional()
  @IsNumber()
  presentationAmount?: number;

  @ApiPropertyOptional({
    description: 'Additional amount currency',
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  additionalAmountCurrency?: string;

  @ApiPropertyOptional({
    description: 'Additional amount',
    example: 5000.0,
  })
  @IsOptional()
  @IsNumber()
  additionalAmount?: number;

  @ApiPropertyOptional({
    description: 'Total claimed amount currency',
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  totalClaimedAmountCurrency?: string;

  @ApiPropertyOptional({
    description: 'Total claimed amount',
    example: 100000.0,
  })
  @IsOptional()
  @IsNumber()
  totalClaimedAmount?: number;

  @ApiPropertyOptional({
    description: 'Charges added currency',
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  chargesAddedCurrency?: string;

  @ApiPropertyOptional({
    description: 'Charges added amount',
    example: 500.0,
  })
  @IsOptional()
  @IsNumber()
  chargesAddedAmount?: number;

  @ApiPropertyOptional({
    description: 'Charges deducted currency',
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  chargesDeductedCurrency?: string;

  @ApiPropertyOptional({
    description: 'Charges deducted amount',
    example: 250.0,
  })
  @IsOptional()
  @IsNumber()
  chargesDeductedAmount?: number;

  @ApiPropertyOptional({
    description: 'Payment due date',
    example: '2025-11-30T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  paymentDueDate?: Date;

  @ApiPropertyOptional({
    description: 'Charge due date',
    example: '2025-11-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  chargeDueDate?: Date;

  @ApiPropertyOptional({
    description: 'Discrepancies found',
    example: 'Missing invoice date',
  })
  @IsOptional()
  @IsString()
  discrepancies?: string;

  @ApiPropertyOptional({
    description: 'Payment transfer method',
    enum: PaymentTransferMethodEnum,
  })
  @IsOptional()
  @IsEnum(PaymentTransferMethodEnum)
  paymentTransferMethod?: PaymentTransferMethodEnum;

  @ApiPropertyOptional({
    description: 'Payment action type',
    enum: PaymentActionTypeEnum,
  })
  @IsOptional()
  @IsEnum(PaymentActionTypeEnum)
  paymentActionType?: PaymentActionTypeEnum;

  @ApiPropertyOptional({
    description: 'Loan or financing ID',
    example: 'LOAN123456',
  })
  @IsOptional()
  @IsString()
  loanOrFinancingId?: string;

  @ApiPropertyOptional({
    description: 'Pay amount currency',
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  payAmountCurrency?: string;

  @ApiPropertyOptional({
    description: 'Pay amount',
    example: 99750.0,
  })
  @IsOptional()
  @IsNumber()
  payAmount?: number;

  @ApiPropertyOptional({
    description: 'Multiple payment details',
    type: [PaymentActionMultiplePaymentDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentActionMultiplePaymentDto)
  paymentDetails?: PaymentActionMultiplePaymentDto[];

  @ApiPropertyOptional({
    description: 'Return date',
    example: '2025-12-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  returnDate?: Date;

  @ApiPropertyOptional({
    description: 'Payment action discrepancies',
    example: 'Document corrections required',
  })
  @IsOptional()
  @IsString()
  paymentActionDiscrepancies?: string;

  @ApiPropertyOptional({
    description: 'Document disposal method',
    enum: DocumentDisposalEnum,
  })
  @IsOptional()
  @IsEnum(DocumentDisposalEnum)
  documentDisposal?: DocumentDisposalEnum;

  @ApiPropertyOptional({
    description: "Sender's correspondent BIC code",
    example: 'SCORBXXX',
  })
  @IsOptional()
  @IsString()
  sendersCorrespondentBicCode?: string;

  @ApiPropertyOptional({
    description: "Sender's correspondent bank name (max 35 characters)",
    example: 'Sender Correspondent Bank',
  })
  @IsOptional()
  @IsString()
  @MaxLength(35, {
    message:
      "Sender's Correspondent Bank Name character length can not be longer than 35",
  })
  sendersCorrespondentBankName?: string;

  @ApiPropertyOptional({
    description:
      "Sender's correspondent address (max 105 characters - 3 rows of 35 chars)",
    example: '123 Sender Street\r\nNew York, NY 10001\r\nUSA',
  })
  @IsOptional()
  @IsString()
  @MaxLength(105, {
    message:
      "Sender's Correspondent Bank Address character length can not be longer than 105",
  })
  sendersCorrespondentAddress?: string;

  @ApiPropertyOptional({
    description: "Sender's correspondent account",
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  sendersCorrespondentAccount?: string;

  @ApiPropertyOptional({
    description: "Sender's correspondent account currency",
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  sendersCorrespondentAccountCurrency?: string;

  @ApiPropertyOptional({
    description: "Receiver's correspondent BIC code",
    example: 'RCORBXXX',
  })
  @IsOptional()
  @IsString()
  receiversCorrespondentBicCode?: string;

  @ApiPropertyOptional({
    description: "Receiver's correspondent bank name (max 35 characters)",
    example: 'Receiver Correspondent Bank',
  })
  @IsOptional()
  @IsString()
  @MaxLength(35, {
    message:
      "Receiver's Correspondent Bank Name character length can not be longer than 35",
  })
  receiversCorrespondentBankName?: string;

  @ApiPropertyOptional({
    description:
      "Receiver's correspondent address (max 105 characters - 3 rows of 35 chars)",
    example: '456 Receiver Avenue\r\nLondon, EC1A 1BB\r\nUK',
  })
  @IsOptional()
  @IsString()
  @MaxLength(105, {
    message:
      "Receiver's Correspondent Bank Address character length can not be longer than 105",
  })
  receiversCorrespondentAddress?: string;

  @ApiPropertyOptional({
    description: "Receiver's correspondent account",
    example: '0987654321',
  })
  @IsOptional()
  @IsString()
  receiversCorrespondentAccount?: string;

  @ApiPropertyOptional({
    description: "Receiver's correspondent account currency",
    example: 'GBP',
  })
  @IsOptional()
  @IsString()
  receiversCorrespondentAccountCurrency?: string;

  @ApiPropertyOptional({
    description: 'Account with bank BIC code',
    example: 'ACWBXXX',
  })
  @IsOptional()
  @IsString()
  accountWithBankBicCode?: string;

  @ApiPropertyOptional({
    description: 'Account with bank name (max 35 characters)',
    example: 'Account With Bank Ltd',
  })
  @IsOptional()
  @IsString()
  @MaxLength(35, {
    message:
      'Account with Institution Bank Name character length can not be longer than 35',
  })
  accountWithBankName?: string;

  @ApiPropertyOptional({
    description:
      'Account with bank address (max 105 characters - 3 rows of 35 chars)',
    example: '789 Bank Plaza\r\nTokyo, 100-0001\r\nJapan',
  })
  @IsOptional()
  @IsString()
  @MaxLength(105, {
    message:
      'Account with Institution Bank Address character length can not be longer than 105',
  })
  accountWithBankAddress?: string;

  @ApiPropertyOptional({
    description: 'Account with bank account number',
    example: '1122334455',
  })
  @IsOptional()
  @IsString()
  accountWithBankAccount?: string;

  @ApiPropertyOptional({
    description: 'Account with bank account currency',
    example: 'JPY',
  })
  @IsOptional()
  @IsString()
  accountWithBankAccountCurrency?: string;

  @ApiPropertyOptional({
    description: 'Sender to receiver information',
    example: 'Payment for invoice INV-2024-001',
  })
  @IsOptional()
  @IsString()
  senderToReceiverInformation?: string;

  @ApiPropertyOptional({
    description: 'Narrative/additional information',
    example: 'Documents compliant with LC terms',
  })
  @IsOptional()
  @IsString()
  narrative?: string;

  @ApiPropertyOptional({
    description: 'Document attachments',
    type: [LetterOfCreditDocumentUploadDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LetterOfCreditDocumentUploadDto)
  documentAttachments?: LetterOfCreditDocumentUploadDto[];

  @ApiPropertyOptional({
    description: 'Whether previously a draft',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}
