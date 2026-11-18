import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { DocumentCodeEnum } from 'src/common/enums';

export class BillsForCollectionDocumentDetailsDto {
  @ApiProperty({ enum: DocumentCodeEnum })
  @IsEnum(DocumentCodeEnum)
  documentCode: DocumentCodeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  numberOfOriginals?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  numberOfCopies?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  documentDate?: Date;

  @ApiProperty()
  @IsString()
  documentClauses: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  documentReceived?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  originalDocsReceived?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  duplicateDocsReceived?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  uploadDocumentUrl?: string;
}
