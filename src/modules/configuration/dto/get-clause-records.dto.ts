import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsOptional, IsString } from 'class-validator';
import { GetRecordsDto } from 'src/common/dto/get-records.dto';

export class GetClauseRecordsDto extends GetRecordsDto {
  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter by active and inactive',
  })
  @IsBooleanString()
  @IsOptional()
  isActive: string;

  @ApiPropertyOptional({
    description: 'Clause Code',
  })
  @IsString()
  @IsOptional()
  clauseCode: string;
}
