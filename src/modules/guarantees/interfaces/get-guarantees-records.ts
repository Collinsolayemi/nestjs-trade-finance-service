import { GetRecordsResponse } from 'src/common/interfaces';
import { Guarantees } from '../models/guarantees.model';
import { GuaranteesRequest } from '../models/guarantees-request.model';

export interface GetGuaranteesRequestResponse extends GetRecordsResponse {
  guaranteesRecords: GuaranteesRequest[] | Guarantees[];
}
