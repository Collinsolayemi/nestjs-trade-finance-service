import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UploadTypeEnum } from '../enums';

export class DocumentUploadDto {
  @ApiProperty({
    example: 'Document Name',
    description: 'Document name',
  })
  @IsString()
  @IsNotEmpty()
  document: string;

  @ApiPropertyOptional({
    enum: UploadTypeEnum,
    example: UploadTypeEnum.NEW,
    description: 'Whether the document is a new upload or a replacement',
  })
  @IsEnum(UploadTypeEnum)
  @IsOptional()
  uploadType?: UploadTypeEnum;

  @ApiProperty({
    example: 'URL to document',
    description: 'URL to document',
  })
  @IsString()
  @IsNotEmpty()
  uploadDocument: string;

  @ApiProperty({
    example: '2025-05-25',
    description: 'Date shown on the document',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  documentDate: Date;

  @ApiProperty({
    example: 'Original copy couriered. This is scanned copy for pre-check',
    description: 'Additional remarks or notes about the document',
  })
  @IsString()
  @IsNotEmpty()
  documentDescription: string;
}
