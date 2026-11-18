import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  GuaranteesActionTypeEnum,
  GuaranteesFreeFormatSwiftMessageTypeEnum,
} from 'src/common/enums';
import { UserDetails } from 'src/common/types';

export class GuaranteesFreeFormatDto extends UserDetails {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  requestId?: string;

  @ApiProperty({
    description: 'Action type of the Guarantee',
    example: GuaranteesActionTypeEnum.FREE_FORMAT,
  })
  @IsEnum([GuaranteesActionTypeEnum.FREE_FORMAT])
  guaranteesActionType: GuaranteesActionTypeEnum =
    GuaranteesActionTypeEnum.FREE_FORMAT;

  @ApiProperty({
    example: 'GI-01234-BA',
  })
  @IsString()
  guaranteesReferenceNumber: string;

  @ApiProperty({ enum: GuaranteesFreeFormatSwiftMessageTypeEnum })
  @IsEnum(GuaranteesFreeFormatSwiftMessageTypeEnum)
  messageType: GuaranteesFreeFormatSwiftMessageTypeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relatedReference?: string;

  @ApiProperty()
  @IsString()
  receiversBankBicCode: string;

  @ApiProperty()
  @IsString()
  receiversBankName: string;

  @ApiProperty()
  @IsString()
  receiversBankAddress: string;

  @ApiProperty()
  @IsString()
  narration: string;

  @ApiPropertyOptional({
    description: 'Whether previously a draft',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}
