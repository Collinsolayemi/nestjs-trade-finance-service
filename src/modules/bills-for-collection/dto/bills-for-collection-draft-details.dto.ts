import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  BillsForCollectionAgainstDocumentTypeEnum,
  BillsForCollectionDraftAgainstEnum,
  TenorPeriodEnum,
} from 'src/common/enums';

export class BillsForCollectionDraftDetailsDto {
  @ApiProperty()
  @IsNumber()
  draftAmount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  draftAmountCurrency?: string;

  @ApiProperty({ enum: BillsForCollectionDraftAgainstEnum })
  @IsEnum(BillsForCollectionDraftAgainstEnum)
  draftAgainst: BillsForCollectionDraftAgainstEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  draftIdentifier?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  draftText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  preAccepted?: boolean;

  @ApiProperty({ enum: TenorPeriodEnum })
  @IsEnum(TenorPeriodEnum)
  tenor: TenorPeriodEnum;

  @ApiProperty({ enum: BillsForCollectionAgainstDocumentTypeEnum })
  @IsEnum(BillsForCollectionAgainstDocumentTypeEnum)
  against: BillsForCollectionAgainstDocumentTypeEnum;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsDateString()
  maturityDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  interestAndDiscountSetup?: boolean;
}
