import { InwardBankPayment } from '../models/inward-bank-payment.model';
import { InwardCustomerPayment } from '../models/inward-customer-payment.model';
import { PaymentRequest } from '../models/payment-request.model';
import { PaymentTemplate } from '../models/payment-template.model';

export class PaymentResponseDto {
  statusCode: number;
  message: string;
  requestId?: string;
  data:
    | PaymentRequest
    | PaymentRequest[]
    | InwardBankPayment
    | InwardBankPayment[]
    | InwardCustomerPayment
    | InwardCustomerPayment[]
    | PaymentTemplate
    | PaymentTemplate[]
    | object;
}
