import { BillsForCollectionDraftDetails } from './bills-for-collection-draft-details.types';

export interface BillsForCollectionDebitAndCreditEntriesPayload {
  token: string;
  drawee: string;
  drawer: string;
  remittingBankBicCode: string;
  presentingBankBicCode: string;
  collectionAmount: number;
  collectionAmountCurrency: string;
  draftDetails: BillsForCollectionDraftDetails[] | null;
  localCurrency: string;
  baseCcyEquivalent: number;
  localCcyEquivalent: number;
  localCcyRate: number;
  marginAmount: number;
  marginCurrency: string;
  collateralAmount: number;
  collateralCurrency: string;
  amountCollected?: number;
  amountCollectedCurrency?: string;
  amountAccepted?: number;
  amountAcceptedCurrency?: string;
}
