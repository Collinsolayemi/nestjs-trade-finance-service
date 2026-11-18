import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { GetRecordsDto } from 'src/common/dto/get-records.dto';
import {
  BillsForCollectionActionTypeEnum,
  BillsForCollectionProductTypeEnum,
  BillsForCollectionStateEnum,
} from 'src/common/enums';

export class GetBillsForCollectionRecordsDto extends GetRecordsDto {
  @ApiPropertyOptional({
    enum: BillsForCollectionProductTypeEnum,
    description: 'Product Type Enum',
  })
  @IsEnum(BillsForCollectionProductTypeEnum)
  @IsOptional()
  bfcProductType?: BillsForCollectionProductTypeEnum;

  @ApiPropertyOptional({
    enum: BillsForCollectionActionTypeEnum,
    description: 'Request status',
  })
  @IsEnum(BillsForCollectionActionTypeEnum)
  @IsOptional()
  bfcStatus?: BillsForCollectionActionTypeEnum;

  @ApiPropertyOptional({
    enum: BillsForCollectionStateEnum,
    description: 'Record state',
  })
  @IsEnum(BillsForCollectionStateEnum)
  @IsOptional()
  bfcState?: BillsForCollectionStateEnum;

  @ApiPropertyOptional({
    description: 'Bills For Collection Reference',
  })
  @IsOptional()
  @IsString()
  billCode?: string;

  @ApiPropertyOptional({
    description: 'Applicant Name',
  })
  @IsOptional()
  @IsString()
  applicantName?: string;
}
