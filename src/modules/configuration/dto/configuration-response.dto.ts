import { Clause } from 'src/modules/configuration/models/clause.model';
import { Reference } from 'src/modules/configuration/models/reference.model';
import {
  GetClauseRecordsResponse,
  GetClauseRequestsResponse,
  GetReferenceRecords,
} from '../interfaces/get-configuration-records-response';
import { ClauseRequest } from '../models/clause-request.model';

export class ConfigurationResponseDto {
  statusCode: number;
  message: string;
  requestId?: string;
  data:
    | Clause
    | ClauseRequest
    | Clause[]
    | ClauseRequest[]
    | Reference
    | Reference[]
    | GetClauseRecordsResponse
    | GetClauseRequestsResponse
    | GetReferenceRecords
    | number
    | string;
}
