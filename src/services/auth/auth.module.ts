import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AppRedisModule } from '../redis/redis.module';
import { ScheduleModule } from '@nestjs/schedule';

@Global()
@Module({
  imports: [AppRedisModule, ScheduleModule.forRoot()],
  providers: [AuthService],
  controllers: [],
  exports: [AuthService],
})
export class AuthModule {}
