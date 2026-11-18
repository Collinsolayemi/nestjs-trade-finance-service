import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { BookBillsForCollectionDto } from './book-bills-for-collection.dto';
import {
  BillsForCollectionActionTypeEnum,
  BillsForCollectionAdviseByEnum,
} from 'src/common/enums';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  // MaxLength,
} from 'class-validator';
import { BillsForCollectionDraftDetailsDto } from './bills-for-collection-draft-details.dto';
import { BillsForCollectionDocumentDetailsDto } from './bills-for-collection-document-details.dto';

@ApiExtraModels(
  BillsForCollectionDraftDetailsDto,
  BillsForCollectionDocumentDetailsDto,
)
export class AmendBillsForCollectionDto extends PartialType(
  OmitType(BookBillsForCollectionDto, ['applicationNumber'] as const),
) {
  @ApiProperty({
    description: 'Action type of the Bills for Collection',
    example: BillsForCollectionActionTypeEnum.AMENDMENT,
  })
  @IsEnum([BillsForCollectionActionTypeEnum.AMENDMENT])
  billsForCollectionActionType: BillsForCollectionActionTypeEnum =
    BillsForCollectionActionTypeEnum.AMENDMENT;

  @ApiProperty({
    example: 'SB/ILC202304CULC',
  })
  @IsString()
  billsReferenceNumber: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  amendmentDate?: Date;

  @ApiPropertyOptional({ enum: BillsForCollectionAdviseByEnum })
  @IsOptional()
  @IsEnum(BillsForCollectionAdviseByEnum)
  adviseBy?: BillsForCollectionAdviseByEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructionsReceived?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  amendmentNarrative?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructionsToSend?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  expire?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  applyReversalPostings?: boolean;
}
