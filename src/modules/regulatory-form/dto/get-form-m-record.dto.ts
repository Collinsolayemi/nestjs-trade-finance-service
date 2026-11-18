import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { GetFormMRecordIdentifierEnum } from 'src/common/enums';

export class GetFormMRecordDto {
  @ApiPropertyOptional({
    enum: GetFormMRecordIdentifierEnum,
    description: 'Identifier for the Form M record',
  })
  @IsEnum(GetFormMRecordIdentifierEnum, {
    message: `identifier must be one of: ${Object.values(GetFormMRecordIdentifierEnum).join(', ')}`,
  })
  identifier: GetFormMRecordIdentifierEnum;
}
