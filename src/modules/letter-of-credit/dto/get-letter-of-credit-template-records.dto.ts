import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SearchLetterOfCreditTemplateRecordsDto {
  @ApiProperty({
    description: 'LC Reference',
  })
  @IsString()
  templateName?: string;
}
