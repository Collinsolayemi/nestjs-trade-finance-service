import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreditAvailableByEnum } from 'src/common/enums';

export class PaymentActionMultiplePaymentDto {
  @ApiProperty({
    description: 'Credit available by',
    example: CreditAvailableByEnum.BY_ACCEPTANCE,
  })
  @IsEnum(CreditAvailableByEnum)
  creditAvailableBy: CreditAvailableByEnum =
    CreditAvailableByEnum.BY_ACCEPTANCE;

  @ApiProperty({
    example: 'USD',
  })
  @IsString()
  payAmountCurrency: string;

  @ApiProperty({
    example: 100,
  })
  @IsNumber()
  payAmount: number;

  @ApiPropertyOptional({
    description: 'Return date',
    example: '2025-12-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  paymentDate?: Date;

  @ApiPropertyOptional({
    example: 'Narration',
  })
  @IsOptional()
  @IsString()
  narration?: string;
}
