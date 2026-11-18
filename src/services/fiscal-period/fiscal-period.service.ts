import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpRequestMethodEnum } from 'src/common/enums';
import { HttpClientService } from '../http-client/http-client.service';

@Injectable()
export class FiscalPeriodService {
  private readonly fiscalPeriodBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpClientService: HttpClientService,
  ) {
    this.fiscalPeriodBaseUrl = this.configService.get<string>(
      'baseUrl.fiscalPeriod',
    );
  }

  async dateInfo(date: string, token: string) {
    const url = `${this.fiscalPeriodBaseUrl}/api/v2/fiscal-periods/date-info`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.POST,
      headers: {
        Authorization: token,
      },
      data: { date: date },
    });

    return data?.data;
  }
}
