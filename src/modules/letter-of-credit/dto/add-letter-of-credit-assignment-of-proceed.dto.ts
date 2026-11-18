import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  MaxLength,
  IsNotEmpty,
  IsEnum,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  LetterOfCreditActionTypeEnum,
  LetterOfCreditAssignmentOfProceedBankTypeEnum,
} from 'src/common/enums';
import { UserDetails } from 'src/common/types';

export class AssignmentOfProceedItemDto {
  @IsUUID()
  @IsOptional()
  requestId?: string;

  @ApiProperty({
    description: 'Assignee Name',
    example: 'ABC Manufacturing Limited',
  })
  @IsString()
  @IsNotEmpty()
  assigneeName: string;

  @ApiPropertyOptional({
    description: 'Assignee Reference',
    example: 'REF123456',
  })
  @IsOptional()
  @IsString()
  assigneeReference?: string;

  @ApiProperty({
    description: 'Amount to be assigned',
    example: 50000.0,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: 'Assignee Bank Type',
    example: LetterOfCreditAssignmentOfProceedBankTypeEnum.INTERNAL,
  })
  @IsEnum(LetterOfCreditAssignmentOfProceedBankTypeEnum)
  assigneeBankType: LetterOfCreditAssignmentOfProceedBankTypeEnum;

  @ApiPropertyOptional({
    description: 'Assignee Bank',
    example: 'ABC Bank',
  })
  @IsOptional()
  @IsString()
  assigneeBank?: string;

  @ApiProperty({
    description: 'Assignee Account Number',
    example: '0169217088',
  })
  @IsString()
  @IsNotEmpty()
  assigneeAccountNumber: string;

  @ApiPropertyOptional({
    description: 'Narrative for this assignee under the LC',
    example: 'Assignment of proceeds for payment to supplier',
  })
  @IsOptional()
  @IsString()
  narrative?: string;
}

export class LetterOfCreditAssignmentOfProceedDto extends UserDetails {
  @IsUUID()
  @IsOptional()
  requestId?: string;

  @ApiProperty({
    description: 'LC Reference Number (max 16 characters)',
    example: 'LC2024001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16, {
    message: 'LC Reference Number character length can not be longer than 16',
  })
  lcReferenceNumber: string;

  @ApiProperty({
    description: 'Letter of Credit Action Type',
    example: LetterOfCreditActionTypeEnum.ASSIGNMENT_OF_PROCEED,
  })
  @IsEnum(LetterOfCreditActionTypeEnum)
  letterOfCreditActionType: LetterOfCreditActionTypeEnum.ASSIGNMENT_OF_PROCEED =
    LetterOfCreditActionTypeEnum.ASSIGNMENT_OF_PROCEED;

  @ApiProperty({
    description: 'Array of assignment of proceed items',
    type: [AssignmentOfProceedItemDto],
    example: [
      {
        assigneeName: 'ABC Manufacturing Limited',
        assigneeReference: 'REF123456',
        amount: 50000.0,
        currency: 'USD',
        assigneeBankType:
          LetterOfCreditAssignmentOfProceedBankTypeEnum.INTERNAL,
        assigneeBank: 'ABC Bank',
        assigneeAccountNumber: '0169217088',
        narrative: 'Assignment of proceeds for payment to supplier',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentOfProceedItemDto)
  assignments: AssignmentOfProceedItemDto[];

  @ApiPropertyOptional({
    description: 'Whether previously a draft',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}
