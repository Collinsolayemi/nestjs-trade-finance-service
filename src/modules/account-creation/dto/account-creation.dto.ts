import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';
import { UserDetails } from 'src/common/types';

export class CreateAccountDto extends UserDetails {
  @ApiProperty({ description: 'Type of the account', example: 'Savings' })
  @IsString()
  accountType: string;

  @ApiProperty({
    description: 'Indicates if debit is preferred',
    example: true,
  })
  @IsBoolean()
  preferredDebit: boolean;

  @ApiProperty({
    description: 'Indicates if credit is preferred',
    example: false,
  })
  @IsBoolean()
  preferredCredit: boolean;

  @ApiProperty({
    description: 'Customer associated with the account',
    example: 'John Doe',
  })
  @IsString()
  accountCustomer: string;

  @ApiProperty({ description: 'Currency of the account', example: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Unique account number', example: '1234567890' })
  @IsString()
  accountNumber: string;

  @ApiProperty({
    description: 'International Bank Account Number (IBAN)',
    example: 'GB29NWBK60161331926819',
  })
  @IsString()
  ibanNumber: string;

  @ApiProperty({
    description: 'External account identifier',
    example: 'EXT-987654321',
  })
  @IsString()
  externalAccount: string;

  @ApiProperty({ description: 'Status of the account', example: true })
  @IsBoolean()
  status: boolean;
}

export class CreateAccountTypeDto extends UserDetails {
  @ApiProperty({ description: 'Name of the account type', example: 'Business' })
  @IsString()
  accountTypeName: string;

  @ApiProperty({
    description: 'Ledger category of the account type',
    example: 'Liabilities',
  })
  @IsString()
  ledgerCategory: string;

  @ApiProperty({
    description: 'Indicates if the account type is contingent',
    example: false,
  })
  @IsBoolean()
  contingent: boolean;

  @ApiProperty({
    description: 'Indicates if the account type is internal',
    example: true,
  })
  @IsBoolean()
  internal: boolean;

  @ApiProperty({ description: 'Status of the account type', example: true })
  @IsBoolean()
  status: boolean;
}
