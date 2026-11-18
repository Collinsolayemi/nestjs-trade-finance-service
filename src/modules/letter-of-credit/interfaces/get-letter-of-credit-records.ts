import { LetterOfCreditRequest } from '../models/letter-of-credit-request.model';
import { GetRecordsResponse } from 'src/common/interfaces';
import { LetterOfCredit } from '../models/letter-of-credit.model';

export interface GetLetterOfCreditRequestResponse extends GetRecordsResponse {
  letterOfCreditRecords: LetterOfCreditRequest[] | LetterOfCredit[];
}
