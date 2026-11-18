import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AcknowledgementTransmissionEnum,
  BillingLevelEnum,
  BillsForCollectionActionTypeEnum,
  BillsForCollectionProductTypeEnum,
  ChargesBorneByEnum,
  DeliveryMeansEnum,
  DocumentReleaseConditionEnum,
} from 'src/common/enums';
import { UserDetails } from 'src/common/types';
import { BillsForCollectionDraftDetailsDto } from './bills-for-collection-draft-details.dto';
import { BillsForCollectionDocumentDetailsDto } from './bills-for-collection-document-details.dto';

export class BookBillsForCollectionDto extends UserDetails {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  requestId?: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  tradeProductId: string;

  @ApiProperty({ enum: BillsForCollectionProductTypeEnum })
  @IsEnum(BillsForCollectionProductTypeEnum)
  billsForCollectionProductType?: BillsForCollectionProductTypeEnum;

  @ApiProperty({ enum: BillsForCollectionActionTypeEnum })
  @IsEnum(BillsForCollectionActionTypeEnum)
  billsForCollectionActionType: BillsForCollectionActionTypeEnum =
    BillsForCollectionActionTypeEnum.BOOKING;

  @ApiPropertyOptional({
    description: 'Form M Reference Number',
    example: 'MF20220000420',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  applicationNumber?: string;

  // @ApiPropertyOptional({ enum: BillsForCollectionActionTypeEnum })
  // @IsOptional()
  // @IsEnum(BillsForCollectionActionTypeEnum)
  // status?: BillsForCollectionActionTypeEnum;

  // @ApiPropertyOptional({ enum: BillsForCollectionStateEnum })
  // @IsOptional()
  // @IsEnum(BillsForCollectionStateEnum)
  // state?: BillsForCollectionStateEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receivedFromReference?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  receivedOnDate?: Date;

  @ApiPropertyOptional({ enum: DocumentReleaseConditionEnum })
  @IsOptional()
  @IsEnum(DocumentReleaseConditionEnum)
  documentReleaseCondition?: DocumentReleaseConditionEnum;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  issueDate?: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  shipmentOnboardDate?: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  behalfOfBranch?: string;

  @ApiPropertyOptional({ enum: AcknowledgementTransmissionEnum })
  @IsOptional()
  @IsEnum(AcknowledgementTransmissionEnum)
  acknowledgementTransmission?: AcknowledgementTransmissionEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  directCollection?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  sharedLiability?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  urcApply?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  holdDocumentsUntilArrivalGoods?: boolean;

  // @ApiPropertyOptional({ enum: AcceptanceOptionsEnum })
  // @IsOptional()
  // @IsEnum(AcceptanceOptionsEnum)
  // acceptanceOptions?: AcceptanceOptionsEnum;

  // @ApiPropertyOptional({ enum: PaymentOptionsEnum })
  // @IsOptional()
  // @IsEnum(PaymentOptionsEnum)
  // paymentOptions?: PaymentOptionsEnum;

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsBoolean()
  // protestNonAcceptance?: boolean;

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsBoolean()
  // protestNonPayment?: boolean;

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsBoolean()
  // insureGoods?: boolean;

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsBoolean()
  // warehouseGoods?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remittingBankBicCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remittingBankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  remittingBankAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  drawer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  drawerCountry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  drawee?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  draweeCountry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  presentingBankBicCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  presentingBankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  presentingBankAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  payee?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  payeeAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  consignee?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  consigneeAddress?: string;

  @ApiPropertyOptional({ type: [BillsForCollectionDraftDetailsDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillsForCollectionDraftDetailsDto)
  draftDetails?: BillsForCollectionDraftDetailsDto[] | null;

  @ApiPropertyOptional({ type: [BillsForCollectionDocumentDetailsDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillsForCollectionDocumentDetailsDto)
  documentDetails?: BillsForCollectionDocumentDetailsDto[] | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  collectionAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  collectionAmountCurrency?: string;

  @ApiPropertyOptional({ description: 'Base currency', example: 'USD' })
  @IsOptional()
  @IsString()
  baseCcyCurrency: string;

  @ApiPropertyOptional({ description: 'Base currency rate', example: 1.0 })
  @IsOptional()
  @IsNumber()
  baseCcyRate: number;

  @ApiPropertyOptional({
    description: 'Base currency equivalent',
    example: '1000000.00',
  })
  @IsOptional()
  @IsNumber()
  baseCcyEquivalent: number;

  @ApiPropertyOptional({ description: 'Local currency', example: 'EUR' })
  @IsOptional()
  @IsString()
  localCcyCurrency: string;

  @ApiPropertyOptional({ description: 'Local currency rate', example: 0.95 })
  @IsOptional()
  @IsNumber()
  localCcyRate: number;

  @ApiPropertyOptional({
    description: 'Local currency equivalent',
    example: '950000.00',
  })
  @IsOptional()
  @IsNumber()
  localCcyEquivalent: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  multiplePayments?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowPartialPayment?: boolean;

  // @ApiPropertyOptional({ description: 'Margin currency', example: 'USD' })
  // @IsString()
  // @IsOptional()
  // marginCurrency?: string;

  // @ApiPropertyOptional({ description: 'Margin amount', example: 50000.0 })
  // @IsNumber()
  // @IsOptional()
  // marginAmount?: number;

  // @ApiPropertyOptional({ description: 'Margin percentage', example: '10%' })
  // @IsString()
  // @IsOptional()
  // marginPercentage?: string;

  // @ApiPropertyOptional({ description: 'Collateral currency', example: 'USD' })
  // @IsString()
  // @IsOptional()
  // collateralCurrency?: string;

  // @ApiPropertyOptional({ description: 'Collateral amount', example: 100000.0 })
  // @IsNumber()
  // @IsOptional()
  // collateralAmount?: number;

  // @ApiPropertyOptional({ description: 'Collateral percentage', example: '20%' })
  // @IsString()
  // @IsOptional()
  // collateralPercentage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  goodsCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  goodsDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shipmentFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shipmentTo?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  expectedArrivalDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vesselOrAircraft?: string;

  @ApiPropertyOptional({ enum: ChargesBorneByEnum })
  @IsOptional()
  @IsEnum(ChargesBorneByEnum)
  ourChargesBorneBy?: ChargesBorneByEnum;

  @ApiPropertyOptional({ enum: ChargesBorneByEnum })
  @IsOptional()
  @IsEnum(ChargesBorneByEnum)
  overseasChargesBorneBy?: ChargesBorneByEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredCurrencyForCharges?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  taxPayableBy?: string;

  @ApiPropertyOptional({ enum: BillingLevelEnum })
  @IsOptional()
  @IsEnum(BillingLevelEnum)
  billingLevel?: BillingLevelEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  waiveChargesIfRefused?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  collectAllOverseasCharges?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  chargesDeferred?: boolean;

  @ApiPropertyOptional({ enum: DeliveryMeansEnum })
  @IsOptional()
  @IsEnum(DeliveryMeansEnum)
  collectionDeliveryMeans?: DeliveryMeansEnum;

  @ApiPropertyOptional({ enum: DeliveryMeansEnum })
  @IsOptional()
  @IsEnum(DeliveryMeansEnum)
  returnedBillsDeliveryMeans?: DeliveryMeansEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  numberOfPackagesOrDeliveryItems?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  numberOfDraftsToReturnAfterAcceptance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  traceAcknowledgement?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  traceAcceptance?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  tracePayment?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructionsText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responseToSender?: string;

  @ApiPropertyOptional({
    description: 'Whether previously a draft',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}
