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
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  // MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  BillsForCollectionActionTypeEnum,
  BillsForCollectionAdviseByEnum,
  BillsForCollectionPaymentPartyEnum,
  BillsForCollectionTenorStartBoundaryEnum,
} from 'src/common/enums';
import { UserDetails } from 'src/common/types';
import { BillsForCollectionDocumentUploadDto } from './bills-for-collection-document-upload.dto';
import { BillsForCollectionPaymentToAcceptDto } from './bills-for-collection-payment-to-accept.dto';

@ApiExtraModels(BillsForCollectionPaymentToAcceptDto)
export class AcceptBillsForCollectionDto extends UserDetails {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  requestId?: string;

  @ApiProperty({
    enum: BillsForCollectionActionTypeEnum,
    description: 'Action type of the Bills for Collection',
    example: BillsForCollectionActionTypeEnum.ACCEPTANCE,
  })
  @IsEnum([BillsForCollectionActionTypeEnum.ACCEPTANCE])
  billsForCollectionActionType: BillsForCollectionActionTypeEnum =
    BillsForCollectionActionTypeEnum.ACCEPTANCE;

  @ApiProperty({
    example: 'SB/ILC202304CULC',
  })
  @IsString()
  billsReferenceNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  senderBicCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  senderName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  senderAddress?: string;

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsString()
  // receivedFromReference?: string;

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
  @IsString()
  instructionsReceived?: string;

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

  @ApiPropertyOptional({ type: [BillsForCollectionPaymentToAcceptDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillsForCollectionPaymentToAcceptDto)
  paymentsToAccept?: BillsForCollectionPaymentToAcceptDto[];

  @ApiPropertyOptional({ enum: BillsForCollectionPaymentPartyEnum })
  @IsOptional()
  @IsEnum(BillsForCollectionPaymentPartyEnum)
  addresseePartyRole?: BillsForCollectionPaymentPartyEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addresseeReference?: string;

  @ApiPropertyOptional({ enum: BillsForCollectionAdviseByEnum })
  @IsOptional()
  @IsEnum(BillsForCollectionAdviseByEnum)
  advisedBy?: BillsForCollectionAdviseByEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructionsToSend?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  amountAccepted?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  amountAcceptedCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  marginDeposit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  marginDepositCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  expireCollection?: boolean;

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
