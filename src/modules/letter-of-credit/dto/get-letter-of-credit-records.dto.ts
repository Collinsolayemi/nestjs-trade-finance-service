import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { GetRecordsDto } from 'src/common/dto/get-records.dto';
import {
  LetterOfCreditActionTypeEnum,
  LetterOfCreditProductTypeEnum,
  LetterOfCreditStateEnum,
} from 'src/common/enums';

export class GetLetterOfCreditRecordsDto extends GetRecordsDto {
  @ApiPropertyOptional({
    enum: LetterOfCreditProductTypeEnum,
    description: 'Product Type Enum',
  })
  @IsEnum(LetterOfCreditProductTypeEnum)
  @IsOptional()
  lcProductType?: LetterOfCreditProductTypeEnum;

  @ApiPropertyOptional({
    enum: LetterOfCreditActionTypeEnum,
    description: 'Request status',
  })
  @IsEnum(LetterOfCreditActionTypeEnum)
  @IsOptional()
  lcStatus?: LetterOfCreditActionTypeEnum;

  @ApiPropertyOptional({
    enum: LetterOfCreditStateEnum,
    description: 'Request status',
  })
  @IsEnum(LetterOfCreditStateEnum)
  @IsOptional()
  lcState?: LetterOfCreditStateEnum;

  @ApiPropertyOptional({
    description: 'LC Reference',
  })
  @IsOptional()
  @IsString()
  lcCode?: string;

  @ApiPropertyOptional({
    description: 'Applicant Name',
  })
  @IsOptional()
  @IsString()
  applicantName?: string;
}
