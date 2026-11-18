import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { StpExceptionResolveTypeEnum } from 'src/common/enums';
import { UserDetails } from 'src/common/types';

export class ResolveStpExceptionDto extends UserDetails {
  @ApiPropertyOptional({
    type: String,
    description: 'STP Exception ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  stpExceptionId: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Customer Account Number',
    example: '1234567890',
  })
  @IsOptional()
  customerAccount?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Add TIN to Customer Account',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  addTinToCustomerAccount?: boolean;

  @ApiPropertyOptional({
    enum: StpExceptionResolveTypeEnum,
    description: 'STP Exception Resolve Type',
  })
  @IsEnum(StpExceptionResolveTypeEnum)
  stpExceptionResolveType: StpExceptionResolveTypeEnum;
}
