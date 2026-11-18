import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString } from 'class-validator';

export class MixedPaymentDto {
  @ApiProperty({
    description: 'Payment date of the letter of credit',
    example: '2023-09-15',
  })
  @IsDateString(
    {},
    {
      message:
        'paymentDate must be a valid date string (YYYY-MM-DD or ISO 8601)',
    },
  )
  paymentDate: Date;

  @ApiProperty({
    description: 'Confirmation Amount',
    example: 950000.0,
  })
  @IsNumber()
  paymentAmount: number;

  @ApiProperty({
    description: 'Confirmation instruction',
    example: 'Method Provided',
  })
  @IsString()
  paymentMethod: string;
}
