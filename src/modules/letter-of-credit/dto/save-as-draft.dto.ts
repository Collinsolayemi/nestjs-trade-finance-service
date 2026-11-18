import {
  IsEnum,
  IsOptional,
  IsBoolean,
  IsString,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  LetterOfCreditActionTypeEnum,
  LetterOfCreditProductTypeEnum,
} from 'src/common/enums';
import { UserDetails } from 'src/common/types';

export class SaveAsDraftDto extends UserDetails {
  @ApiProperty({
    enum: LetterOfCreditActionTypeEnum,
    enumName: 'LetterOfCreditActionTypeEnum',
    default: LetterOfCreditActionTypeEnum.ISSUANCE,
    description: 'The type of letter of credit action',
  })
  @IsEnum(LetterOfCreditActionTypeEnum)
  @IsOptional()
  letterOfCreditActionType?: LetterOfCreditActionTypeEnum =
    LetterOfCreditActionTypeEnum.ISSUANCE;

  @ApiProperty({
    enum: LetterOfCreditProductTypeEnum,
    enumName: 'LetterOfCreditProductTypeEnum',
    default: LetterOfCreditProductTypeEnum.IMPORT,
    description: 'The type of letter of credit product',
  })
  @IsEnum(LetterOfCreditProductTypeEnum)
  @IsOptional()
  letterOfCreditProductType?: LetterOfCreditProductTypeEnum =
    LetterOfCreditProductTypeEnum.IMPORT;

  @ApiPropertyOptional({
    description: 'Application number for the letter of credit request',
    example: 'MF20220000024',
  })
  @IsString()
  @IsOptional()
  applicationNumber?: string;

  @ApiProperty({
    description: 'Whether the request is in draft status',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean = false;

  @ApiPropertyOptional({
    description: 'Additional metadata for the request',
  })
  @IsObject()
  @IsOptional()
  metadata?: object;
}
