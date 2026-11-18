import { GetRecordsResponse } from 'src/common/interfaces';
import { StpExceptionRequest } from '../models/stp-exception-request.model';

export interface GetStpExceptionRequestsResponse extends GetRecordsResponse {
  stpExceptionRequests: StpExceptionRequest[];
}
