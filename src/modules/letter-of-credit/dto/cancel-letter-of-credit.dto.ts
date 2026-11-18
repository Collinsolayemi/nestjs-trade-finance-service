import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { LetterOfCreditActionTypeEnum } from 'src/common/enums';
import { UserDetails } from 'src/common/types';
import { IsValidLcTextField } from 'src/common/validators';
import { LetterOfCreditDocumentUploadDto } from './letter-of-credit-document-upload.dto';

export class CancelLetterOfCreditDto extends UserDetails {
  @IsUUID()
  @IsOptional()
  requestId?: string;

  @ApiProperty({
    description: 'Action type of the Letter of Credit',
    example: LetterOfCreditActionTypeEnum.CANCELLATION,
  })
  @IsEnum([LetterOfCreditActionTypeEnum.CANCELLATION])
  letterOfCreditActionType: LetterOfCreditActionTypeEnum.CANCELLATION =
    LetterOfCreditActionTypeEnum.CANCELLATION;

  @ApiProperty({ description: 'LC Reference Number', example: 'LC123456789' })
  @IsString()
  lcReferenceNumber: string;

  @ApiProperty({ description: 'LC Amount', example: '1000000.00' })
  @IsString()
  lcAmount: number;

  @ApiProperty({
    description: 'LC CUrrency Code',
    example: 'USD',
  })
  @IsString()
  lcCurrencyCode: string;

  @ApiProperty({
    description: 'Cancellation Date',
    example: '2025-03-19T',
  })
  @IsDateString()
  cancellationDate: Date;

  @ApiPropertyOptional({
    description: 'Instructions from Applicant',
    example: 'Cancel the LC immediately',
  })
  @IsString()
  @MaxLength(802, {
    message:
      'Instructions from Applicant character length can not be longer than 802. 12 rows with each row having a max of 65 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(12, 65)
  @IsOptional()
  instructionsFromApplicant?: string;

  @ApiPropertyOptional({
    description: 'Instructions to Advising Bank',
    example: 'Notify the beneficiary',
  })
  @IsString()
  @MaxLength(802, {
    message:
      'Instructions to Advising Bank character length can not be longer than 802. 12 rows with each row having a max of 65 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(12, 65)
  @IsOptional()
  instructionsToAdvisingBank?: string;

  @ApiPropertyOptional({
    description: 'Instructions to Reimbursing Bank',
    example: 'Process refund',
  })
  @IsString()
  @MaxLength(802, {
    message:
      'Instructions to Reimbursing Bank character length can not be longer than 802. 12 rows with each row having a max of 65 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(12, 65)
  @IsOptional()
  instructionsToReimbursingBank?: string;

  @ApiProperty({ description: 'Seek Beneficiary Approval', example: false })
  @IsBoolean()
  seekBeneficiarysApproval?: boolean;

  @ApiPropertyOptional({
    description: 'List of document attachments',
    type: [LetterOfCreditDocumentUploadDto],
    example: [
      {
        document: 'Bill of Lading',
        uploadDocument: 'https://example.com/docs/bill_of_lading.pdf',
        documentDate: '2025-05-25',
        documentDescription:
          'Original copy couriered. This is scanned copy for pre-check',
      },
    ],
  })
  @IsOptional()
  documentAttachments?: LetterOfCreditDocumentUploadDto[];

  @ApiPropertyOptional({
    description: 'Whether previously a draft',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}
