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
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  GuaranteesActionTypeEnum,
  GuaranteesPaymentAvailableByEnum,
  GuaranteesPresentersActionEnum,
  GuaranteesTenorStartBoundaryEnum,
  PaymentActionTypeEnum,
  TenorPeriodEnum,
} from 'src/common/enums';
import { UserDetails } from 'src/common/types';
import { GuaranteesDocumentUploadDto } from './guarantees-document-upload.dto';
import { GuaranteesMixedPaymentDetailsDto } from './guarantees-mixed-payment-details.dto';

@ApiExtraModels(GuaranteesMixedPaymentDetailsDto, GuaranteesDocumentUploadDto)
export class ReceiveClaimGuaranteeDto extends UserDetails {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  requestId?: string;

  @ApiProperty({
    description: 'Action type of the Guarantee',
    example: GuaranteesActionTypeEnum.CLAIM_RECEIVED,
  })
  @IsEnum([GuaranteesActionTypeEnum.CLAIM_RECEIVED])
  guaranteesActionType: GuaranteesActionTypeEnum =
    GuaranteesActionTypeEnum.CLAIM_RECEIVED;

  @ApiProperty({
    example: 'GI-01234-BA',
  })
  @IsString()
  guaranteesReferenceNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  presentersReference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  presentingPartyBicCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  presentingPartyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  presentingPartyAddress?: string;

  @ApiPropertyOptional({ enum: GuaranteesPresentersActionEnum })
  @IsOptional()
  @IsEnum(GuaranteesPresentersActionEnum)
  presentersAction?: GuaranteesPresentersActionEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  presentationAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  presentationAmountCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  additionalAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additionalAmountCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  chargesAddedAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chargesAddedAmountCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  chargesDeductedAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chargesDeductedAmountCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  totalClaimedAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  totalClaimedAmountCurrency?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  presentationDate?: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  paymentDueDate?: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  chargeDueDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  presentersDiscrepancies?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notesFromPresenter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  mixedPayment?: boolean;

  @ApiPropertyOptional({ type: [GuaranteesMixedPaymentDetailsDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuaranteesMixedPaymentDetailsDto)
  mixedPaymentDetails?: GuaranteesMixedPaymentDetailsDto[];

  @ApiPropertyOptional({ enum: PaymentActionTypeEnum })
  @IsOptional()
  @IsEnum(PaymentActionTypeEnum)
  paymentAction?: PaymentActionTypeEnum;

  @ApiPropertyOptional({ enum: GuaranteesPaymentAvailableByEnum })
  @IsOptional()
  @IsEnum(GuaranteesPaymentAvailableByEnum)
  availableBy?: GuaranteesPaymentAvailableByEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  availableByPeriod?: number;

  @ApiPropertyOptional({ enum: TenorPeriodEnum })
  @IsOptional()
  @IsEnum(TenorPeriodEnum)
  availableByPeriodUnit?: TenorPeriodEnum;

  @ApiPropertyOptional({ enum: GuaranteesTenorStartBoundaryEnum })
  @IsOptional()
  @IsEnum(GuaranteesTenorStartBoundaryEnum)
  tenorStartBoundary?: GuaranteesTenorStartBoundaryEnum;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  valueDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  paymentAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentAmountCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  withRecourse?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  finalPayment?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  cancelReimbursementAuthority?: boolean;

  @ApiPropertyOptional({ type: [GuaranteesDocumentUploadDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuaranteesDocumentUploadDto)
  documents?: GuaranteesDocumentUploadDto[] | null;

  @ApiPropertyOptional({
    description: 'Whether previously a draft',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}
