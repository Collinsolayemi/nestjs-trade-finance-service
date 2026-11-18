import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from '@nestjs/swagger';
import { BookBillsForCollectionDto } from './book-bills-for-collection.dto';
import {
  IsOptional,
  IsDateString,
  IsString,
  IsBoolean,
  IsEnum,
  // MaxLength,
} from 'class-validator';
import { BillsForCollectionActionTypeEnum } from 'src/common/enums';
import { BillsForCollectionDraftDetailsDto } from './bills-for-collection-draft-details.dto';
import { BillsForCollectionDocumentDetailsDto } from './bills-for-collection-document-details.dto';

@ApiExtraModels(
  BillsForCollectionDraftDetailsDto,
  BillsForCollectionDocumentDetailsDto,
)
export class AdjustBillsForCollectionDto extends PartialType(
  OmitType(BookBillsForCollectionDto, ['applicationNumber'] as const),
) {
  @ApiProperty({
    description: 'Action type of the Bills for Collection',
    example: BillsForCollectionActionTypeEnum.ADJUSTMENT,
  })
  @IsEnum([BillsForCollectionActionTypeEnum.ADJUSTMENT])
  billsForCollectionActionType: BillsForCollectionActionTypeEnum =
    BillsForCollectionActionTypeEnum.ADJUSTMENT;

  @ApiProperty({
    example: 'SB/ILC202304CULC',
  })
  @IsString()
  billsReferenceNumber: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  adjustmentDate?: Date;

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
