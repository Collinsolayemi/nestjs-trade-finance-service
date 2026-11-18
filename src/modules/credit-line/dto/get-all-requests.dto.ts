import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { AuthorizationStatusEnum, SearchKeysEnum } from 'src/common/enums';

export class GetAllQueryDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  page?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  pageSize?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(SearchKeysEnum)
  searchKey?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  searchValue?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(AuthorizationStatusEnum)
  authorizationStatus?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class GetAllRequestsDto extends GetAllQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  requestStatus?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  initiators?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  requestType?: string;
}

export class GetAllCreditLinesDto extends GetAllQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  counterparties?: string;
}
