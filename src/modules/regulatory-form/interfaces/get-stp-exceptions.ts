import { StpException } from 'src/modules/regulatory-form/models/stp-exception.model';
import { GetRecordsResponse } from 'src/common/interfaces';

export interface GetStpExceptionsResponse extends GetRecordsResponse {
  stpExceptions: StpException[];
}
