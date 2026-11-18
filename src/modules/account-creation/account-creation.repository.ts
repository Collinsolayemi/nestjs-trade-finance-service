import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes, FindOptions, UpdateOptions } from 'sequelize';
import { Account } from 'src/modules/account-creation/models/account.model';
import { AccountType } from 'src/modules/account-creation/models/account-type.model';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectModel(Account)
    private readonly accountModel: typeof Account,
  ) {}

  async create(body: CreationAttributes<Account>): Promise<Account> {
    return this.accountModel.create(body);
  }

  async findOne(options: FindOptions<Account>): Promise<Account> {
    return this.accountModel.findOne(options);
  }

  async findByPk(id: string, options: FindOptions<Account>): Promise<Account> {
    return this.accountModel.findByPk(id, options);
  }

  async findAll(options: FindOptions<Account>): Promise<Account[]> {
    return this.accountModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<Account>,
  ): Promise<{ rows: Account[]; count: number }> {
    return this.accountModel.findAndCountAll(options);
  }

  async update(
    body: Partial<Account>,
    options?: Omit<UpdateOptions<Account>, 'returning'> & {
      returning: Exclude<
        UpdateOptions<Account>['returning'],
        undefined | false
      >;
    },
  ): Promise<[number, Account[]]> {
    return this.accountModel.update(body, options);
  }
}

@Injectable()
export class AccountTypeRepository {
  constructor(
    @InjectModel(AccountType)
    private readonly accountTypeModel: typeof AccountType,
  ) {}

  async create(body: CreationAttributes<AccountType>): Promise<AccountType> {
    return this.accountTypeModel.create(body);
  }

  async findOne(options: FindOptions<AccountType>): Promise<AccountType> {
    return this.accountTypeModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<AccountType>,
  ): Promise<AccountType> {
    return this.accountTypeModel.findByPk(id, options);
  }

  async findAll(options: FindOptions<AccountType>): Promise<AccountType[]> {
    return this.accountTypeModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<AccountType>,
  ): Promise<{ rows: AccountType[]; count: number }> {
    return this.accountTypeModel.findAndCountAll(options);
  }

  async update(
    body: Partial<AccountType>,
    options?: Omit<UpdateOptions<AccountType>, 'returning'> & {
      returning: Exclude<
        UpdateOptions<AccountType>['returning'],
        undefined | false
      >;
    },
  ): Promise<[number, AccountType[]]> {
    return this.accountTypeModel.update(body, options);
  }
}
