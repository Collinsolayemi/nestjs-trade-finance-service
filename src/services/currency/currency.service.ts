import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpRequestMethodEnum } from 'src/common/enums';
import { Currency, GetAllCurrenciesResponse } from 'src/common/interfaces';
import { HttpClientService } from '../http-client/http-client.service';

@Injectable()
export class CurrencyService {
  private readonly currencyBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpClientService: HttpClientService,
  ) {
    this.currencyBaseUrl = this.configService.get<string>('baseUrl.currency');
  }

  async getAllCurrencies(token: string): Promise<Currency[]> {
    const url = `${this.currencyBaseUrl}/api/v2/currency/all`;

    const data = (await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: token,
      },
    })) as GetAllCurrenciesResponse;

    if (!data.data || data.data.length === 0) {
      return [];
    }

    const currencies: Currency[] = data.data.map((currency) => ({
      id: currency.id,
      name: currency.name,
      abbreviation: currency.abbreviation,
      exchange_rate: currency.exchange_rate,
    }));

    return currencies;
  }
}
