import { IsString, IsOptional, Min, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SwiftBic } from '../models/swift-bic-data.model';
import { Type } from 'class-transformer';

export class GetSwiftBicRecordsDto {
  @ApiPropertyOptional({
    description: 'Partial or full BIC code to search for (optional)',
    example: 'ABCD',
  })
  @IsString()
  @IsOptional()
  bic?: string;

  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    description: 'Page number (min: 1)',
    default: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'page must be at least 1' })
  page?: number;

  @ApiPropertyOptional({
    type: Number,
    minimum: 10,
    description: 'Page size (min: 10)',
    default: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(10, { message: 'size must be at least 10' })
  size?: number;
}

export class PaginationResponseDto {
  @ApiProperty({ type: [SwiftBic], description: 'List of SWIFT BIC records' })
  data: SwiftBic[];

  @ApiProperty({ description: 'Total number of matching records' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of records per page' })
  size: number;
}
