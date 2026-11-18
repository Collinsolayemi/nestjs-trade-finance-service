import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { UserDetails } from 'src/common/types';

export class ApplyForLetterOfCreditDto extends UserDetails {
  @ApiProperty({
    description: 'Form M Application Number',
    example: 'MF20120003965',
  })
  @IsString()
  formMApplicationNumber?: string;
}
