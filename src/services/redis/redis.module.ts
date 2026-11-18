import { Global, Logger, Module } from '@nestjs/common';
import { AppRedisService } from './redis.service';

@Global()
@Module({
  imports: [],
  providers: [Logger, AppRedisService],
  exports: [AppRedisService],
})
export class AppRedisModule {}
