import { Module } from '@nestjs/common';
import { CamsService } from './cams.service';

@Module({
  providers: [CamsService],
  exports: [CamsService],
})
export class CamsModule {}
