import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class AccountDto {
  @ApiProperty({
    description: 'The account number',
    example: '77APQ00010A255',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({
    description: 'Currency code of the account',
    example: 'NGN',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  currencyCode: string;
}

export class ValidateTradeJournalPostingDto {
  @ApiProperty({
    description: 'Indicates if debit and credit use same currency',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @IsNotEmpty()
  isSameCurrency: boolean;

  @ApiProperty({
    description: 'Debit account details',
    type: AccountDto,
  })
  @ValidateNested()
  @Type(() => AccountDto)
  @IsNotEmpty()
  debitAccount: AccountDto;

  @ApiProperty({
    description: 'Credit account details',
    type: AccountDto,
  })
  @ValidateNested()
  @Type(() => AccountDto)
  @IsNotEmpty()
  creditAccount: AccountDto;

  @ApiProperty({
    description: 'The transaction amount',
    example: 900,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  transactionAmount: number;

  @ApiProperty({
    description: 'Value date of the transaction',
    example: '2024-08-16',
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
}
