import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  BillsForCollectionAdviseByEnum,
  GuaranteesActionTypeEnum,
} from 'src/common/enums';
import { UserDetails } from 'src/common/types';
import { GuaranteesDocumentUploadDto } from './guarantees-document-upload.dto';

export class CancelGuaranteeDto extends UserDetails {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  requestId?: string;

  @ApiProperty({
    description: 'Action type of the Guarantee',
    example: GuaranteesActionTypeEnum.CANCELLATION,
  })
  @IsEnum([GuaranteesActionTypeEnum.CANCELLATION])
  guaranteesActionType: GuaranteesActionTypeEnum =
    GuaranteesActionTypeEnum.CANCELLATION;

  @ApiProperty({
    example: 'GI-01234-BA',
  })
  @IsString()
  guaranteesReferenceNumber: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  cancellationDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ enum: BillsForCollectionAdviseByEnum })
  @IsOptional()
  @IsEnum(BillsForCollectionAdviseByEnum)
  adviseBy?: BillsForCollectionAdviseByEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  seekBeneficiaryApproval?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  narrative?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructionsFromApplicant?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructionsToAdvisingBank?: string;

  @ApiPropertyOptional({ type: [GuaranteesDocumentUploadDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuaranteesDocumentUploadDto)
  documents?: GuaranteesDocumentUploadDto[] | null;

  @ApiPropertyOptional({
    description: 'Whether previously a draft',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}
