import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCreditLineDraftDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  creditLineName: string;

  @ApiProperty({ example: 'NGN' })
  @IsString()
  @IsOptional()
  currencyCode?: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  counterparty?: string;

  @ApiProperty({ example: 0.0 })
  @IsNumber()
  @IsOptional()
  confirmationLineAmount?: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  costOfFundRate?: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  marginRate?: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  totalInterestRate?: number;
}
