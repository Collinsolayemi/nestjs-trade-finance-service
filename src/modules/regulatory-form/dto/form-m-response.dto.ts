import { GetStpExceptionsResponse } from 'src/modules/regulatory-form/interfaces/get-stp-exceptions';
import { GetFormMRecordsResponse } from '../interfaces/get-form-m-records';
import { FormM } from '../models/form-m.model';
import { StpException } from '../models/stp-exception.model';
import { StpExceptionRequest } from '../models/stp-exception-request.model';
import { GetStpExceptionRequestsResponse } from '../interfaces/get-stp-exception-requests.dto';

export class FormMResponseDto {
  statusCode: number;
  message: string;
  data:
    | FormM
    | FormM[]
    | StpException
    | StpExceptionRequest
    | StpExceptionRequest[]
    | GetStpExceptionsResponse
    | GetFormMRecordsResponse
    | GetStpExceptionRequestsResponse
    | number
    | string;
}
