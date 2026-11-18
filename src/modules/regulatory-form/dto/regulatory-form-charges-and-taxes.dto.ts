import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsUUID,
  ValidateNested,
  IsArray,
} from 'class-validator';

export class RegulatoryFormChargeDto {
  @ApiProperty({
    description: 'Unique identifier for the charge',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsString()
  @IsUUID()
  chargeId: string;
}

export class RegulatoryFormTaxDto {
  @ApiProperty({
    description: 'Unique identifier for the tax',
    example: '123e4567-e89b-12d3-a456-426614174001',
    format: 'uuid',
  })
  @IsString()
  @IsUUID()
  taxId: string;
}

export class CreateRegulatoryFormChargesAndTaxesDto {
  @ApiProperty({
    description: 'Array of Form M charges',
    type: [RegulatoryFormChargeDto],
    required: false,
    example: [
      { chargeId: '123e4567-e89b-12d3-a456-426614174000' },
      { chargeId: '123e4567-e89b-12d3-a456-426614174002' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegulatoryFormChargeDto)
  regulatoryFormCharges?: RegulatoryFormChargeDto[];

  @ApiProperty({
    description: 'Array of Form M taxes',
    type: [RegulatoryFormTaxDto],
    required: false,
    example: [
      { taxId: '123e4567-e89b-12d3-a456-426614174001' },
      { taxId: '123e4567-e89b-12d3-a456-426614174003' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegulatoryFormTaxDto)
  regulatoryFormTaxes?: RegulatoryFormTaxDto[];
}
