import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { AuthorizeActionDto } from 'src/common/dto/authorize-action.dto';
import { ClauseRequestTypeEnum } from 'src/common/enums';

export class AuthorizeClauseRequestDto extends AuthorizeActionDto {
  @ApiProperty({
    enum: ClauseRequestTypeEnum,
  })
  @IsEnum(ClauseRequestTypeEnum)
  requestType: ClauseRequestTypeEnum;
}
