import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  GuaranteesPaymentAvailableByEnum,
  GuaranteesTenorStartBoundaryEnum,
  PaymentActionTypeEnum,
  TenorPeriodEnum,
} from 'src/common/enums';

export class GuaranteesMixedPaymentDetailsDto {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  amountCurrency: string;

  @ApiProperty({ enum: PaymentActionTypeEnum })
  @IsEnum(PaymentActionTypeEnum)
  paymentAction: PaymentActionTypeEnum;

  @ApiProperty({ enum: GuaranteesPaymentAvailableByEnum })
  @IsEnum(GuaranteesPaymentAvailableByEnum)
  availableBy: GuaranteesPaymentAvailableByEnum;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsDateString()
  valueDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  availableByPeriod?: number;

  @ApiPropertyOptional({ enum: TenorPeriodEnum })
  @IsOptional()
  @IsEnum(TenorPeriodEnum)
  availableByPeriodUnit?: TenorPeriodEnum;

  @ApiPropertyOptional({ enum: GuaranteesTenorStartBoundaryEnum })
  @IsOptional()
  @IsEnum(GuaranteesTenorStartBoundaryEnum)
  tenorStartBoundary?: GuaranteesTenorStartBoundaryEnum;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  startDate?: Date;
}
