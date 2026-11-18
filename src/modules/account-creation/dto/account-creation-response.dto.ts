import { Account } from 'src/modules/account-creation/models/account.model';
import { AccountType } from 'src/modules/account-creation/models/account-type.model';

export class AccountCreationResponseDto {
  statusCode: number;
  message: string;
  data: Account | Account[] | AccountType | AccountType[] | number;
}
