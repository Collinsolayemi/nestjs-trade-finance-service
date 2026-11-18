import { FormNCX } from '../models/form-ncx.model';
import { GetRecordsResponse } from 'src/common/interfaces';

export interface GetFormNCXRecordsResponse extends GetRecordsResponse {
  formNCXRecords: FormNCX[];
}
