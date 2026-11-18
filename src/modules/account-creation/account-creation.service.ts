import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AccountRepository,
  AccountTypeRepository,
} from './account-creation.repository';
import {
  CreateAccountDto,
  CreateAccountTypeDto,
} from './dto/account-creation.dto';
import { ApprovalStatusEnum, RequestStatusEnum } from 'src/common/enums';
import { AuthorizeActionDto } from 'src/common/dto/authorize-action.dto';
import { Account as AccountModel } from 'src/modules/account-creation/models/account.model';
import { AccountType as AccountTypeModel } from 'src/modules/account-creation/models/account-type.model';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';

@Injectable()
export class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  private async handleAccountApproval() {}

  async initiate(data: CreateAccountDto) {
    const {
      initiator,
      initiatorId,
      initiatorBranchCode,
      initiatorDepartment,
      userPermissions,
    } = data;

    const accountData = await this.accountRepository.create(data);

    if (userPermissions.includes('')) {
      await this.accountRepository.update(
        {
          approver: initiator,
          approverId: initiatorId,
          approverBranchCode: initiatorBranchCode,
          approverDepartment: initiatorDepartment,
          requestStatus: RequestStatusEnum.APPROVED,
          approvalStatus: ApprovalStatusEnum.APPROVED,
        },
        {
          where: { accountId: accountData.accountId },
          returning: true,
        },
      );
    }

    return accountData;
  }

  async authorize(data: AuthorizeActionDto): Promise<AccountModel> {
    const {
      id,
      approver,
      approverId,
      approverBranchCode,
      approverDepartment,
      approvalStatus,
      reasonForRejection,
    } = data;

    const accountData = await this.accountRepository.findOne({
      where: {
        accountId: id,
        approvalStatus: ApprovalStatusEnum.PENDING,
      },
    });

    if (!accountData) {
      throw new NotFoundException('No Matching Account Data that Id found');
    }

    let valueToUpdate: Partial<AccountModel>;

    switch (approvalStatus.toLowerCase()) {
      case ApprovalStatusEnum.APPROVED.toLowerCase():
        valueToUpdate = {
          approvalStatus: ApprovalStatusEnum.APPROVED,
          requestStatus: RequestStatusEnum.APPROVED,
          approverId,
          approver,
          approverBranchCode,
          approverDepartment,
        };
        break;
      case ApprovalStatusEnum.REJECTED.toLowerCase():
        valueToUpdate = {
          approvalStatus: ApprovalStatusEnum.REJECTED,
          requestStatus: RequestStatusEnum.IN_ISSUE,
          approverId,
          approver,
          approverBranchCode,
          approverDepartment,
          reasonForRejection,
        };
        break;
    }

    const [, [authorizedAccount]] = await this.accountRepository.update(
      valueToUpdate,
      {
        where: { accountId: accountData?.accountId },
        returning: true,
      },
    );

    return authorizedAccount;
  }
}

@Injectable()
export class AccountTypeService {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly accountTypeRepository: AccountTypeRepository,
  ) {}

  private async generateAccountCode(): Promise<string> {
    const sequence = await this.sequelize.query(
      `SELECT nextval('account_code_seq') AS nextval`,
      { type: QueryTypes.SELECT },
    );

    const nextVal = sequence[0]['nextval'];
    return `ACT${String(nextVal).padStart(4, '0')}`;
  }

  private async handleAccountTypeApproval() {}

  async initiate(data: CreateAccountTypeDto) {
    const {
      initiator,
      initiatorId,
      initiatorBranchCode,
      initiatorDepartment,
      userPermissions,
    } = data;

    const accountCode = await this.generateAccountCode();
    const accountTypeData = await this.accountTypeRepository.create({
      ...data,
      accountCode,
    });

    if (userPermissions.includes('')) {
      await this.accountTypeRepository.update(
        {
          approver: initiator,
          approverId: initiatorId,
          approverBranchCode: initiatorBranchCode,
          approverDepartment: initiatorDepartment,
          requestStatus: RequestStatusEnum.APPROVED,
          approvalStatus: ApprovalStatusEnum.APPROVED,
        },
        {
          where: { accountTypeId: accountTypeData.accountTypeId },
          returning: true,
        },
      );
    }

    return accountTypeData;
  }

  async authorize(data: AuthorizeActionDto): Promise<AccountTypeModel> {
    const {
      id,
      approver,
      approverId,
      approverBranchCode,
      approverDepartment,
      approvalStatus,
      reasonForRejection,
    } = data;

    const accountData = await this.accountTypeRepository.findOne({
      where: {
        accountTypeId: id,
        approvalStatus: ApprovalStatusEnum.PENDING,
      },
    });

    if (!accountData) {
      throw new NotFoundException('No Matching Account Data that Id found');
    }

    let valueToUpdate: Partial<AccountTypeModel>;

    switch (approvalStatus.toLowerCase()) {
      case ApprovalStatusEnum.APPROVED.toLowerCase():
        valueToUpdate = {
          approvalStatus: ApprovalStatusEnum.APPROVED,
          requestStatus: RequestStatusEnum.APPROVED,
          approverId,
          approver,
          approverBranchCode,
          approverDepartment,
        };
        break;
      case ApprovalStatusEnum.REJECTED.toLowerCase():
        valueToUpdate = {
          approvalStatus: ApprovalStatusEnum.REJECTED,
          requestStatus: RequestStatusEnum.IN_ISSUE,
          approverId,
          approver,
          approverBranchCode,
          approverDepartment,
          reasonForRejection,
        };
        break;
    }

    const [, [authorizedAccount]] = await this.accountTypeRepository.update(
      valueToUpdate,
      {
        where: { accountTypeId: accountData?.accountTypeId },
        returning: true,
      },
    );

    return authorizedAccount;
  }
}
