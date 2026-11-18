import { BillsForCollectionAcceptanceEnum } from 'src/common/enums';

export interface BillsForCollectionPaymentToAccept {
  draftIdentifier?: string;
  baseDate: Date;
  maturityDate: Date;
  acceptance: BillsForCollectionAcceptanceEnum;
}
