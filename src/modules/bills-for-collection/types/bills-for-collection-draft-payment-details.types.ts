export interface BillsForCollectionDraftPaymentDetails {
  draftAmount: number;
  draftAmountCurrency: string;
  outstandingAmount: number;
  outstandingAmountCurrency: string;
  toCollectAmount: number;
  toCollectAmountCurrency: string;
  dueDate: Date;
  valueDue: Date;
  earlyDiscountAmount?: number;
  earlyDiscountAmountCurrency?: string;
  earlyDiscountPercentage?: number;
  discountCutOffDate?: Date;
  lateInterestRate?: number;
  lateInterestAmount?: number;
  lateInterestAmountCurrency?: string;
  lateInterestFromDate?: Date;
  marginAmountUsed?: number;
  marginAmountUsedCurrency?: string;
}
