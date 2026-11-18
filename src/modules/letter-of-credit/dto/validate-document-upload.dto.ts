import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { LetterOfCreditDocumentValidationStatusEnum } from 'src/common/enums';

export class ValidateDocumentUploadDto {
  @ApiProperty({ description: 'LC Reference Number', example: 'LC123456789' })
  @IsString()
  lcReferenceNumber: string;

  @ApiProperty({
    example: 'Document Name',
    description: 'Document name',
  })
  @IsString()
  document: string;

  @ApiProperty({
    enum: LetterOfCreditDocumentValidationStatusEnum,
    description: 'Whether the document is a new upload or a replacement',
  })
  @IsEnum(LetterOfCreditDocumentValidationStatusEnum)
  validationStatus: LetterOfCreditDocumentValidationStatusEnum;

  @ApiPropertyOptional({
    description: 'Remarks or comments from the reviewer',
    example: 'File is blurry, please upload a clearer version.',
  })
  @IsOptional()
  @IsString()
  reviewerRemarks?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date',
    description:
      'Date when the validation was completed (YYYY-MM-DD or ISO 8601)',
    example: '2025-07-15',
  })
  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'validationCompletionDate must be a valid date string (YYYY-MM-DD or ISO 8601)',
    },
  )
  validationCompletionDate?: string;
}
