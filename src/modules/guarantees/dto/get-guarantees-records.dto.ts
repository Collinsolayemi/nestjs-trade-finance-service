import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { GetRecordsDto } from 'src/common/dto/get-records.dto';
import {
  GuaranteesActionTypeEnum,
  GuaranteesProductTypeEnum,
  GuaranteesStateEnum,
} from 'src/common/enums';

export class GetGuaranteesRecordsDto extends GetRecordsDto {
  @ApiPropertyOptional({
    enum: GuaranteesProductTypeEnum,
    description: 'Product Type Enum',
  })
  @IsEnum(GuaranteesProductTypeEnum)
  @IsOptional()
  guaranteesProductType?: GuaranteesProductTypeEnum;

  @ApiPropertyOptional({
    enum: GuaranteesActionTypeEnum,
    description: 'Request status',
  })
  @IsEnum(GuaranteesActionTypeEnum)
  @IsOptional()
  guaranteesStatus?: GuaranteesActionTypeEnum;

  @ApiPropertyOptional({
    enum: GuaranteesStateEnum,
    description: 'Record state',
  })
  @IsEnum(GuaranteesStateEnum)
  @IsOptional()
  guaranteesState?: GuaranteesStateEnum;

  @ApiPropertyOptional({
    description: 'Guarantee Reference',
  })
  @IsOptional()
  @IsString()
  guaranteeCode?: string;

  @ApiPropertyOptional({
    description: 'Applicant Name',
  })
  @IsOptional()
  @IsString()
  applicantName?: string;
}
