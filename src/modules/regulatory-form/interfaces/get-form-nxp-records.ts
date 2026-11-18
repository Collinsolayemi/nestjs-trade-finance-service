import { FormNXP } from '../models/form-nxp.model';
import { GetRecordsResponse } from 'src/common/interfaces';

export interface GetFormNXPRecordsResponse extends GetRecordsResponse {
  formNXPRecords: FormNXP[];
}
