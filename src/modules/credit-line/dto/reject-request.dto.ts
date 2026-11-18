import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { uuidv7 } from 'uuidv7';

export class RejectRequestDto {
  @ApiProperty({
    example: 'Rejecting request because...',
  })
  @IsString()
  reasonForRejection: string;

  @ApiProperty({
    example: 'David Osaro',
  })
  @IsOptional()
  @IsString()
  newInitiatorFullName?: string;

  @ApiProperty({
    example: uuidv7(),
  })
  @IsOptional()
  @IsString()
  newInitiatorId?: string;

  @ApiProperty({
    example: 'O097',
  })
  @IsOptional()
  @IsString()
  newInitiatorBranchCode?: string;

  @ApiProperty({
    example: 'Test Department',
  })
  @IsOptional()
  @IsString()
  newInitiatorDepartment?: string;
}
