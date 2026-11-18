import {
  GuaranteesAvailableByEnum,
  GuaranteesTenorStartBoundaryEnum,
  TenorPeriodEnum,
} from 'src/common/enums';

export interface GuaranteesAvailableByMixedPaymentDetail {
  amount: number;
  availableBy: GuaranteesAvailableByEnum;
  availableByPeriod: number;
  availableByPeriodUnit: TenorPeriodEnum;
  tenorStartBoundary: GuaranteesTenorStartBoundaryEnum;
  startDate: Date;
}
