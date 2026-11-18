import { Module } from '@nestjs/common';
import { ChartOfAccountsService } from './chart-of-accounts.service';

@Module({
  providers: [ChartOfAccountsService],
  exports: [ChartOfAccountsService],
})
export class ChartOfAccountsModule {}
