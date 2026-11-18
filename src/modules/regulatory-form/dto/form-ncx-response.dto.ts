import { FormNCX } from '../models/form-ncx.model';
import { GetFormNCXRecordsResponse } from '../interfaces/get-form-ncx-records';

export class FormNCXResponseDto {
  statusCode: number;
  message: string;
  data: FormNCX | GetFormNCXRecordsResponse;
}
