import { Module } from '@nestjs/common';
import { OnePlugService } from './one-plug.service';

@Module({
  providers: [OnePlugService],
  exports: [OnePlugService],
})
export class OnePlugModule {}
