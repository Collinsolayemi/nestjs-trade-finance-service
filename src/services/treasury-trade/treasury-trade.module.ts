import { Module } from '@nestjs/common';
import { TreasuryTradeService } from './treasury-trade.service';

@Module({
  imports: [],
  providers: [TreasuryTradeService],
  controllers: [],
  exports: [TreasuryTradeService],
})
export class TreasuryTradeServiceModule {}
