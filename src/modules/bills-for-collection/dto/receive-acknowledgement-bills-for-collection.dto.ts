import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  // MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  BillsForCollectionActionTypeEnum,
  BillsForCollectionTenorStartBoundaryEnum,
} from 'src/common/enums';
import { UserDetails } from 'src/common/types';
import { BillsForCollectionDocumentDetailsDto } from './bills-for-collection-document-details.dto';
import { BillsForCollectionDocumentUploadDto } from './bills-for-collection-document-upload.dto';

@ApiExtraModels(BillsForCollectionDocumentDetailsDto)
export class ReceiveAcknowledgementBillsForCollectionDto extends UserDetails {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  requestId?: string;

  @ApiProperty({
    description: 'Action type of the Bills for Collection',
    example: BillsForCollectionActionTypeEnum.RECEIVE_ACKNOWLEDGEMENT,
  })
  @IsEnum([BillsForCollectionActionTypeEnum.RECEIVE_ACKNOWLEDGEMENT])
  billsForCollectionActionType: BillsForCollectionActionTypeEnum =
    BillsForCollectionActionTypeEnum.RECEIVE_ACKNOWLEDGEMENT;

  @ApiProperty({
    example: 'SB/ILC202304CULC',
  })
  @IsString()
  billsReferenceNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receivedFromReference?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  dateReceived?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sendersReference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  amountAcknowledged?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  amountAcknowledgedCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tenorPeriod?: number;

  @ApiPropertyOptional({ enum: BillsForCollectionTenorStartBoundaryEnum })
  @IsOptional()
  @IsEnum(BillsForCollectionTenorStartBoundaryEnum)
  tenorStartBoundary?: BillsForCollectionTenorStartBoundaryEnum;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  tenorStartDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructionsReceived?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paymentsToAcknowledge?: string[];

  @ApiPropertyOptional({ type: [BillsForCollectionDocumentDetailsDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillsForCollectionDocumentUploadDto)
  documents?: BillsForCollectionDocumentUploadDto[] | null;

  @ApiPropertyOptional({
    description: 'Whether previously a draft',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}
