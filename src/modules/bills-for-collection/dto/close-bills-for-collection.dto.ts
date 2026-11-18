import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UserDetails } from 'src/common/types';
import { BillsForCollectionActionTypeEnum } from 'src/common/enums';

export class CloseBillsForCollectionDto extends UserDetails {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  requestId?: string;

  @ApiProperty({
    description: 'Action type of the Bills for Collection',
    example: BillsForCollectionActionTypeEnum.CLOSURE,
  })
  @IsEnum([BillsForCollectionActionTypeEnum.CLOSURE])
  billsForCollectionActionType: BillsForCollectionActionTypeEnum =
    BillsForCollectionActionTypeEnum.CLOSURE;

  @ApiProperty({
    example: 'SB/ILC202304CULC',
  })
  @IsString()
  billsReferenceNumber: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  closureDate?: Date;

  @ApiPropertyOptional({
    description: 'Whether previously a draft',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}
