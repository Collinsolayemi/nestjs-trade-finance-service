import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { UserDetails } from 'src/common/types';
import { IsValidLcTextField } from 'src/common/validators';

export class FreeFormatMessageDto extends UserDetails {
  @ApiPropertyOptional({
    description: 'Request ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  requestId?: string;

  @ApiProperty({
    description: 'Receiver BIC Code',
    example: '1234567890',
  })
  @IsString()
  receiversBankBicCode: string;

  @ApiProperty({
    description: 'Receiver Bank Name',
    example: 'Receiver Bank',
  })
  @IsString()
  receiversBankName: string;

  @ApiProperty({
    description: 'Receiver Bank Address',
    example: '1234567890',
  })
  @IsString()
  receiversBankAddress: string;

  @ApiProperty({
    description:
      'Narrative (each entry: max 1558 chars, 30 rows with max 50 chars per row; \\r\\n after each row except last)',
    example: ['Process refund'],
  })
  @IsArray()
  @IsString({ each: true })
  @MaxLength(1558, {
    each: true,
    message:
      'Each narrative entry can not be longer than 1558. 30 rows with each row having a max of 50 characters; 2 characters (\\r\\n) are added after each row except the last.',
  })
  @IsValidLcTextField(30, 50, { each: true })
  narrative: string[];

  @ApiPropertyOptional({
    description: 'Whether previously a draft',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isDraft?: boolean;
}
