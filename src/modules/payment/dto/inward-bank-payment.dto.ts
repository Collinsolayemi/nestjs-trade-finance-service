import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';
import { UserDetails } from 'src/common/types';

export class InwardBankPaymentDto extends UserDetails {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  applicationNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paymentReferenceNumber?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  metadata?: object;
}
