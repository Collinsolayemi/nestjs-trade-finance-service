import { GetTradeJournalPostingResponse } from '../interfaces/get-trade-journal-posting-records';
import { TradeJournalPosting } from '../models/trade-journal-posting.model';

export class TradeJournalPostingResponseDto {
  statusCode: number;
  message: string;
  data:
    | TradeJournalPosting
    | TradeJournalPosting[]
    | GetTradeJournalPostingResponse
    | number;
}
