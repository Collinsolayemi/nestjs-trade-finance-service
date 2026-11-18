import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class BillsForCollectionDraftPaymentDetailsDto {
  @ApiProperty()
  @IsNumber()
  draftAmount: number;

  @ApiProperty()
  @IsString()
  draftAmountCurrency: string;

  @ApiProperty()
  @IsNumber()
  outstandingAmount: number;

  @ApiProperty()
  @IsString()
  outstandingAmountCurrency: string;

  @ApiProperty()
  @IsNumber()
  toCollectAmount: number;

  @ApiProperty()
  @IsString()
  toCollectAmountCurrency: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsDateString()
  dueDate: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsDateString()
  valueDue: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  earlyDiscountAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  earlyDiscountAmountCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  earlyDiscountPercentage?: number;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  discountCutOffDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lateInterestRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lateInterestAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lateInterestAmountCurrency?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  lateInterestFromDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  marginAmountUsed?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  marginAmountUsedCurrency?: string;
}
