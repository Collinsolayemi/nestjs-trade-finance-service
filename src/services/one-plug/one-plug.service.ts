import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CipherAlgorithmEnum,
  HttpRequestMethodEnum,
  IANATimeZoneDatabaseEnum,
} from 'src/common/enums';
import encryptPlainText from 'src/common/utils/encrypt-plain-text.util';
import { HttpClientService } from '../http-client/http-client.service';
import decryptCipherText from 'src/common/utils/decrypt-cipher-text';
import * as moment from 'moment-timezone';

@Injectable()
export class OnePlugService {
  private readonly onePlugBaseUrl: string;
  private readonly onePlugServiceKey: string;
  private readonly onePlugServiceIV: string;
  private readonly onePlugServiceEmail: string;
  private readonly onePlugServicePassword: string;
  private readonly onePlugServiceEndpointEmail: string;
  private readonly onePlugServiceEndpointPassword: string;
  private readonly onePlugServiceEndpointSecretKey: string;
  private readonly onePlugServiceEndpointSecretIv: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpClientService: HttpClientService,
  ) {
    this.onePlugBaseUrl = this.configService.get<string>('baseUrl.onePlug');
    this.onePlugServiceKey = this.configService.get<string>(
      'credentials.onePlugServiceKey',
    );
    this.onePlugServiceIV = this.configService.get<string>(
      'credentials.onePlugServiceIV',
    );
    this.onePlugServiceEmail = this.configService.get<string>(
      'credentials.onePlugServiceEmail',
    );
    this.onePlugServicePassword = this.configService.get<string>(
      'credentials.onePlugServicePassword',
    );
    this.onePlugServiceEndpointEmail = this.configService.get<string>(
      'credentials.onePlugServiceEndpointEmail',
    );
    this.onePlugServiceEndpointPassword = this.configService.get<string>(
      'credentials.onePlugServiceEndpointPassword',
    );
    this.onePlugServiceEndpointSecretKey = this.configService.get<string>(
      'credentials.onePlugServiceEndpointSecretKey',
    );
    this.onePlugServiceEndpointSecretIv = this.configService.get<string>(
      'credentials.onePlugServiceEndpointSecretIv',
    );
  }

  async login() {
    const url = `${this.onePlugBaseUrl}/api/UserProfile/login`;
    const payload = {
      email: this.onePlugServiceEmail,
      password: this.onePlugServicePassword,
    };

    const encryptedText = encryptPlainText(
      JSON.stringify(payload),
      this.onePlugServiceKey,
      this.onePlugServiceIV,
      CipherAlgorithmEnum.AES_128_CBC,
    );

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.POST,
      headers: {
        'Content-Type': 'application/json',
      },
      data: { request: encryptedText },
    });

    const encryptedData = data.response;

    const decryptedResponse = decryptCipherText(
      encryptedData,
      this.onePlugServiceKey,
      this.onePlugServiceIV,
      CipherAlgorithmEnum.AES_128_CBC,
    );

    const parsedDecryptedResponse = JSON.parse(decryptedResponse);

    if (!parsedDecryptedResponse?.isSuccess) {
      throw new UnauthorizedException('OnePlug login failed');
    }

    return parsedDecryptedResponse;
  }

  async onePlugBodogwuLogin(onePlugToken: string) {
    const onePlugBodogwuLoginPayload = {
      login: this.onePlugServiceEndpointEmail,
      password: this.onePlugServiceEndpointPassword,
    };

    const encryptedBodogwuLoginPayload = encryptPlainText(
      JSON.stringify(onePlugBodogwuLoginPayload),
      this.onePlugServiceEndpointSecretKey,
      this.onePlugServiceEndpointSecretIv,
      CipherAlgorithmEnum.AES_256_CBC,
    );

    const onePlugBodogwuLoginUrl = `${this.onePlugBaseUrl}/api/Auth/Login`;

    const onePlugBodogwuLoginResponse =
      await this.httpClientService.makeHttpRequest(onePlugBodogwuLoginUrl, {
        method: HttpRequestMethodEnum.POST,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${onePlugToken}`,
        },
        data: { request: encryptedBodogwuLoginPayload },
      });

    const decryptedOnePlugBodogwuLoginResponse = decryptCipherText(
      onePlugBodogwuLoginResponse?.response,
      this.onePlugServiceEndpointSecretKey,
      this.onePlugServiceEndpointSecretIv,
      CipherAlgorithmEnum.AES_256_CBC,
    );

    const parsedOnePlugBodogwuLoginResponse = JSON.parse(
      decryptedOnePlugBodogwuLoginResponse,
    );

    return parsedOnePlugBodogwuLoginResponse;
  }

  async onePlugBodogwuGetByCriteria(
    onePlugToken: string,
    onePlugBodogwuToken: string,
    pageNumber: number,
    pageSize: number,
  ) {
    const onePlugBodogwuGetFullAssesmentNoticesUrl = `${this.onePlugBaseUrl}/back/api/BankAuditForm/GetByCriteria?dateFrom=${moment().tz(IANATimeZoneDatabaseEnum.LAGOS).format('YYYY-MM-DD')}&dateTo=${moment().tz(IANATimeZoneDatabaseEnum.LAGOS).format('YYYY-MM-DD')}&pageNumber=${pageNumber}&pageSize=${pageSize}`;

    const onePlugBodogwuGetByCriteriaResponse =
      await this.httpClientService.makeHttpRequest(
        onePlugBodogwuGetFullAssesmentNoticesUrl,
        {
          method: HttpRequestMethodEnum.GET,
          headers: {
            Authorization: `Bearer ${onePlugToken}`,
            targetBearer: `Bearer ${onePlugBodogwuToken}`,
          },
        },
      );

    if (
      !onePlugBodogwuGetByCriteriaResponse?.response ||
      onePlugBodogwuGetByCriteriaResponse?.response === '' ||
      Object.keys(onePlugBodogwuGetByCriteriaResponse?.response || {})
        .length === 0
    ) {
      return null;
    }

    const decryptedOnePlugBodogwuGetByCriteriaResponse = decryptCipherText(
      onePlugBodogwuGetByCriteriaResponse?.response,
      this.onePlugServiceEndpointSecretKey,
      this.onePlugServiceEndpointSecretIv,
      CipherAlgorithmEnum.AES_256_CBC,
    );

    const parsedOnePlugBodogwuGetByCriteriaResponse = JSON.parse(
      decryptedOnePlugBodogwuGetByCriteriaResponse,
    );

    return parsedOnePlugBodogwuGetByCriteriaResponse;
  }

  async onePlugBodogwuGetByReferenceNumber(
    onePlugToken: string,
    onePlugBodogwuToken: string,
    referenceNumber: string,
  ) {
    const onePlugBodogwuGetFullAssesmentNoticesUrl = `${this.onePlugBaseUrl}/back/api/BankAuditForm/GetByReference?formNumber=${referenceNumber}`;

    const onePlugBodogwuGetByReferenceNumberResponse =
      await this.httpClientService.makeHttpRequest(
        onePlugBodogwuGetFullAssesmentNoticesUrl,
        {
          method: HttpRequestMethodEnum.GET,
          headers: {
            Authorization: `Bearer ${onePlugToken}`,
            targetBearer: `Bearer ${onePlugBodogwuToken}`,
          },
        },
      );

    if (
      !onePlugBodogwuGetByReferenceNumberResponse?.response ||
      onePlugBodogwuGetByReferenceNumberResponse?.response === '' ||
      Object.keys(onePlugBodogwuGetByReferenceNumberResponse?.response || {})
        .length === 0
    ) {
      return null;
    }

    const decryptedOnePlugBodogwuGetByReferenceNumberResponse =
      decryptCipherText(
        onePlugBodogwuGetByReferenceNumberResponse?.response,
        this.onePlugServiceEndpointSecretKey,
        this.onePlugServiceEndpointSecretIv,
        CipherAlgorithmEnum.AES_256_CBC,
      );

    const parsedOnePlugBodogwuGetByReferenceNumberResponse = JSON.parse(
      decryptedOnePlugBodogwuGetByReferenceNumberResponse,
    );

    return parsedOnePlugBodogwuGetByReferenceNumberResponse;
  }
}
