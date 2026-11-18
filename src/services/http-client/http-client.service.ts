import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import * as http from 'http';
import * as https from 'https';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class HttpClientService {
  private readonly httpAgent = new http.Agent({
    keepAlive: true,
    keepAliveMsecs: 30_000,
    maxSockets: 50,
  });
  private readonly httpsAgent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 30_000,
    maxSockets: 50,
  });

  constructor(
    private readonly httpService: HttpService,
    @Inject(Logger) private readonly loggerService: LoggerService,
  ) {
    this.httpService.axiosRef.defaults.httpAgent = this.httpAgent;
    this.httpService.axiosRef.defaults.httpsAgent = this.httpsAgent;
  }

  async makeHttpRequest<T = any>(
    url: string,
    options: AxiosRequestConfig,
  ): Promise<T> {
    this.loggerService.debug(
      `HTTP → ${(options.method || 'GET').toUpperCase()} ${url}`,
      HttpClientService.name,
    );

    const { data } = await lastValueFrom(
      this.httpService.request<T>({ url, ...options }),
    );

    return data;
  }
}
