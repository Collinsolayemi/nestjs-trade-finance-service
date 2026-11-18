import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { UserDetails } from 'src/common/types';

export class GetFormNXPRecordsDto extends UserDetails {
  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    description: 'Page number (min: 1)',
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'page must be at least 1' })
  page: number;

  @ApiPropertyOptional({
    type: Number,
    minimum: 10,
    description: 'Page size (min: 10)',
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(10, { message: 'size must be at least 10' })
  size: number;

  @ApiPropertyOptional({
    type: String,
    format: 'date',
    description: 'Start date (YYYY-MM-DD or ISO 8601)',
  })
  @IsDateString(
    {},
    {
      message: 'startDate must be a valid date string (YYYY-MM-DD or ISO 8601)',
    },
  )
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date',
    description: 'End date (YYYY-MM-DD or ISO 8601)',
  })
  @IsDateString(
    {},
    { message: 'endDate must be a valid date string (YYYY-MM-DD or ISO 8601)' },
  )
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter for valid records only',
  })
  @IsOptional()
  @IsBooleanString()
  validOnly?: boolean;

  @ApiPropertyOptional({
    type: String,
    description: 'Applicant Name',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  applicantName?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Application Number',
    example: 'XF202150849',
  })
  @IsString()
  @IsOptional()
  applicationNumber?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Form NXP Status',
    example: 'SUBMITTED',
  })
  @IsString()
  @IsOptional()
  status?: string;
}
