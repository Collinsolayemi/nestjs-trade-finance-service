import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ChartOfAccountsLedgerTypeEnum,
  HttpRequestMethodEnum,
} from 'src/common/enums';
import { GetLedgerByIdResponse } from 'src/common/interfaces';
import { HttpClientService } from '../http-client/http-client.service';

@Injectable()
export class ChartOfAccountsService {
  private readonly chartOfAccountsBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpClientService: HttpClientService,
  ) {
    this.chartOfAccountsBaseUrl = this.configService.get<string>(
      'baseUrl.chartOfAccounts',
    );
  }

  async getLedgerBydId(
    token: string,
    id: string,
    ledgerType: ChartOfAccountsLedgerTypeEnum,
  ): Promise<GetLedgerByIdResponse> {
    const url = `${this.chartOfAccountsBaseUrl}/api/v1/accounts/gl/${id}/?ledger_type=${ledgerType}`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: token,
      },
    });

    return data;
  }
}
