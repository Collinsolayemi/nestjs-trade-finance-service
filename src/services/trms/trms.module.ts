import { Module } from '@nestjs/common';
import { TRMSService } from './trms.service';

@Module({
  providers: [TRMSService],
  exports: [TRMSService],
})
export class TRMSModule {}
