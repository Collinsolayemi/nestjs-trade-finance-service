import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { DocumentUploadDto } from 'src/common/dto/document-upload.dto';

export class GuaranteesDocumentUploadDto extends DocumentUploadDto {
  @ApiProperty({
    description: 'Guarantees Reference Number',
    example: 'SB/GT202304CULC',
  })
  @IsString()
  guaranteesReferenceNumber: string;
}
