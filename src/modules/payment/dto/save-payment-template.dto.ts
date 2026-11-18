import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentActionTypeEnum } from '../enums/payment.enum';

export class SavePaymentTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  templateName: string;

  @ApiProperty({ enum: PaymentActionTypeEnum })
  @IsEnum(PaymentActionTypeEnum)
  paymentActionType: PaymentActionTypeEnum;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  applicant?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  templateData?: object;
}
