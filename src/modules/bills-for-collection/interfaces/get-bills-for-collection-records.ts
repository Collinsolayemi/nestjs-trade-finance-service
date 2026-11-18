import { GetRecordsResponse } from 'src/common/interfaces';
import { BillsForCollection } from '../models/bills-for-collection.model';
import { BillsForCollectionRequest } from '../models/bills-for-collection-request.model';

export interface GetBillsForCollectionRequestResponse extends GetRecordsResponse {
  billsForCollectionRecords: BillsForCollectionRequest[] | BillsForCollection[];
}
