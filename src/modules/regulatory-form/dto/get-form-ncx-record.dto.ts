import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { GetFormNCXRecordIdentifierEnum } from 'src/common/enums';

export class GetFormNCXRecordDto {
  @ApiPropertyOptional({
    enum: GetFormNCXRecordIdentifierEnum,
    description: 'Identifier for the Form NCX record',
  })
  @IsEnum(GetFormNCXRecordIdentifierEnum, {
    message: `identifier must be one of: ${Object.values(GetFormNCXRecordIdentifierEnum).join(', ')}`,
  })
  identifier: GetFormNCXRecordIdentifierEnum;
}
