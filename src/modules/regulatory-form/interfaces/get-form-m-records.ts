import { FormM } from '../models/form-m.model';
import { GetRecordsResponse } from 'src/common/interfaces';

export interface GetFormMRecordsResponse extends GetRecordsResponse {
  formMRecords: FormM[];
}
