import { TradeJournalPosting } from '../models/trade-journal-posting.model';
import { GetRecordsResponse } from 'src/common/interfaces';

export interface GetTradeJournalPostingResponse extends GetRecordsResponse {
  tradeJournalPostingRecords: TradeJournalPosting[];
}
