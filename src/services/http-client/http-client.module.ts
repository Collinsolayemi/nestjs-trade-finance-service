import { Global, Logger, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HttpClientService } from './http-client.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [Logger, HttpClientService],
  exports: [HttpClientService],
})
export class HttpClientModule {}
