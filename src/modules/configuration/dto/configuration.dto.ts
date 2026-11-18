import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ClauseRequestTypeEnum } from 'src/common/enums';
import { UserDetails } from 'src/common/types';

export class CreateClausetDto extends UserDetails {
  @ApiPropertyOptional({
    description: 'Unique request identifier',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  requestId: string;

  @ApiProperty({
    description: 'Title of the clause',
    example: 'Loan Terms Clause',
  })
  @IsString()
  clauseField: string;

  @ApiProperty({ description: 'Associated product', example: 'Personal Loan' })
  @IsString()
  clauseName: string;

  @ApiProperty({ description: 'Type of the product', example: 'Secured' })
  @IsString()
  clauseText: string;

  @ApiPropertyOptional({
    description: 'Clause Request Type',
    example: ClauseRequestTypeEnum.CREATION,
  })
  @IsEnum(ClauseRequestTypeEnum)
  @IsOptional()
  requestType?: ClauseRequestTypeEnum = ClauseRequestTypeEnum.CREATION;

  @ApiProperty({ description: 'Whether previously a draft', example: false })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}

export class CreateReferenceDto extends UserDetails {
  @ApiProperty({ description: 'Unique reference code', example: 'REF12345' })
  @IsString()
  referenceCode: string;

  @ApiProperty({
    description: 'Name of the reference',
    example: 'Loan Reference',
  })
  @IsString()
  referenceName: string;

  @ApiProperty({
    description: 'Title of the reference',
    example: 'Loan Processing Reference',
  })
  @IsString()
  referenceTitle: string;

  @ApiProperty({ description: 'Associated product', example: 'Mortgage Loan' })
  @IsString()
  product: string;

  @ApiProperty({ description: 'Type of the product', example: 'Unsecured' })
  @IsString()
  productType: string;

  @ApiProperty({
    description: 'Starting number for reference sequence',
    example: 1000,
  })
  @IsNumber()
  startNumber: number;

  @ApiProperty({
    description: 'Ending number for reference sequence',
    example: 9999,
  })
  @IsNumber()
  endNumber: number;

  @ApiProperty({ description: 'Status of the reference', example: true })
  @IsBoolean()
  status: boolean;
}
