import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IssueLetterOfCreditDto } from './issue-letter-of-credit.dto';
import { LetterOfCreditProductTypeEnum } from 'src/common/enums';
import { IsEnum } from 'class-validator';

export class AdviseLetterOfCreditDto extends PartialType(
  OmitType(IssueLetterOfCreditDto, [] as const),
) {
  @ApiProperty({
    description: 'Letter Of Credit Product Type',
    example: LetterOfCreditProductTypeEnum.IMPORT,
  })
  @IsEnum(LetterOfCreditProductTypeEnum, {
    message: `letterOfCreditProductType must be one of: ${Object.values(LetterOfCreditProductTypeEnum).join(', ')}`,
  })
  letterOfCreditProductType: LetterOfCreditProductTypeEnum =
    LetterOfCreditProductTypeEnum.EXPORT;
}
