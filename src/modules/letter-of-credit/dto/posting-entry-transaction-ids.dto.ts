import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { LetterOfCreditActionTypeEnum } from 'src/common/enums';

export class PostingEntryTransactionDto {
  @ApiProperty({
    description: 'Action type of the Letter of Credit',
    example: LetterOfCreditActionTypeEnum.ISSUANCE,
  })
  @IsEnum([LetterOfCreditActionTypeEnum.ISSUANCE])
  letterOfCreditActionType: LetterOfCreditActionTypeEnum =
    LetterOfCreditActionTypeEnum.ISSUANCE;

  @ApiProperty({})
  @IsString()
  transactionId: string;

  @ApiPropertyOptional({
    description: 'If transaction has been reversed',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isReversed: boolean = false;

  @ApiPropertyOptional({})
  @IsString()
  @IsOptional()
  transactionReversalId?: string;
}
