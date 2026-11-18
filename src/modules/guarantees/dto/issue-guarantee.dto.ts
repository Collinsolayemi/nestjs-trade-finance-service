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
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ConfirmationInstructionEnum,
  DeliveryMeansEnum,
  GuaranteesActionTypeEnum,
  GuaranteesApplicableRulesEnum,
  GuaranteesAvailableByEnum,
  GuaranteesClassificationEnum,
  GuaranteesContractReferenceEnum,
  GuaranteesOverseasChargesPaidByEnum,
  GuaranteesOurChargesPaidByEnum,
  GuaranteesProductTypeEnum,
  GuaranteesRenewOnEnum,
  GuaranteesTaxPaidByEnum,
  GuaranteesTenorStartBoundaryEnum,
  TenorPeriodEnum,
} from 'src/common/enums';
import { UserDetails } from 'src/common/types';
import { GuaranteesAvailableByMixedPaymentDetailsDto } from './guarantees-available-by-mixed-payment-details.dto';
import { GuaranteesDocumentUploadDto } from './guarantees-document-upload.dto';

@ApiExtraModels(
  GuaranteesAvailableByMixedPaymentDetailsDto,
  GuaranteesDocumentUploadDto,
)
export class IssueGuaranteeDto extends UserDetails {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  requestId?: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  tradeProductId: string;

  @ApiProperty({ enum: GuaranteesProductTypeEnum })
  @IsEnum(GuaranteesProductTypeEnum)
  guaranteesProductType?: GuaranteesProductTypeEnum;

  @ApiProperty({ enum: GuaranteesActionTypeEnum })
  @IsEnum(GuaranteesActionTypeEnum)
  guaranteesActionType: GuaranteesActionTypeEnum =
    GuaranteesActionTypeEnum.ISSUANCE;

  @ApiPropertyOptional({
    description: 'Form M Reference Number',
    example: 'MF20220000420',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  applicationNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  principalsReference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relatedReference?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  applicationDate?: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  issueDate?: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  placeOfExpiry?: string;

  @ApiPropertyOptional({ enum: GuaranteesClassificationEnum })
  @IsOptional()
  @IsEnum(GuaranteesClassificationEnum)
  guaranteeClassification?: GuaranteesClassificationEnum;

  @ApiPropertyOptional({ enum: GuaranteesApplicableRulesEnum })
  @IsOptional()
  @IsEnum(GuaranteesApplicableRulesEnum)
  applicableRules?: GuaranteesApplicableRulesEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  otherApplicableRules?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  domesticExpiry?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  operative?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  provisionalDraft?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  applicantName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  applicantAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  applicantAccount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  beneficiaryName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  beneficiaryAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  beneficiaryAccount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  beneficiaryCountry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  advisingBankBicCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  advisingBankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  advisingBankAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  guaranteesAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  guaranteesCurrencyCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Max(10)
  minAmountTolerance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Max(10)
  maxAmountTolerance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additionalAmount?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additionalAmountCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additionalAmountDetails?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  baseCcyCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  baseCcyRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  baseCcyEquivalent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  localCcyCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  localCcyRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  localCcyEquivalent?: number;

  @ApiPropertyOptional({ enum: ConfirmationInstructionEnum })
  @IsOptional()
  @IsEnum(ConfirmationInstructionEnum)
  confirmationInstruction?: ConfirmationInstructionEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  confirmationAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  confirmationAmountCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  confirmationBankBicCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  confirmationBankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  confirmationBankAddress?: string;

  @ApiPropertyOptional({ enum: GuaranteesAvailableByEnum })
  @IsOptional()
  @IsEnum(GuaranteesAvailableByEnum)
  availableBy?: GuaranteesAvailableByEnum;

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

  @ApiPropertyOptional({ type: [GuaranteesAvailableByMixedPaymentDetailsDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuaranteesAvailableByMixedPaymentDetailsDto)
  availableByMixedPaymentDetails?: GuaranteesAvailableByMixedPaymentDetailsDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  partialDrawing?: boolean;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  notPayableBefore?: Date;

  @ApiPropertyOptional({ enum: GuaranteesOurChargesPaidByEnum })
  @IsOptional()
  @IsEnum(GuaranteesOurChargesPaidByEnum)
  ourChargesPaidBy?: GuaranteesOurChargesPaidByEnum;

  @ApiPropertyOptional({ enum: GuaranteesOverseasChargesPaidByEnum })
  @IsOptional()
  @IsEnum(GuaranteesOverseasChargesPaidByEnum)
  overseasChargesPaidBy?: GuaranteesOverseasChargesPaidByEnum;

  @ApiPropertyOptional({ enum: GuaranteesTaxPaidByEnum })
  @IsOptional()
  @IsEnum(GuaranteesTaxPaidByEnum)
  taxPaidBy?: GuaranteesTaxPaidByEnum;

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
  nextAdvisingBankBicCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nextAdvisingBankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nextAdvisingBankAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adviseThroughBankBicCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adviseThroughBankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adviseThroughBankAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adviseThroughBankAccountNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reimbursingBankBicCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reimbursingBankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reimbursingBankAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  principalsBankBicCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  principalsBankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  principalsBankAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  issuingBankBicCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  issuingBankName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  issuingBankAddress?: string;

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
  guaranteeAdditionalInformation?: string;

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
  shipmentDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shipmentPeriod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  billOfLadingAirWaybillNo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vesselName?: string;

  @ApiPropertyOptional({ enum: DeliveryMeansEnum })
  @IsOptional()
  @IsEnum(DeliveryMeansEnum)
  documentsToBeSentBy?: DeliveryMeansEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  numberOfPackagesOrDeliveryItems?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shippingCo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  flightNoOrDetails?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  periodForPresentation?: number;

  @ApiPropertyOptional({ enum: TenorPeriodEnum })
  @IsOptional()
  @IsEnum(TenorPeriodEnum)
  periodForPresentationUnit?: TenorPeriodEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  letterOfIndemnity?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  useFreeFormat?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentsRequired?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  additionalConditions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responseToSender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructionsReceived?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructionsToReimbursingBank?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructionsToPayingBank?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructionsToNextAdvisingBank?: string;

  @ApiPropertyOptional({ enum: GuaranteesContractReferenceEnum })
  @IsOptional()
  @IsEnum(GuaranteesContractReferenceEnum)
  contractReference?: GuaranteesContractReferenceEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contractReferenceNarrative?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  referenceDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  totalOrderContractAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  totalOrderContractAmountCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  guaranteeValuePercentage?: number;

  @ApiPropertyOptional({ enum: GuaranteesRenewOnEnum })
  @IsOptional()
  @IsEnum(GuaranteesRenewOnEnum)
  renewOn?: GuaranteesRenewOnEnum;

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
