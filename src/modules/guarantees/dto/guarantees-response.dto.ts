import { Guarantees } from '../models/guarantees.model';
import { GuaranteesRequest } from '../models/guarantees-request.model';
import { GetGuaranteesRequestResponse } from '../interfaces/get-guarantees-records';
import { FormA } from 'src/modules/regulatory-form/models/form-a.model';
import { FormM } from 'src/modules/regulatory-form/models/form-m.model';
import { FormNCX } from 'src/modules/regulatory-form/models/form-ncx.model';
import { FormNXP } from 'src/modules/regulatory-form/models/form-nxp.model';

export class GuaranteesResponseDto {
  statusCode: number;
  message: string;
  requestId?: string;
  data:
    | GuaranteesRequest
    | GuaranteesRequest[]
    | Guarantees
    | Guarantees[]
    | GetGuaranteesRequestResponse
    | string
    | number
    | boolean
    | { isValid: boolean; regulatoryForm: FormM | FormNXP | FormNCX | FormA }
    | {
        chargesAndTaxesCreditEntries: any[];
        chargesAndTaxesDebitEntries: any[];
        postingEntryCreditEntries: any[];
        postingEntryDebitEntries: any[];
        guarantees: Guarantees;
      };
}
