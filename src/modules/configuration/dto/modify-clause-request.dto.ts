import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { UserDetails } from 'src/common/types';

export class ModifyClausetDto extends UserDetails {
  @ApiProperty({
    description: 'Clause Code',
  })
  @IsString()
  clauseCode: string;

  @ApiPropertyOptional({
    description: 'Title of the clause',
    example: 'Loan Terms Clause',
  })
  @IsString()
  @IsOptional()
  clauseField: string;

  @ApiPropertyOptional({
    description: 'Associated product',
    example: 'Personal Loan',
  })
  @IsString()
  @IsOptional()
  clauseName: string;

  @ApiPropertyOptional({
    description: 'Type of the product',
    example: 'Secured',
  })
  @IsString()
  @IsOptional()
  clauseText: string;
}
