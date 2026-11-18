import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsUUID,
  ValidateIf,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApprovalStatusEnum, ReasonForRejectionEnum } from 'src/common/enums';
import { UserDetails } from 'src/common/types';

export class AuthorizeActionDto extends UserDetails {
  @IsUUID()
  @IsOptional()
  id: string;

  @ApiProperty({
    enum: ApprovalStatusEnum,
  })
  @IsEnum(ApprovalStatusEnum)
  approvalStatus: ApprovalStatusEnum;

  @ApiProperty({
    example: 'Invalid User Details.',
    description:
      'Required only when approvalStatus is REJECTED. Otherwise, it should be omitted.',
    required: false,
  })
  @ValidateIf((o) => o.approvalStatus === ApprovalStatusEnum.REJECTED)
  @IsString({
    message: `reasonForRejection must be a string when approvalStatus is ${ApprovalStatusEnum.REJECTED}`,
  })
  @IsNotEmpty({
    message: `reasonForRejection is required when approvalStatus is ${ApprovalStatusEnum.REJECTED}`,
  })
  reasonForRejection?: string;

  @ApiProperty({
    example: 'Additional Notes For Rejection',
    description:
      'Required only when reasonForRejection is "Others". Otherwise, it should be omitted.',
    required: false,
  })
  @ValidateIf((o) => o.reasonForRejection === ReasonForRejectionEnum.OTHERS)
  @IsString({
    message: `rejectionNotes must be a string when approvalStatus is ${ReasonForRejectionEnum.OTHERS}`,
  })
  @IsNotEmpty({
    message: `rejectionNotes is required when approvalStatus is ${ReasonForRejectionEnum.OTHERS}`,
  })
  rejectionNotes?: string;
}
