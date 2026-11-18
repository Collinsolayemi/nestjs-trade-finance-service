import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpRequestMethodEnum } from 'src/common/enums';
import {
  AccountEnquiry,
  AccountRestrictionResponse,
  PostBulkJournalReversal,
  PostJournal,
  PostJournalReversal,
} from 'src/common/interfaces';
import { HttpClientService } from '../http-client/http-client.service';

@Injectable()
export class CamsService {
  private readonly accountEnquiriesBaseUrl: string;
  private readonly accountRestrictionBaseUrl: string;
  private readonly centralJournalPostingBaseUrl: string;
  private readonly API_KEY: string;
  private readonly APP_ID: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpClientService: HttpClientService,
  ) {
    this.accountEnquiriesBaseUrl = this.configService.get<string>(
      'baseUrl.accountEnquiries',
    );
    this.accountRestrictionBaseUrl = this.configService.get<string>(
      'baseUrl.accountRestriction',
    );
    this.centralJournalPostingBaseUrl = this.configService.get<string>(
      'baseUrl.centralJournalPosting',
    );
    this.API_KEY = this.configService.get<string>('credentials.camsApiKey');
    this.APP_ID = this.configService.get<string>('credentials.camsAppId');
  }

  async getAccountDetails(
    accountNumber: string,
    token: string,
  ): Promise<AccountEnquiry> {
    const url = `${this.accountEnquiriesBaseUrl}/Accounts/DoNameEnquiryByAccountNo?AccountNumber=${accountNumber}`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: token,
        API_KEY: this.API_KEY,
        APP_ID: this.APP_ID,
      },
    });

    return data?.value;
  }

  async getAccountsByCustomerId({
    customerId,
    accountCategory,
    currencyCode,
    includeCreditCard,
    includeJointAccount,
    token,
  }: {
    customerId: string;
    accountCategory: string;
    currencyCode?: string;
    includeCreditCard?: boolean;
    includeJointAccount?: boolean;
    token: string;
  }): Promise<AccountEnquiry[]> {
    let pageNumber = 1;
    let allItems: AccountEnquiry[] = [];
    let hasNextPage = true;

    while (hasNextPage) {
      let url = `${this.accountEnquiriesBaseUrl}/Accounts/GetAccountsByCustomerId?CustomerId=${customerId}&PageNumber=${pageNumber}&PageSize=100`;

      if (accountCategory) {
        url += `&AccountCategory=${accountCategory}`;
      }
      if (currencyCode) {
        url += `&CurrencyCode=${currencyCode}`;
      }
      if (includeCreditCard) {
        url += `&IncludeCreditCard=${includeCreditCard}`;
      }
      if (includeJointAccount) {
        url += `&IncludeJointAccount=${includeJointAccount}`;
      }

      const data = await this.httpClientService.makeHttpRequest(url, {
        method: HttpRequestMethodEnum.GET,
        headers: {
          Authorization: token,
          API_KEY: this.API_KEY,
          APP_ID: this.APP_ID,
        },
      });

      if (data?.value?.items) {
        allItems = [...allItems, ...data.value.items];
        hasNextPage = data.value.hasNextPage;
        pageNumber++;
      } else {
        hasNextPage = false;
      }
    }

    return allItems;
  }

  async getAccountRestrictions(
    accountNumber: string,
    token: string,
  ): Promise<AccountRestrictionResponse> {
    const url = `${this.accountRestrictionBaseUrl}/AccountRestriction/GetAccountAccessPaginated?AccountNo=${accountNumber}`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.GET,
      headers: {
        Authorization: token,
        API_KEY: this.API_KEY,
        APP_ID: this.APP_ID,
      },
    });

    return data?.value;
  }

  async postToJournal(payload: PostJournal, token: string) {
    const url = `${this.centralJournalPostingBaseUrl}/postjournal`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.POST,
      headers: {
        Authorization: token,
        API_KEY: this.API_KEY,
        APP_ID: this.APP_ID,
      },
      data: payload,
    });

    if (data?.HasError || data?.hasError) {
      const errorMessage =
        data?.ErrorMessage || data?.errorMessage || 'Bad Gateway Exception';
      const errors = data?.Errors || data?.errors;

      let detailedMessage = errorMessage;

      if (errors) {
        const errorDetails = Object.values(errors)
          .flat()
          .filter(Boolean)
          .join('; ');

        if (errorDetails) {
          detailedMessage = `${errorMessage} - ${errorDetails}`;
        }
      }

      throw new BadGatewayException(detailedMessage);
    }

    return data;
  }

  async reverseJournalPosting(payload: PostJournalReversal, token: string) {
    const url = `${this.centralJournalPostingBaseUrl}/postjournal/reversal`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.POST,
      headers: {
        Authorization: token,
        API_KEY: this.API_KEY,
        APP_ID: this.APP_ID,
      },
      data: payload,
    });

    if (data?.HasError || data?.hasError) {
      const errorMessage =
        data?.ErrorMessage || data?.errorMessage || 'Bad Gateway Exception';
      const errors = data?.Errors || data?.errors;

      let detailedMessage = errorMessage;

      if (errors) {
        const errorDetails = Object.values(errors)
          .flat()
          .filter(Boolean)
          .join('; ');

        if (errorDetails) {
          detailedMessage = `${errorMessage} - ${errorDetails}`;
        }
      }

      throw new BadGatewayException(detailedMessage);
    }

    return data;
  }

  async bulkReverseJournalPosting(
    payload: PostBulkJournalReversal,
    token: string,
  ) {
    const url = `${this.centralJournalPostingBaseUrl}/postjournalBulk/BulkTransactionReversal`;

    const data = await this.httpClientService.makeHttpRequest(url, {
      method: HttpRequestMethodEnum.POST,
      headers: {
        Authorization: token,
        API_KEY: this.API_KEY,
        APP_ID: this.APP_ID,
      },
      data: payload,
    });

    if (data?.HasError || data?.hasError) {
      const errorMessage =
        data?.ErrorMessage || data?.errorMessage || 'Bad Gateway Exception';
      const errors = data?.Errors || data?.errors;

      let detailedMessage = errorMessage;

      if (errors) {
        const errorDetails = Object.values(errors)
          .flat()
          .filter(Boolean)
          .join('; ');

        if (errorDetails) {
          detailedMessage = `${errorMessage} - ${errorDetails}`;
        }
      }

      throw new BadGatewayException(detailedMessage);
    }

    return data;
  }
}
