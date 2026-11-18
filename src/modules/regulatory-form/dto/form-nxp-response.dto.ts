import { GetStpExceptionsResponse } from 'src/modules/regulatory-form/interfaces/get-stp-exceptions';
import { GetFormNXPRecordsResponse } from '../interfaces/get-form-nxp-records';
import { FormNXP } from '../models/form-nxp.model';
import { StpException } from '../models/stp-exception.model';
import { StpExceptionRequest } from '../models/stp-exception-request.model';
import { GetStpExceptionRequestsResponse } from '../interfaces/get-stp-exception-requests.dto';

export class FormNXPResponseDto {
  statusCode: number;
  message: string;
  data:
    | FormNXP
    | FormNXP[]
    | StpException
    | StpExceptionRequest
    | StpExceptionRequest[]
    | GetStpExceptionsResponse
    | GetFormNXPRecordsResponse
    | GetStpExceptionRequestsResponse
    | number
    | string;
}
