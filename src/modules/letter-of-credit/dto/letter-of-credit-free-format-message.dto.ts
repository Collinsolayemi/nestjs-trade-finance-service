import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  LetterOfCreditActionTypeEnum,
  LetterOfCreditFreeFormaSwifttMessageTypeEnum,
} from 'src/common/enums';
import { FreeFormatMessageDto } from 'src/common/dto/free-format-message.dto';

export class LetterOfCreditFreeFormatMessageDto extends FreeFormatMessageDto {
  @ApiProperty({
    description: 'Action type of the Letter of Credit',
    example: LetterOfCreditActionTypeEnum.FREE_FORMAT,
  })
  @IsEnum([LetterOfCreditActionTypeEnum.FREE_FORMAT])
  letterOfCreditActionType: LetterOfCreditActionTypeEnum.FREE_FORMAT =
    LetterOfCreditActionTypeEnum.FREE_FORMAT;

  @ApiProperty({
    description: 'Swift Message Type',
    enum: LetterOfCreditFreeFormaSwifttMessageTypeEnum,
    example: LetterOfCreditFreeFormaSwifttMessageTypeEnum.MT_799,
  })
  @IsEnum(LetterOfCreditFreeFormaSwifttMessageTypeEnum)
  swiftMessageType: LetterOfCreditFreeFormaSwifttMessageTypeEnum;

  @ApiProperty({ description: 'LC Reference Number', example: 'LC123456789' })
  @IsString()
  lcReferenceNumber: string;

  @ApiProperty({ description: 'LC Reference Number', example: 'LC123456789' })
  @IsString()
  lcRelatedReferenceNumber: string;

  @ApiPropertyOptional({
    description: 'Whether previously a draft',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}
