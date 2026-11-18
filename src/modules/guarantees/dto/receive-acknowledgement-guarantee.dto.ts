import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  GuaranteesActionTypeEnum,
  GuaranteesReceivedFromEnum,
} from 'src/common/enums';
import { UserDetails } from 'src/common/types';
import { GuaranteesDocumentUploadDto } from './guarantees-document-upload.dto';

export class ReceiveAcknowledgementGuaranteeDto extends UserDetails {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  requestId?: string;

  @ApiProperty({
    description: 'Action type of the Guarantee',
    example: GuaranteesActionTypeEnum.RECEIVE_ACKNOWLEDGEMENT,
  })
  @IsEnum([GuaranteesActionTypeEnum.RECEIVE_ACKNOWLEDGEMENT])
  guaranteesActionType: GuaranteesActionTypeEnum =
    GuaranteesActionTypeEnum.RECEIVE_ACKNOWLEDGEMENT;

  @ApiProperty({
    example: 'GI-01234-BA',
  })
  @IsString()
  guaranteesReferenceNumber: string;

  @ApiPropertyOptional({ enum: GuaranteesReceivedFromEnum })
  @IsOptional()
  @IsEnum(GuaranteesReceivedFromEnum)
  receivedFrom?: GuaranteesReceivedFromEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receivedFromReference?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  dateReceived?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  narrative?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  chargesClaimed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  chargesDebited?: boolean;

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
