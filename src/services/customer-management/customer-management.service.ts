import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CustomerManagementIdTypeEnum,
  HttpRequestMethodEnum,
} from 'src/common/enums';
import { HttpClientService } from '../http-client/http-client.service';

@Injectable()
export class CustomerManagementService {
  private readonly customerManagementBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpClientService: HttpClientService,
  ) {
    this.customerManagementBaseUrl = this.configService.get<string>(
      'baseUrl.customerManagement',
    );
  }

  async getCustomerById(
    token: string,
    idType: CustomerManagementIdTypeEnum,
    id: string,
  ) {
    const url = `${this.customerManagementBaseUrl}/v1/customer/id?field=${idType}&id=${id}`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: token,
      },
    });

    return data;
  }

  async searchCustomerByTIN(token: string, tin: string) {
    const url = `${this.customerManagementBaseUrl}/v1/customer/search?page=1&size=10&search=${tin}&isTIN=true`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: token,
      },
    });

    return data;
  }

  async searchCustomerByAccountNumber(token: string, accountNumber: string) {
    const url = `${this.customerManagementBaseUrl}/v1/customer/search?page=1&size=10&search=${accountNumber}&isAccountNumber=true`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: token,
      },
    });

    return data;
  }
}
