import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { GetAllFormMRecordsStatusCountIdentifierEnum } from 'src/common/enums';

export class GetAllRecordsStatusCountDto {
  @ApiPropertyOptional({
    enum: GetAllFormMRecordsStatusCountIdentifierEnum,
    description: 'Identifier for the Form M record',
  })
  @IsEnum(GetAllFormMRecordsStatusCountIdentifierEnum, {
    message: `identifier must be one of: ${Object.values(GetAllFormMRecordsStatusCountIdentifierEnum).join(', ')}`,
  })
  recordType: GetAllFormMRecordsStatusCountIdentifierEnum;
}
