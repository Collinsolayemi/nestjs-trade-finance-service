import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { DocumentUploadDto } from 'src/common/dto/document-upload.dto';
import { LetterOfCreditDocumentValidationStatusEnum } from 'src/common/enums';

export class LetterOfCreditDocumentUploadDto extends DocumentUploadDto {
  @ApiProperty({ description: 'LC Reference Number', example: 'LC123456789' })
  @IsString()
  lcReferenceNumber: string;

  @ApiPropertyOptional({
    enum: LetterOfCreditDocumentValidationStatusEnum,
    description: 'Whether the document is a new upload or a replacement',
  })
  @IsEnum(LetterOfCreditDocumentValidationStatusEnum)
  @IsOptional()
  validationStatus?: LetterOfCreditDocumentValidationStatusEnum;

  @ApiPropertyOptional({
    description: 'Remarks or comments from the reviewer',
    example: 'File is blurry, please upload a clearer version.',
  })
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date',
    description: 'Start date (YYYY-MM-DD or ISO 8601)',
  })
  @IsDateString(
    {},
    {
      message:
        'validationCompletionDate must be a valid date string (YYYY-MM-DD or ISO 8601)',
    },
  )
  @IsOptional()
  validationCompletionDate?: string;
}
