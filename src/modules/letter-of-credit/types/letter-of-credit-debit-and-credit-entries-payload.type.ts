import {
  CreditAvailableWithEnum,
  LetterOfCreditAmountChangeEnum,
} from 'src/common/enums';

export interface LetterOfCreditDebitAndCreditEntriesPayload {
  token: string;
  localCurrency: string;
  applicantAccount?: string;
  applicantBankBicCode?: string;
  beneficiaryBankSwiftCode?: string;
  requestedConfirmationBankBicCode?: string;
  creditAvailableWith?: CreditAvailableWithEnum;
  creditAvailableWithBankSwiftCode?: string;
  advisingBankBicCode?: string;
  lcAmount: number;
  lcCurrencyCode: string;
  localCcyEquivalent: number;
  localCcyRate: number;
  confirmationAmount: number;
  confirmationAmountCurrency: string;
  marginAmount: number;
  marginCurrency: string;
  preNegotiationAmount: number;
  preNegotiationAmountCurrency: string;
  preNegotiationStartDate: Date;
  collateralAmount: number;
  collateralCurrency: string;
  unconfirmedAmount: number;
  confirmationLineAmount?: number;
  costOfFundsRate: number;
  marginRate: number;
  minCreditAmountTolerance?: number;
  maxCreditAmountTolerance?: number;
  outstandingBalance?: number;
  lcChangeAmount?: number;
  lcAmountChange?: LetterOfCreditAmountChangeEnum;
  payAmount?: number;
  payAmountCurrency?: string;
  presentationAmount?: number;
  presentationAmountCurrency?: string;
  additionalAmount?: number;
  additionalAmountCurrency?: string;
  totalClaimedAmount?: number;
  totalClaimedAmountCurrency?: string;
  chargesAddedAmount?: number;
  chargesAddedCurrency?: string;
  chargesDeductedAmount?: number;
  chargesDeductedCurrency?: string;
  documentAmount?: number;
  documentAmountCurrency?: string;
  previousIssueDate?: Date | null;
  previousExpiryDate?: Date | null;
  previousLatestShipmentDate?: Date | null;
}
