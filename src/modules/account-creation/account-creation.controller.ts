import {
  Body,
  Controller,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { AccountService, AccountTypeService } from './account-creation.service';
import {
  CreateAccountDto,
  CreateAccountTypeDto,
} from './dto/account-creation.dto';
import { AuthenticatedRequest } from 'src/common/interfaces';
import { AccountCreationResponseDto } from './dto/account-creation-response.dto';
import { AuthorizeActionDto } from 'src/common/dto/authorize-action.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@Controller('account')
@ApiTags('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @ApiBody({ type: CreateAccountDto })
  async create(
    @Body() body: CreateAccountDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<AccountCreationResponseDto> {
    const {
      id: initiatorId,
      firstname,
      lastname,
      branch: initiatorBranchCode,
      tenant: tenantId,
      department: initiatorDepartment,
      user_permissions: userPermissions,
    } = req.user;

    const accountData = await this.accountService.initiate({
      initiatorId,
      initiator: `${firstname} ${lastname}`,
      initiatorBranchCode,
      tenantId,
      initiatorDepartment,
      userPermissions,
      ...body,
    });

    return {
      statusCode: HttpStatus.CREATED,
      data: accountData,
      message: 'Account Request Initiated',
    };
  }

  @Patch(':id/authorize')
  @ApiBody({ type: AuthorizeActionDto })
  async authorize(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: AuthorizeActionDto,
  ): Promise<AccountCreationResponseDto> {
    const {
      id: approverId,
      firstname,
      lastname,
      branch: approverBranchCode,
      department: approverDepartment,
    } = req.user;
    const { approvalStatus, reasonForRejection } = body;

    const authorizedAccount = await this.accountService.authorize({
      id,
      approver: `${firstname} ${lastname}`,
      approverId,
      approverBranchCode,
      approverDepartment,
      approvalStatus,
      reasonForRejection,
    });

    return {
      statusCode: HttpStatus.CREATED,
      data: authorizedAccount,
      message: 'Account Request Authorized',
    };
  }
}

@Controller('account-type')
@ApiTags('account-type')
export class AccountTypeController {
  constructor(private readonly accountTypeService: AccountTypeService) {}

  @Post()
  @ApiBody({ type: CreateAccountTypeDto })
  async create(
    @Body() body: CreateAccountTypeDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<AccountCreationResponseDto> {
    const {
      id: initiatorId,
      firstname,
      lastname,
      branch: initiatorBranchCode,
      tenant: tenantId,
      department: initiatorDepartment,
      user_permissions: userPermissions,
    } = req.user;

    const accountTypeData = await this.accountTypeService.initiate({
      initiatorId,
      initiator: `${firstname} ${lastname}`,
      initiatorBranchCode,
      tenantId,
      initiatorDepartment,
      userPermissions,
      ...body,
    });

    return {
      statusCode: HttpStatus.CREATED,
      data: accountTypeData,
      message: 'Account Type Request Initiated',
    };
  }

  @Patch(':id/authorize')
  @ApiBody({ type: AuthorizeActionDto })
  async authorize(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: AuthorizeActionDto,
  ): Promise<AccountCreationResponseDto> {
    const {
      id: approverId,
      firstname,
      lastname,
      branch: approverBranchCode,
      department: approverDepartment,
    } = req.user;
    const { approvalStatus, reasonForRejection } = body;

    const authorizedAccount = await this.accountTypeService.authorize({
      id,
      approver: `${firstname} ${lastname}`,
      approverId,
      approverBranchCode,
      approverDepartment,
      approvalStatus,
      reasonForRejection,
    });

    return {
      statusCode: HttpStatus.CREATED,
      data: authorizedAccount,
      message: 'Account Request Authorized',
    };
  }
}
