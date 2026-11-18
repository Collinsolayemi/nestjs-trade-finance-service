import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { GuaranteesActionTypeEnum } from 'src/common/enums';
import { IssueGuaranteeDto } from './issue-guarantee.dto';
import { GuaranteesAvailableByMixedPaymentDetailsDto } from './guarantees-available-by-mixed-payment-details.dto';
import { GuaranteesDocumentUploadDto } from './guarantees-document-upload.dto';

@ApiExtraModels(
  GuaranteesAvailableByMixedPaymentDetailsDto,
  GuaranteesDocumentUploadDto,
)
export class AmendGuaranteeDto extends PartialType(
  OmitType(IssueGuaranteeDto, ['applicationNumber'] as const),
) {
  @ApiProperty({
    description: 'Action type of the Guarantee',
    example: GuaranteesActionTypeEnum.AMENDMENT,
  })
  @IsEnum([GuaranteesActionTypeEnum.AMENDMENT])
  guaranteesActionType: GuaranteesActionTypeEnum =
    GuaranteesActionTypeEnum.AMENDMENT;

  @ApiProperty({
    example: 'GI-01234-BA',
  })
  @IsString()
  guaranteesReferenceNumber: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  amendmentDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  amendmentNarrative?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructionsFromApplicant?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responseToApplicant?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  usePreviouslyAmendedAmountsInAdvise?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  seekBeneficiaryApproval?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  applyReversalPostings?: boolean;
}
