import { PartialType } from '@nestjs/swagger';
import { CreateCreditLineDto } from './create-credit-line.dto';

export class UpdateCreditLineDto extends PartialType(CreateCreditLineDto) {}
