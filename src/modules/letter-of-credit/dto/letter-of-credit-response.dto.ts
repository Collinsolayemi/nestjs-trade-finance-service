import { LetterOfCredit } from '../models/letter-of-credit.model';
import { LetterOfCreditRequest } from '../models/letter-of-credit-request.model';
import { GetLetterOfCreditRequestResponse } from '../interfaces/get-letter-of-credit-records';
import { LetterOfCreditTemplate } from '../models/letter-of-credit-template.model';
import { LetterOfCreditAssignmentOfProceed } from '../models/letter-of-credit-assignment-of-proceed.model';
import { FormNXP } from 'src/modules/regulatory-form/models/form-nxp.model';
import { FormA } from 'src/modules/regulatory-form/models/form-a.model';
import { FormM } from 'src/modules/regulatory-form/models/form-m.model';
import { FormNCX } from 'src/modules/regulatory-form/models/form-ncx.model';

export class LetterOfCreditResponseDto {
  statusCode: number;
  message: string;
  requestId?: string;
  data:
    | LetterOfCreditRequest
    | LetterOfCreditRequest[]
    | LetterOfCredit
    | LetterOfCredit[]
    | LetterOfCreditTemplate
    | LetterOfCreditTemplate[]
    | LetterOfCreditAssignmentOfProceed
    | LetterOfCreditAssignmentOfProceed[]
    | GetLetterOfCreditRequestResponse
    | string
    | number
    | boolean
    | { isValid: boolean; regulatoryForm: FormM | FormNXP | FormNCX | FormA };
}
