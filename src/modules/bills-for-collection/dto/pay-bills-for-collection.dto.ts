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
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  BillsForCollectionActionTypeEnum,
  BillsForCollectionAdviseByEnum,
  BillsForCollectionPaymentActionEnum,
  BillsForCollectionPaymentPartyEnum,
} from 'src/common/enums';
import { UserDetails } from 'src/common/types';
import { BillsForCollectionDraftPaymentDetailsDto } from './bills-for-collection-draft-payment-details.dto';
import { BillsForCollectionDocumentDetailsDto } from './bills-for-collection-document-details.dto';
import { BillsForCollectionDocumentUploadDto } from './bills-for-collection-document-upload.dto';

@ApiExtraModels(
  BillsForCollectionDraftPaymentDetailsDto,
  BillsForCollectionDocumentDetailsDto,
)
export class PayBillsForCollectionDto extends UserDetails {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  requestId?: string;

  @ApiProperty({
    description: 'Action type of the Bills for Collection',
    example: BillsForCollectionActionTypeEnum.PAYMENT,
  })
  @IsEnum([BillsForCollectionActionTypeEnum.PAYMENT])
  billsForCollectionActionType: BillsForCollectionActionTypeEnum =
    BillsForCollectionActionTypeEnum.PAYMENT;

  @ApiProperty()
  @IsString()
  billsReferenceNumber: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  dateReceived?: Date;

  @ApiPropertyOptional({ enum: BillsForCollectionPaymentPartyEnum })
  @IsOptional()
  @IsEnum(BillsForCollectionPaymentPartyEnum)
  receivedPaymentFrom?: BillsForCollectionPaymentPartyEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receivedFromReference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentInstructionsReceived?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sendersChargeDeductedAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sendersChargeDeductedCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  otherChargesDeductedAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  otherChargesDeductedCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  chargesAddedAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chargesAddedCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  amountCollected?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  amountCollectedCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lateInterestAddedAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lateInterestAddedCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  discountDeductedAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  discountDeductedCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  proceedsRemittedAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  proceedsRemittedCurrency?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  dateRemitted?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  lateInterestRefused?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ourChargesRefused?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  otherBankChargesRefused?: boolean;

  @ApiPropertyOptional({ enum: BillsForCollectionPaymentActionEnum })
  @IsOptional()
  @IsEnum(BillsForCollectionPaymentActionEnum)
  paymentAction?: BillsForCollectionPaymentActionEnum;

  @ApiPropertyOptional({ enum: BillsForCollectionPaymentPartyEnum })
  @IsOptional()
  @IsEnum(BillsForCollectionPaymentPartyEnum)
  sendPaymentTo?: BillsForCollectionPaymentPartyEnum;

  @ApiPropertyOptional({ enum: BillsForCollectionAdviseByEnum })
  @IsOptional()
  @IsEnum(BillsForCollectionAdviseByEnum)
  advisedBy?: BillsForCollectionAdviseByEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  beneficiaryBankBicCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  beneficiaryBankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  beneficiaryBankAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  beneficiaryBankAccount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notesForReceivedFromParty?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notesForSendPaymentToParty?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  paymentWithRecourse?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  optionContractHeld?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  expireCollection?: boolean;

  @ApiPropertyOptional({ type: [BillsForCollectionDraftPaymentDetailsDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillsForCollectionDraftPaymentDetailsDto)
  draftPaymentDetails?: BillsForCollectionDraftPaymentDetailsDto[] | null;

  @ApiPropertyOptional({ enum: BillsForCollectionPaymentPartyEnum })
  @IsOptional()
  @IsEnum(BillsForCollectionPaymentPartyEnum)
  thirdParty?: BillsForCollectionPaymentPartyEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thirdPartyAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thirdPartyAmountCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  thirdPartyPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  amountPaidToDate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  amountPaidToDateCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  totalAmountDue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  totalAmountDueCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  amountToPay?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  amountToPayCurrency?: string;

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
