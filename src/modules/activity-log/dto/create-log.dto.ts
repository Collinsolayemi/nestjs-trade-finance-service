import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateActivityLogDto {
  @ApiProperty()
  @IsUUID()
  requestId: string;

  @ApiProperty()
  @IsString()
  description: string;
}
