import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Account as AccountModel } from 'src/modules/account-creation/models/account.model';
import { AccountType as AccountTypeModel } from 'src/modules/account-creation/models/account-type.model';
import {
  AccountRepository,
  AccountTypeRepository,
} from './account-creation.repository';
import { AccountService, AccountTypeService } from './account-creation.service';
import { AccountTypeController } from './account-creation.controller';

@Module({
  imports: [SequelizeModule.forFeature([AccountModel, AccountTypeModel])],
  providers: [
    AccountRepository,
    AccountService,
    AccountTypeRepository,
    AccountTypeService,
  ],
  controllers: [AccountTypeController],
  exports: [],
})
export class AccountCreationModule {}
