import { BillsForCollection } from '../models/bills-for-collection.model';
import { BillsForCollectionRequest } from '../models/bills-for-collection-request.model';
import { GetBillsForCollectionRequestResponse } from '../interfaces/get-bills-for-collection-records';
import { FormA } from 'src/modules/regulatory-form/models/form-a.model';
import { FormM } from 'src/modules/regulatory-form/models/form-m.model';
import { FormNCX } from 'src/modules/regulatory-form/models/form-ncx.model';
import { FormNXP } from 'src/modules/regulatory-form/models/form-nxp.model';

export class BillsForCollectionResponseDto {
  statusCode: number;
  message: string;
  requestId?: string;
  data:
    | BillsForCollectionRequest
    | BillsForCollectionRequest[]
    | BillsForCollection
    | BillsForCollection[]
    | GetBillsForCollectionRequestResponse
    | string
    | number
    | boolean
    | { isValid: boolean; regulatoryForm: FormM | FormNXP | FormNCX | FormA }
    | {
        chargesAndTaxesCreditEntries: any[];
        chargesAndTaxesDebitEntries: any[];
        postingEntryCreditEntries: any[];
        postingEntryDebitEntries: any[];
        billsForCollection: BillsForCollection;
      };
}
