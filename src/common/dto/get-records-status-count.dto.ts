import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import {
  AuthorizationStatusEnum,
  RecordsStatusTypeEnum,
  RegulatoryFormTypeEnum,
  RequestStatusEnum,
} from 'src/common/enums';
import { IsValidRequestStatus } from 'src/common/validators';

export class GetRecordsStatusCountDto {
  @ApiProperty({
    description: 'Status category you want to get the count for',
    enum: RecordsStatusTypeEnum,
  })
  @IsEnum(RecordsStatusTypeEnum)
  statusType: RecordsStatusTypeEnum = RecordsStatusTypeEnum.INITIATOR_VIEW;

  @ApiProperty({
    enum: AuthorizationStatusEnum,
    description: 'Record scope authorization status',
  })
  @IsEnum(AuthorizationStatusEnum, {
    message: `recordScope must be one of: ${Object.values(AuthorizationStatusEnum).join(', ')}`,
  })
  recordScope: AuthorizationStatusEnum = AuthorizationStatusEnum.CREATED_BY_ME;

  @ApiPropertyOptional({
    enum: RequestStatusEnum,
    description: 'Request status',
  })
  @IsEnum(RequestStatusEnum)
  @IsOptional()
  @IsValidRequestStatus()
  requestStatus?: RequestStatusEnum;

  @ApiPropertyOptional({
    enum: RegulatoryFormTypeEnum,
    description: 'Regulatory form type',
  })
  @IsEnum(RegulatoryFormTypeEnum)
  @IsOptional()
  regulatoryFormType?: RegulatoryFormTypeEnum = RegulatoryFormTypeEnum.FORM_M;
}
