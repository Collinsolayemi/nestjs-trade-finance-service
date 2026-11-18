import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpRequestMethodEnum } from 'src/common/enums';
import {
  TrmsFormAApplicationResponse,
  TrmsFormADetails,
  TrmsFormNCXApplicationResponse,
  TrmsFormNCXDetails,
  TrmsFormNXPApplicationResponse,
  TrmsFormNXPDetails,
} from 'src/common/interfaces';
import { HttpClientService } from '../http-client/http-client.service';
import * as qs from 'qs';

@Injectable()
export class TRMSService {
  private readonly trmsBaseUrl: string;
  private readonly trmsUsername: string;
  private readonly trmsPassword: string;
  private readonly trmsGrantType: string;
  private readonly trmsBasicAuthUsername: string;
  private readonly trmsBasicAuthPassword: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpClientService: HttpClientService,
  ) {
    this.trmsBaseUrl = this.configService.get<string>('baseUrl.trms');
    this.trmsUsername = this.configService.get<string>(
      'credentials.trmsUsername',
    );
    this.trmsPassword = this.configService.get<string>(
      'credentials.trmsPassword',
    );
    this.trmsGrantType = this.configService.get<string>(
      'credentials.trmsGrantType',
    );
    this.trmsBasicAuthUsername = this.configService.get<string>(
      'credentials.trmsBasicAuthUsername',
    );
    this.trmsBasicAuthPassword = this.configService.get<string>(
      'credentials.trmsBasicAuthPassword',
    );
  }

  async login(): Promise<string> {
    const url = `${this.trmsBaseUrl}/oauth/token`;

    const params = {
      username: this.trmsUsername,
      password: this.trmsPassword,
      grant_type: this.trmsGrantType,
    };

    const basicAuth = Buffer.from(
      `${this.trmsBasicAuthUsername}:${this.trmsBasicAuthPassword}`,
    ).toString('base64');

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.POST,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      data: qs.stringify(params),
    });

    return data?.access_token;
  }

  async getPendingFormNXPApplications(
    token: string,
    orderBy: string,
    sort: string,
    size: number,
    page: number,
  ): Promise<TrmsFormNXPApplicationResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('orderBy', orderBy);
    queryParams.append('sort', sort);
    queryParams.append('size', size.toString());
    queryParams.append('page', page.toString());
    queryParams.append('gSearch', '');
    queryParams.append('option', '');

    const url = `${this.trmsBaseUrl}/api/v1/form-nxp/pending-applications?${queryParams.toString()}`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data?.responseResult;
  }

  async getFormNXPDetails(
    token: string,
    id: number | string,
  ): Promise<TrmsFormNXPDetails> {
    const url = `${this.trmsBaseUrl}/api/v1/form-nxp/${id}`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data?.responseResult;
  }

  async getPendingFormNCXApplications(
    token: string,
    orderBy: string,
    sort: string,
    size: number,
    page: number,
  ): Promise<TrmsFormNCXApplicationResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('orderBy', orderBy);
    queryParams.append('sort', sort);
    queryParams.append('size', size.toString());
    queryParams.append('page', page.toString());
    queryParams.append('gSearch', '');
    queryParams.append('option', '');

    const url = `${this.trmsBaseUrl}/api/v1/form-ncx/pending-applications?${queryParams.toString()}`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data?.responseResult;
  }

  async getFormNCXDetails(
    token: string,
    id: number | string,
  ): Promise<TrmsFormNCXDetails> {
    const url = `${this.trmsBaseUrl}/api/v1/form-ncx/${id}`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data?.responseResult;
  }

  async getPendingFormAApplications(
    token: string,
    orderBy: string,
    sort: string,
    size: number,
    page: number,
  ): Promise<TrmsFormAApplicationResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('orderBy', orderBy);
    queryParams.append('sort', sort);
    queryParams.append('size', size.toString());
    queryParams.append('page', page.toString());
    queryParams.append('gSearch', '');
    queryParams.append('option', '');

    const url = `${this.trmsBaseUrl}/api/v1/form-a/pending-applications?${queryParams.toString()}`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data?.responseResult;
  }

  async getFormADetails(
    token: string,
    id: number | string,
  ): Promise<TrmsFormADetails> {
    const url = `${this.trmsBaseUrl}/api/v1/form-a/${id}`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data?.responseResult;
  }
}
