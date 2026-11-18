import {
  IsString,
  IsBoolean,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TradeJournalPostingTypeEnum } from 'src/common/enums';
import { UserDetails } from 'src/common/types';

export class InitiateTradeJournalPostingDto extends UserDetails {
  @ApiProperty({
    description: 'The debit account number',
    example: 'ACC123456',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  debitAccountNo: string;

  @ApiProperty({
    description: 'Name of the debit account',
    example: 'Main Checking Account',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  debitAccountName: string;

  @ApiProperty({
    description: 'The credit account number',
    example: 'ACC789012',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  creditAccountNo: string;

  @ApiProperty({
    description: 'Name of the credit account',
    example: 'Revenue Account',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  creditAccountName: string;

  @ApiProperty({
    description: 'The amount to be posted',
    example: 1000.5,
    type: Number,
  })
  @IsNumber()
  postingAmount: number;

  @ApiProperty({
    description: 'Currency code for debit account',
    example: 'USD',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  debitCurrencyCode: string;

  @ApiProperty({
    description: 'Indicates if debit and credit use same currency',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  isSameCurrency: boolean;

  @ApiProperty({
    description: 'Currency code for credit account',
    example: 'USD',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  creditCurrencyCode: string;

  @ApiProperty({
    description: 'Description of the posting',
    example: 'Monthly revenue posting',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  postingNarration: string;

  @ApiProperty({
    description: 'Unique reference identifier',
    example: 'TS2501281507c92f',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  referenceId: string;

  @ApiProperty({
    description: 'Value date of the posting',
    example: '2023-03-23',
    type: String,
    format: 'date',
  })
  @IsDateString(
    {},
    {
      message: 'valueDate must be a valid date string (YYYY-MM-DD or ISO 8601)',
    },
  )
  @IsNotEmpty()
  valueDate: Date;

  @ApiPropertyOptional({
    description: 'Optional charge identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  chargeId?: string;

  @ApiPropertyOptional({
    description: 'Optional tax identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  taxId?: string;

  @ApiProperty({
    description: 'URL of supporting document',
    example: 'https://storage.example.com/docs/doc1.pdf',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  supportingDocumentUrl: string;

  @ApiPropertyOptional({
    description: 'Indicates if the posting is a draft',
    example: false,
    type: Boolean,
    default: false,
  })
  @IsBoolean()
  isDraft: boolean;

  @ApiProperty({
    description: 'Type of transaction',
    enum: TradeJournalPostingTypeEnum,
    default: TradeJournalPostingTypeEnum.SINGLE,
  })
  @IsEnum(TradeJournalPostingTypeEnum)
  transactionType: TradeJournalPostingTypeEnum =
    TradeJournalPostingTypeEnum.SINGLE;
}
