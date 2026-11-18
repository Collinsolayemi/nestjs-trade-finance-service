import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpRequestMethodEnum } from 'src/common/enums';
import {
  ConcessionGroup,
  ConcessionGroupByChargeApiResponse,
} from 'src/common/interfaces';
import { HttpClientService } from '../http-client/http-client.service';

@Injectable()
export class ConcessionGroupService {
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpClientService: HttpClientService,
  ) {
    this.baseUrl = this.configService.get<string>('baseUrl.concessionGroup');
  }

  async getConcessionGroupsByChargeId(
    chargeId: string,
    token: string,
    customerId?: string,
  ): Promise<ConcessionGroup[]> {
    let url = `${this.baseUrl}/v1/concession-group/by-charge/${chargeId}`;
    if (customerId) {
      url += `?customerId=${encodeURIComponent(customerId)}`;
    }

    const response = (await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: { Authorization: token },
    })) as ConcessionGroupByChargeApiResponse;

    return response?.data ?? [];
  }
}
