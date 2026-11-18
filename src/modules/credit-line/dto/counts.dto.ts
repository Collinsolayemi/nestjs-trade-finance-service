import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { AuthorizationStatusEnum } from 'src/common/enums';

export class GetCountsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(AuthorizationStatusEnum)
  authorizationStatus?: AuthorizationStatusEnum;
}
