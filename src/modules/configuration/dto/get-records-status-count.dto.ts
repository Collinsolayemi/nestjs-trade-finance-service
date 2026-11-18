import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { AuthorizationStatusEnum } from 'src/common/enums';

export class GetRecordsStatusCountDto {
  @ApiProperty({
    enum: AuthorizationStatusEnum,
    description: 'Record scope authorization status',
  })
  @IsEnum(AuthorizationStatusEnum, {
    message: `recordScope must be one of: ${Object.values(AuthorizationStatusEnum).join(', ')}`,
  })
  recordScope: AuthorizationStatusEnum = AuthorizationStatusEnum.CREATED_BY_ME;
}
