import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ValidateCreditLineDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  creditLineName?: string;
}
