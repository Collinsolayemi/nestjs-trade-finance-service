import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNumber } from 'class-validator';
import {
  GuaranteesAvailableByEnum,
  GuaranteesTenorStartBoundaryEnum,
  TenorPeriodEnum,
} from 'src/common/enums';

export class GuaranteesAvailableByMixedPaymentDetailsDto {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: GuaranteesAvailableByEnum })
  @IsEnum(GuaranteesAvailableByEnum)
  availableBy: GuaranteesAvailableByEnum;

  @ApiProperty()
  @IsInt()
  availableByPeriod: number;

  @ApiProperty({ enum: TenorPeriodEnum })
  @IsEnum(TenorPeriodEnum)
  availableByPeriodUnit: TenorPeriodEnum;

  @ApiProperty({ enum: GuaranteesTenorStartBoundaryEnum })
  @IsEnum(GuaranteesTenorStartBoundaryEnum)
  tenorStartBoundary: GuaranteesTenorStartBoundaryEnum;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsDateString()
  startDate: Date;
}
