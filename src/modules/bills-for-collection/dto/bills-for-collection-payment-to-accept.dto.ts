import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { BillsForCollectionAcceptanceEnum } from 'src/common/enums';

export class BillsForCollectionPaymentToAcceptDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  draftIdentifier?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsDateString()
  baseDate: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsDateString()
  maturityDate: Date;

  @ApiProperty({ enum: BillsForCollectionAcceptanceEnum })
  @IsEnum(BillsForCollectionAcceptanceEnum)
  acceptance: BillsForCollectionAcceptanceEnum;
}
