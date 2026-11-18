import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { GetFormNXPRecordIdentifierEnum } from 'src/common/enums';

export class GetFormNXPRecordDto {
  @ApiPropertyOptional({
    enum: GetFormNXPRecordIdentifierEnum,
    description: 'Identifier for the Form NXP record',
  })
  @IsEnum(GetFormNXPRecordIdentifierEnum, {
    message: `identifier must be one of: ${Object.values(GetFormNXPRecordIdentifierEnum).join(', ')}`,
  })
  identifier: GetFormNXPRecordIdentifierEnum;
}
