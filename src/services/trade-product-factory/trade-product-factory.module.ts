import { Module } from '@nestjs/common';
import { TradeProductFactoryService } from './trade-product-factory.service';

@Module({
  imports: [],
  providers: [TradeProductFactoryService],
  controllers: [],
  exports: [TradeProductFactoryService],
})
export class TradeProductFactoryModule {}
