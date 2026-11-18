import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { DocumentUploadDto } from 'src/common/dto/document-upload.dto';

export class BillsForCollectionDocumentUploadDto extends DocumentUploadDto {
  @ApiProperty({
    description: 'Bills Reference Number',
    example: 'BILLS123456789',
  })
  @IsString()
  billsReferenceNumber: string;
}
