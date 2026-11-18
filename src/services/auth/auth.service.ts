import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpRequestMethodEnum } from 'src/common/enums';
import { HelperService } from 'src/helpers/helper.service';
import { AppRedisService } from '../redis/redis.service';
import { HttpClientService } from '../http-client/http-client.service';
import { SafeCron } from 'src/common/decorators/safecron.decorator';

@Injectable()
export class AuthService {
  private readonly authBaseUrl: string;

  constructor(
    private readonly appRedisService: AppRedisService,
    private readonly configService: ConfigService,
    private readonly httpClientService: HttpClientService,

    @Inject(forwardRef(() => HelperService))
    private readonly helperService: HelperService,
  ) {
    this.authBaseUrl = this.configService.get<string>('baseUrl.auth');
  }

  async authenticateUser(token: string) {
    const url = `${this.authBaseUrl}/api/v1/users/profile/`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: token,
        ServiceKey: 'trade-api',
      },
    });

    return data;
  }

  async signinUser(userCredentials: { email: string; password: string }) {
    const url = `${this.authBaseUrl}/api/v1/auth/login/`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.POST,
      data: userCredentials,
    });

    return data;
  }

  @SafeCron('*/5 * * * *')
  private async saveSystemUserToken() {
    const email = this.configService.get<string>('credentials.systemUser');
    const password = this.configService.get<string>(
      'credentials.systemPassword',
    );

    const { access } = await this.signinUser({ email, password });

    await this.appRedisService.set('token', `Bearer ${access}`, 300);

    return access;
  }

  async getSystemUserToken() {
    return this.appRedisService.get('token');
  }
}
