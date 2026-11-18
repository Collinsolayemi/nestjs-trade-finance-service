import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { IssueLetterOfCreditDto } from './issue-letter-of-credit.dto';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  LetterOfCreditActionTypeEnum,
  LetterOfCreditAmountChangeEnum,
} from 'src/common/enums';

export class AdjustLetterOfCreditDto extends PartialType(
  OmitType(IssueLetterOfCreditDto, [
    'applicationNumber',
    'preAdviceReferenceNumber',
    'otherApplicableRules',
  ] as const),
) {
  @ApiProperty({
    description: 'Action type of the Letter of Credit',
    example: LetterOfCreditActionTypeEnum.ADJUSTMENT,
  })
  @IsEnum([LetterOfCreditActionTypeEnum.ADJUSTMENT])
  letterOfCreditActionType: LetterOfCreditActionTypeEnum.ADJUSTMENT =
    LetterOfCreditActionTypeEnum.ADJUSTMENT;

  @ApiProperty({
    example: 'SB/ILC202304CULC',
  })
  @IsString()
  @MaxLength(16)
  lcReferenceNumber: string;

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

  @ApiProperty({ description: 'Date of Adjustment', example: '2023-03-15' })
  @IsDateString(
    {},
    {
      message:
        'dateOfAdjustment must be a valid date string (YYYY-MM-DD or ISO 8601)',
    },
  )
  dateOfAdjustment: Date;
}
