import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { UserDetails } from '../types';

export class DeactivateActionDto extends UserDetails {
  @ApiProperty({
    description: 'Deactivation Reason',
  })
  @IsString()
  deactivationReason: string;

  @ApiProperty({
    description: 'Supporting Document URL',
  })
  @IsString()
  deactivationReasonSupportingDocumentUrl?: string;
}
