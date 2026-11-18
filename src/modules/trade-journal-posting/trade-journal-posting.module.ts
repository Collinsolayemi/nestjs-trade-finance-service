import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TradeJournalPosting as TradeJournalPostingModel } from './models/trade-journal-posting.model';
import { TradeJournalPostingRepository } from './trade-journal-posting.repository';
import { TradeJournalPostingService } from './trade-journal-posting.service';
import { TradeJournalPostingController } from './trade-journal-posting.controller';
import { FiscalPeriodService } from 'src/services/fiscal-period/fiscal-period.service';
import { ProductManagementService } from 'src/services/product-management/product-management.service';
import { CurrencyService } from 'src/services/currency/currency.service';
import { CamsService } from 'src/services/cams/cams.service';

@Module({
  imports: [SequelizeModule.forFeature([TradeJournalPostingModel])],
  providers: [
    CamsService,
    CurrencyService,
    FiscalPeriodService,
    ProductManagementService,
    TradeJournalPostingRepository,
    TradeJournalPostingService,
  ],
  controllers: [TradeJournalPostingController],
})
export class TradeJournalPostingModule {}
