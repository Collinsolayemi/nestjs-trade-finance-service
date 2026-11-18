import {
  GuaranteesPaymentAvailableByEnum,
  GuaranteesTenorStartBoundaryEnum,
  PaymentActionTypeEnum,
  TenorPeriodEnum,
} from 'src/common/enums';

export interface GuaranteesMixedPaymentDetail {
  amount: number;
  amountCurrency: string;
  paymentAction: PaymentActionTypeEnum;
  availableBy: GuaranteesPaymentAvailableByEnum;
  valueDate: Date;
  availableByPeriod?: number;
  availableByPeriodUnit?: TenorPeriodEnum;
  tenorStartBoundary?: GuaranteesTenorStartBoundaryEnum;
  startDate?: Date;
}
