import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { UserDetails } from 'src/common/types';

export class DeleteClausetDto extends UserDetails {
  @ApiProperty({
    description: 'Clause Code',
  })
  @IsString()
  clauseCode: string;
}
