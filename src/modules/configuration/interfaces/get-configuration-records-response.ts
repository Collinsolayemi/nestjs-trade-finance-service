import { ClauseRequest } from '../models/clause-request.model';
import { Clause } from '../models/clause.model';
import { Reference } from '../models/reference.model';
import { GetRecordsResponse } from 'src/common/interfaces';

export interface GetClauseRecordsResponse extends GetRecordsResponse {
  clauseRecords: Clause[];
}

export interface GetClauseRequestsResponse extends GetRecordsResponse {
  clauseRequests: ClauseRequest[];
}

export interface GetReferenceRecords extends GetRecordsResponse {
  referenceRecords: Reference[];
}
