import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpRequestMethodEnum } from 'src/common/enums';
import { HttpClientService } from '../http-client/http-client.service';

@Injectable()
export class TreasuryTradeService {
  private readonly nodeEnv: string;
  private readonly treasuryTradeBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpClientService: HttpClientService,
  ) {
    this.treasuryTradeBaseUrl = this.configService.get<string>(
      'baseUrl.treasuryTrade',
    );
    this.nodeEnv = this.configService.get<string>('nodeEnv');
  }

  async getCounterPartyBySwiftBic(swiftBic: string, token: string) {
    const url = `${this.treasuryTradeBaseUrl}/v1/counter-party/find?isSingleSearch=true&swiftBIC=${swiftBic}`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: token,
      },
    });

    return data?.data;
  }

  async getCustomerTradeAccounts(customerId: string, token: string) {
    const url = `${this.treasuryTradeBaseUrl}/v1/trade-account/customer?customerId=${customerId}`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: token,
      },
    });

    return data?.data;
  }
}
