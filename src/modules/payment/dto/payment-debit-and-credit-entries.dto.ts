import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class PaymentDebitAndCreditEntriesDto {
  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  payment?: object;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  charges?: object;
}
