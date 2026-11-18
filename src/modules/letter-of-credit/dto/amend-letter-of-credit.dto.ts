import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { IssueLetterOfCreditDto } from './issue-letter-of-credit.dto';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  AmendmentChargePayableByEnum,
  LetterOfCreditActionTypeEnum,
  LetterOfCreditAmountChangeEnum,
  PurposeOfMessageEnum,
} from 'src/common/enums';

export class AmendLetterOfCreditDto extends PartialType(
  OmitType(IssueLetterOfCreditDto, [
    'applicationNumber',
    'preAdviceReferenceNumber',
    'otherApplicableRules',
  ] as const),
) {
  @ApiProperty({
    description: 'Action type of the Letter of Credit',
    example: LetterOfCreditActionTypeEnum.AMENDMENT,
  })
  @IsEnum([LetterOfCreditActionTypeEnum.AMENDMENT])
  letterOfCreditActionType: LetterOfCreditActionTypeEnum.AMENDMENT =
    LetterOfCreditActionTypeEnum.AMENDMENT;

  @ApiProperty({
    example: 'SB/ILC202304CULC',
  })
  @IsString()
  @MaxLength(16)
  lcReferenceNumber: string;

  @ApiProperty({ description: 'Seek Beneficiary Approval', example: false })
  @IsBoolean()
  seekBeneficiarysApproval?: boolean;

  @ApiProperty({
    example: 'SB/ILC202304CULC',
  })
  @IsString()
  @MaxLength(16)
  receiversReference: string;

  @ApiProperty({
    example: 'SB/ILC202304CULC',
  })
  @IsString()
  @MaxLength(16)
  issuingBanksReference: string;

  @ApiProperty({
    example:
      PurposeOfMessageEnum.ADVICE_AND_CONFIRMATION_OF_THE_CREDIT_AMENDMENT,
  })
  @IsEnum(PurposeOfMessageEnum)
  purposeOfMessage: PurposeOfMessageEnum =
    PurposeOfMessageEnum.ADVICE_AND_CONFIRMATION_OF_THE_CREDIT_AMENDMENT;

  @ApiProperty({
    example: LetterOfCreditAmountChangeEnum.INCREASE,
  })
  @IsEnum(LetterOfCreditAmountChangeEnum)
  lcAmountChange: LetterOfCreditAmountChangeEnum =
    LetterOfCreditAmountChangeEnum.INCREASE;

  @ApiPropertyOptional({
    description: 'LC Change Amount',
    example: '1000000.00',
  })
  @IsNumber()
  @IsOptional()
  lcChangeAmount: number;

  @ApiProperty({
    description: 'Applicable rules',
    example: AmendmentChargePayableByEnum.APPLICANT,
  })
  @IsEnum(AmendmentChargePayableByEnum)
  amendmentChargePayableBy: AmendmentChargePayableByEnum =
    AmendmentChargePayableByEnum.APPLICANT;

  @ApiProperty({ description: 'Date of Amendment', example: '2023-03-15' })
  @IsDateString(
    {},
    {
      message:
        'dateOfAmendment must be a valid date string (YYYY-MM-DD or ISO 8601)',
    },
  )
  dateOfAmendment: Date;
}
