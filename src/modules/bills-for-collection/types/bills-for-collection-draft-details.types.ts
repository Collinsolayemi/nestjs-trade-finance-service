import {
  BillsForCollectionDraftAgainstEnum,
  TenorPeriodEnum,
} from 'src/common/enums';

export interface BillsForCollectionDraftDetails {
  draftAmount: number;
  draftAmountCurrency?: string;
  draftAgainst: BillsForCollectionDraftAgainstEnum;
  draftIdentifier?: string;
  draftText?: string;
  preAccepted?: boolean;
  tenor: TenorPeriodEnum;
  maturityDate: string;
  lateInterestRate?: number;
  lateInterestStartDate?: Date;
  lateInterestEndDate?: Date;
  graceDays?: number;
  waiveInterestIfReduced?: boolean;
  earlyDiscountPercentage?: number;
  discountCutOffDate?: Date;
  toCollectAmount?: number;
}
