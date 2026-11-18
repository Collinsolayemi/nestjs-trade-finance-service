import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { AxiosRequestConfig } from 'axios';
import { HttpRequestMethodEnum } from 'src/common/enums';
import { HttpClientService } from '../http-client/http-client.service';

@Injectable()
export class DocumentManagementService {
  private readonly documentManagementBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpClientService: HttpClientService,
  ) {
    this.documentManagementBaseUrl = this.configService.get<string>(
      'baseUrl.documentManagement',
    );
  }

  async uploadFile(filePath: string, token?: string) {
    const url = `${this.documentManagementBaseUrl}/api/v1/docs/upload`;

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.POST,
      headers: {
        Authorization: token,
        ...formData.getHeaders(),
      },
      data: formData,
    });

    return data?.data;
  }

  async getFile(url: string, token: string, options: AxiosRequestConfig) {
    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: token,
      },
      ...options,
    });

    return data;
  }
}
