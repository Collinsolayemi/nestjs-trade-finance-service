import {
  LetterOfCreditActionTypeEnum,
  SwiftMessageTypeEnum,
} from 'src/common/enums';
import { IsEnum, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SwiftMessageDto {
  @ApiProperty({
    description: 'Letter of Credit Action Type',
    enum: LetterOfCreditActionTypeEnum,
    example: LetterOfCreditActionTypeEnum.ISSUANCE,
  })
  @IsEnum(LetterOfCreditActionTypeEnum)
  actionType: LetterOfCreditActionTypeEnum;

  @ApiProperty({
    description: 'Message Type',
    enum: SwiftMessageTypeEnum,
    example: SwiftMessageTypeEnum.MT_700,
  })
  @IsEnum(SwiftMessageTypeEnum)
  messageType: SwiftMessageTypeEnum;

  @ApiProperty({
    description: 'Upload URL for the SWIFT message',
    example: 'https://example.com/swift/messages/mt700-abc123.txt',
  })
  @IsString()
  uploadUrl: string;

  @ApiProperty({
    description: 'Timestamp when the SWIFT message was uploaded',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsDateString()
  timestamp: string;
}
