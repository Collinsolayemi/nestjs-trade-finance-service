import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpRequestMethodEnum } from 'src/common/enums';
import { HttpClientService } from '../http-client/http-client.service';
import { TradeProductData } from 'src/common/interfaces';

@Injectable()
export class TradeProductFactoryService {
  private readonly nodeEnv: string;
  private readonly tradeProductFactoryBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpClientService: HttpClientService,
  ) {
    this.tradeProductFactoryBaseUrl = this.configService.get<string>(
      'baseUrl.tradeProductFactory',
    );
    this.nodeEnv = this.configService.get<string>('nodeEnv');
  }

  async getProductDetails(
    tradeProductId: string,
    token: string,
  ): Promise<TradeProductData> {
    const url = `${this.tradeProductFactoryBaseUrl}/api/v1/products/${tradeProductId}`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: token,
      },
    });
    return data?.data;
  }
}
