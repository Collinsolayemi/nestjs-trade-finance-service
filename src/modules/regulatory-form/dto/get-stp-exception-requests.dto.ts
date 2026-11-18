import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { GetRecordsDto } from 'src/common/dto/get-records.dto';
import {
  RecordsStatusTypeEnum,
  RegulatoryFormTypeEnum,
} from 'src/common/enums';

export class GetStpExceptionRequestsDto extends GetRecordsDto {
  @ApiPropertyOptional({
    enum: RegulatoryFormTypeEnum,
    description: 'Regulatory form type',
  })
  @IsEnum(RegulatoryFormTypeEnum)
  @IsOptional()
  regulatoryFormType?: RegulatoryFormTypeEnum;

  @ApiPropertyOptional({
    enum: RecordsStatusTypeEnum,
    description: 'Status category you want to get the count for',
  })
  @IsEnum(RecordsStatusTypeEnum)
  @IsOptional()
  statusType?: RecordsStatusTypeEnum;
}
