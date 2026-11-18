import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  MaxLength,
} from 'class-validator';
import {
  LetterOfCreditActionTypeEnum,
  NegotiationSourceOfFundsEnum,
  ProductClassificationEnum,
  ScanningAgentEnum,
  SectoralClassificationEnum,
  SetTypeEnum,
} from 'src/common/enums';
import { UserDetails } from 'src/common/types';

export class NegotiateLetterOfCreditDto extends UserDetails {
  @ApiProperty({
    description: 'Action type of the Letter of Credit',
    example: LetterOfCreditActionTypeEnum.NEGOTIATION,
  })
  @IsEnum(LetterOfCreditActionTypeEnum)
  letterOfCreditActionType: LetterOfCreditActionTypeEnum =
    LetterOfCreditActionTypeEnum.NEGOTIATION;

  @ApiProperty({ description: 'LC Reference Number', example: 'LC123456789' })
  @IsString()
  lcReferenceNumber: string;

  @ApiProperty({
    description: 'LC Related Reference Number',
    example: 'LC987654321',
  })
  @IsString()
  @IsOptional()
  lcRelatedReferenceNumber?: string;

  @ApiProperty({ description: 'Applicant Name', example: 'John Doe' })
  @IsString()
  applicantName: string;

  @ApiProperty({ description: 'LC Amount', example: 1000000.0 })
  @IsNumber()
  lcAmount: number;

  @ApiProperty({
    description: 'LC CUrrency Code',
    example: 'USD',
  })
  @IsString()
  lcCurrencyCode: string;

  @ApiProperty({
    description: 'Received From Bank BIC Code',
    example: 'BANKBICXXX',
  })
  @IsString()
  receivedFromBankBicCode: string;

  @ApiProperty({ description: 'Advising Bank Name', example: 'XYZ Bank' })
  @IsString()
  advisingBankName: string;

  @ApiProperty({
    description: 'Advising Bank Address',
    example: '123 Finance Street',
  })
  @IsString()
  advisingBankAddress: string;

  @ApiProperty({ description: 'Document Amount', example: '500000.00' })
  @IsString()
  documentAmount: string;

  @ApiProperty({
    description: 'Source of Funds',
    enum: NegotiationSourceOfFundsEnum,
  })
  @IsEnum(NegotiationSourceOfFundsEnum)
  sourceOfFunds: NegotiationSourceOfFundsEnum;

  @ApiProperty({ description: 'Shipment Type', example: 'Air' })
  @IsString()
  shipmentType: string;

  @ApiProperty({ description: 'Set Type', enum: SetTypeEnum })
  @IsEnum(SetTypeEnum)
  setType: SetTypeEnum;

  @ApiProperty({ description: 'Received Date', example: '2023-06-15' })
  @IsDateString()
  receivedDate: Date;

  @ApiProperty({ description: 'Presentation Date', example: '2023-06-20' })
  @IsDateString()
  presentationDate: Date;

  @ApiProperty({ description: 'Number of Copies', example: '3' })
  @IsString()
  numberOfCopies: string;

  @ApiProperty({ description: 'Courier Name', example: 'DHL' })
  @IsString()
  courierName: string;

  @ApiProperty({ description: 'Courier Number', example: '123456789' })
  @IsString()
  @MaxLength(39)
  courierNumber: string;

  @ApiProperty({ description: 'Scanning Agent', enum: ScanningAgentEnum })
  @IsEnum(ScanningAgentEnum)
  scanningAgent: ScanningAgentEnum;

  @ApiProperty({ description: 'Invoice Number', example: 'INV123456' })
  @IsString()
  @MaxLength(39)
  invoiceNumber: string;

  @ApiProperty({ description: 'Invoice Date', example: '2023-06-10' })
  @IsDateString()
  invoiceDate: Date;

  @ApiProperty({
    description: 'Sectoral Classification',
    enum: SectoralClassificationEnum,
  })
  @IsEnum(SectoralClassificationEnum)
  sectoralClassification: SectoralClassificationEnum;

  @ApiProperty({
    description: 'Product Classification',
    enum: ProductClassificationEnum,
  })
  @IsEnum(ProductClassificationEnum)
  productClassification: ProductClassificationEnum;

  @ApiProperty({ description: 'BOE Number', example: 'BOE987654' })
  @IsString()
  @MaxLength(39)
  boeNumber: string;

  @ApiProperty({ description: 'BOE Issue Date', example: '2023-06-05' })
  @IsDateString()
  boeIssueDate: Date;

  @ApiProperty({ description: 'Tenor Start Date', example: '2023-06-25' })
  @IsDateString()
  tenorStartDate: Date;

  @ApiProperty({ description: 'Tenor Maturity Date', example: '2023-12-25' })
  @IsDateString()
  tenorMaturityDate: Date;

  @ApiProperty({
    description: 'Description',
    example: 'Negotiation of export LC',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Payment Instruction',
    example: 'Payment to beneficiary account',
  })
  @IsString()
  paymentInstruction: string;

  @ApiProperty({
    description: 'Document Attachments',
    example: [
      { fileName: 'invoice.pdf', url: 'https://example.com/invoice.pdf' },
    ],
  })
  @IsArray()
  @IsOptional()
  documentAttachments?: object[];
}
