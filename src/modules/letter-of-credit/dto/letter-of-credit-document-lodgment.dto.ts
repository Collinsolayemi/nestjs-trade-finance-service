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
  SourceOfFundsEnum,
  SetTypeEnum,
  ScanningAgentEnum,
} from 'src/common/enums';
import { UserDetails } from 'src/common/types';
import { LetterOfCreditDocumentUploadDto } from './letter-of-credit-document-upload.dto';

export class LetterOfCreditDocumentLodgmentDto extends UserDetails {
  @IsUUID()
  @IsOptional()
  requestId?: string;

  @ApiProperty({
    description: 'Action type of the Letter of Credit',
    example: LetterOfCreditActionTypeEnum.DOCUMENT_LODGEMENT,
  })
  @IsEnum([LetterOfCreditActionTypeEnum.DOCUMENT_LODGEMENT])
  letterOfCreditActionType: LetterOfCreditActionTypeEnum.DOCUMENT_LODGEMENT =
    LetterOfCreditActionTypeEnum.DOCUMENT_LODGEMENT;

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
    description: 'LC amount',
    example: 100000,
  })
  @IsOptional()
  @IsNumber()
  lcAmount?: number;

  @ApiPropertyOptional({
    description: 'Bank name from which documents were received',
    example: 'Global Bank',
  })
  @IsOptional()
  @IsString()
  receivedFromBankName?: string;

  @ApiPropertyOptional({
    description: 'BIC code of bank from which documents were received',
    example: 'GBANKXXX',
  })
  @IsOptional()
  @IsString()
  receivedFromBankBicCode?: string;

  @ApiPropertyOptional({
    description: 'Address of bank from which documents were received',
    example: '123 Bank Street, New York, NY',
  })
  @IsOptional()
  @IsString()
  receivedFromBankAddress?: string;

  @ApiPropertyOptional({
    description: 'Document amount',
    example: '95000.00',
  })
  @IsOptional()
  @IsString()
  documentAmount?: string;

  @ApiPropertyOptional({
    description: 'Document amount currency',
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  documentAmountCurrency?: string;

  @ApiPropertyOptional({
    description: 'Source of funds',
    enum: SourceOfFundsEnum,
  })
  @IsOptional()
  @IsEnum(SourceOfFundsEnum)
  sourceOfFunds?: SourceOfFundsEnum;

  @ApiPropertyOptional({
    description: 'Set type',
    enum: SetTypeEnum,
  })
  @IsOptional()
  @IsEnum(SetTypeEnum)
  setType?: SetTypeEnum;

  @ApiPropertyOptional({
    description: 'Number of copies',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  numberOfCopies?: number;

  @ApiPropertyOptional({
    description: 'Date documents were received',
    example: '2025-10-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dateReceived?: Date;

  @ApiPropertyOptional({
    description: 'Presentation date',
    example: '2025-10-05T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  presentationDate?: Date;

  @ApiPropertyOptional({
    description: 'Courier name',
    example: 'DHL Express',
  })
  @IsOptional()
  @IsString()
  courierName?: string;

  @ApiPropertyOptional({
    description: 'Courier tracking number',
    example: 'DHL123456789',
  })
  @IsOptional()
  @IsString()
  courierNumber?: string;

  @ApiPropertyOptional({
    description: 'Scanning agent',
    enum: ScanningAgentEnum,
  })
  @IsOptional()
  @IsEnum(ScanningAgentEnum)
  scanningAgent?: ScanningAgentEnum;

  @ApiPropertyOptional({
    description: 'Invoice number',
    example: 'INV-2024-001',
  })
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiPropertyOptional({
    description: 'Invoice date',
    example: '2025-09-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  invoiceDate?: Date;

  @ApiPropertyOptional({
    description: 'Sectoral classification',
    example: 'Manufacturing',
  })
  @IsOptional()
  @IsString()
  sectoralClassification?: string;

  @ApiPropertyOptional({
    description: 'Product classification',
    example: 'Industrial Equipment',
  })
  @IsOptional()
  @IsString()
  productClassification?: string;

  @ApiPropertyOptional({
    description: 'Description of goods/documents',
    example: 'Heavy machinery parts for industrial use',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Bill of Exchange (BOE) number',
    example: 'BOE-2024-001',
  })
  @IsOptional()
  @IsString()
  boeNumber?: string;

  @ApiPropertyOptional({
    description: 'Bill of Exchange issue date',
    example: '2025-09-20T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  boeIssueDate?: Date;

  @ApiPropertyOptional({
    description: 'Tenor start date',
    example: '2025-09-20T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  tenorStartDate?: Date;

  @ApiPropertyOptional({
    description: 'Tenor maturity date',
    example: '2025-12-20T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  tenorMaturityDate?: Date;

  @ApiPropertyOptional({
    description: 'Payment instruction',
    example: 'Pay at sight upon presentation of compliant documents',
  })
  @IsOptional()
  @IsString()
  paymentInstruction?: string;

  @ApiPropertyOptional({
    description: 'PAAR (Post Acceptance Acceptance Request) flag',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  paar?: boolean;

  @ApiPropertyOptional({
    description: 'PAAR reference number',
    example: 'PAAR123456',
  })
  @IsOptional()
  @IsString()
  paarReferenceNumber?: string;

  @ApiPropertyOptional({
    description: 'PAAR Due date',
    example: '2025-12-20T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  paarDueDate?: Date;

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
