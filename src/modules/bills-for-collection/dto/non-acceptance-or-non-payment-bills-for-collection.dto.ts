import {
  ApiExtraModels,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  // MaxLength,
  ValidateNested,
} from 'class-validator';
import {
  BillsForCollectionActionTypeEnum,
  BillsForCollectionAdviseByEnum,
  BillsForCollectionNonAcceptanceOrNonPaymentActionEventTypeEnum,
} from 'src/common/enums';
import { UserDetails } from 'src/common/types';
import { BillsForCollectionDocumentDetailsDto } from './bills-for-collection-document-details.dto';
import { BillsForCollectionDocumentUploadDto } from './bills-for-collection-document-upload.dto';

@ApiExtraModels(BillsForCollectionDocumentDetailsDto)
export class NonAcceptanceOrNonPaymentBillsForCollectionDto extends UserDetails {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  requestId?: string;

  @ApiProperty({
    description: 'Action type of the Bills for Collection',
    example: BillsForCollectionActionTypeEnum.NON_ACCEPTANCE_OR_NON_PAYMENT,
  })
  @IsEnum([BillsForCollectionActionTypeEnum.NON_ACCEPTANCE_OR_NON_PAYMENT])
  billsForCollectionActionType: BillsForCollectionActionTypeEnum =
    BillsForCollectionActionTypeEnum.NON_ACCEPTANCE_OR_NON_PAYMENT;

  @ApiProperty({
    example: 'SB/ILC202304CULC',
  })
  @IsString()
  billsReferenceNumber: string;

  @ApiPropertyOptional({
    enum: BillsForCollectionNonAcceptanceOrNonPaymentActionEventTypeEnum,
  })
  @IsOptional()
  @IsEnum(BillsForCollectionNonAcceptanceOrNonPaymentActionEventTypeEnum)
  actionEventType?: BillsForCollectionNonAcceptanceOrNonPaymentActionEventTypeEnum;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  adviseDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reasonOrNarrative?: string;

  @ApiPropertyOptional({ enum: BillsForCollectionAdviseByEnum })
  @IsOptional()
  @IsEnum(BillsForCollectionAdviseByEnum)
  adviseBy?: BillsForCollectionAdviseByEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addresseeRemittingBankBicCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addresseeRemittingBankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addresseeRemittingBankAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  protestInstructions?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructionsFromSender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  draftsToRefuse?: string[];

  @ApiPropertyOptional({ type: [BillsForCollectionDocumentUploadDto] })
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
