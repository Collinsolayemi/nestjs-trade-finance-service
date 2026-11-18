import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import {
  ApprovalStatusEnum,
  AuthorizationStatusEnum,
  RequestStatusEnum,
} from 'src/common/enums';
import { UserDetails } from 'src/common/types';
import { IsValidRequestStatus } from 'src/common/validators';

export class GetRecordsDto extends UserDetails {
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
  startDate: string;

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
  endDate: string;

  @ApiPropertyOptional({
    enum: RequestStatusEnum,
    description: 'Request status',
  })
  @IsEnum(RequestStatusEnum)
  @IsOptional()
  @IsValidRequestStatus()
  requestStatus?: RequestStatusEnum;

  @ApiPropertyOptional({
    enum: ApprovalStatusEnum,
    description: 'Approval status',
  })
  @IsEnum(ApprovalStatusEnum)
  @IsOptional()
  approvalStatus?: ApprovalStatusEnum;

  @ApiPropertyOptional({
    enum: AuthorizationStatusEnum,
    description: 'Record scope authorization status',
  })
  @IsEnum(AuthorizationStatusEnum)
  @IsOptional()
  recordScope: AuthorizationStatusEnum;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Indicates if the user is an authorizer',
  })
  @IsBooleanString()
  @IsOptional()
  isAuthorizer?: string;
}
