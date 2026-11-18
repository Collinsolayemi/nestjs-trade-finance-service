import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { FreeFormatMessageDto } from 'src/common/dto/free-format-message.dto';
import {
  BillsForCollectionActionTypeEnum,
  BillsForCollectionFreeFormaSwifttMessageTypeEnum,
} from 'src/common/enums';

export class BillsForCollectionFreeFormatMessageDto extends FreeFormatMessageDto {
  @ApiProperty({
    description: 'Action type of the Bills for Collection',
    example: BillsForCollectionActionTypeEnum.FREE_FORMAT,
  })
  @IsEnum([BillsForCollectionActionTypeEnum.FREE_FORMAT])
  billsForCollectionActionType: BillsForCollectionActionTypeEnum.FREE_FORMAT =
    BillsForCollectionActionTypeEnum.FREE_FORMAT;

  @ApiProperty({
    description: 'Swift Message Type',
    enum: BillsForCollectionFreeFormaSwifttMessageTypeEnum,
    example: BillsForCollectionFreeFormaSwifttMessageTypeEnum.MT_499,
  })
  @IsEnum(BillsForCollectionFreeFormaSwifttMessageTypeEnum)
  swiftMessageType: BillsForCollectionFreeFormaSwifttMessageTypeEnum;

  @ApiProperty({
    description: 'Bills Reference Number',
    example: 'BILLS123456789',
  })
  @IsString()
  billsReferenceNumber: string;

  @ApiProperty({
    description: 'Bills Related Reference Number',
    example: 'BILLS123456789',
  })
  @IsString()
  billsRelatedReferenceNumber: string;
}
