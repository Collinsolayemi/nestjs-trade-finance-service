import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CipherAlgorithmEnum, HttpRequestMethodEnum } from 'src/common/enums';
import encryptPlainText from 'src/common/utils/encrypt-plain-text.util';
import { HttpClientService } from '../http-client/http-client.service';

@Injectable()
export class ComplianceService {
  private readonly complianceUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpClientService: HttpClientService,
  ) {
    this.complianceUrl = this.configService.get<string>('baseUrl.compliance');
  }

  async isBvnBlackListed(bvn: string, email: string) {
    const url = `${this.complianceUrl}/api/Compliance/IsBvnBlackListed`;
    const payload = { bvn, email };

    const encryptedText = encryptPlainText(
      JSON.stringify(payload),
      this.configService.get<string>('credentials.complianceServiceKey'),
      this.configService.get<string>('credentials.complianceServiceIV'),
      CipherAlgorithmEnum.AES_256_CBC,
    );

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.POST,
      headers: {
        'Content-Type': 'application/json',
      },
      data: { data: encryptedText },
    });

    const decryptedResponse = await this.decryptComplianceResponse(data);

    return decryptedResponse;
  }

  async isBvnWatchListed(bvn: string, email: string) {
    const url = `${this.complianceUrl}/api/Compliance/IsBvnWatchListed`;
    const payload = { bvn, email };

    const encryptedText = encryptPlainText(
      JSON.stringify(payload),
      this.configService.get<string>('credentials.complianceServiceKey'),
      this.configService.get<string>('credentials.complianceServiceIV'),
      CipherAlgorithmEnum.AES_256_CBC,
    );

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.POST,
      headers: {
        'Content-Type': 'application/json',
      },
      data: { data: encryptedText },
    });

    const decryptedResponse = await this.decryptComplianceResponse(data);

    return decryptedResponse;
  }

  async decryptComplianceResponse(encryptedResponse: string) {
    const url = `${this.complianceUrl}/api/Encryption/Decryptobject`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.POST,
      data: encryptedResponse,
    });

    return data;
  }
}
