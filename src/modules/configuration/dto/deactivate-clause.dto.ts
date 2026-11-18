import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { DeactivateActionDto } from 'src/common/dto/deactivate-action.dto';

export class DeactivateClauseDto extends DeactivateActionDto {
  @ApiProperty({
    description: 'Clause Code',
  })
  @IsString()
  clauseCode: string;
}
