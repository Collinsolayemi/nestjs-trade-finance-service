import { ApiProperty } from '@nestjs/swagger';
import { IsBooleanString, IsNotEmpty, IsString } from 'class-validator';

export class ValidateAccountAccessDto {
  @ApiProperty({
    description: 'Indicates if account is designated for debit or credit field',
    example: true,
    type: Boolean,
  })
  @IsBooleanString()
  @IsNotEmpty()
  isDebit: boolean;

  @ApiProperty({
    description: 'Account Currency Code',
    example: 'NGN',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  currencyCode: string;

  @ApiProperty({
    description: 'The account number',
    example: '25432NGN0016S012',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;
}
