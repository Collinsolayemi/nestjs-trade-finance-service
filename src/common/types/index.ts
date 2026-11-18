import { IsOptional, IsUUID } from 'class-validator';
import { ForbiddenException, HttpException } from '@nestjs/common';
import { AxiosError } from 'axios';

export class UserDetails {
  @IsOptional()
  token?: string;

  @IsUUID()
  @IsOptional()
  id?: string;

  @IsOptional()
  username?: string;

  @IsOptional()
  branch?: string;

  @IsOptional()
  tenantId?: string;

  @IsOptional()
  department?: string;

  @IsOptional()
  channels?: string;

  @IsOptional()
  system?: string;

  @IsOptional()
  initiator?: string;

  @IsUUID()
  @IsOptional()
  initiatorId?: string;

  @IsOptional()
  initiatorBranchCode?: string;

  @IsOptional()
  initiatorDepartment?: string;

  @IsOptional()
  approver?: string;

  @IsUUID()
  @IsOptional()
  approverId?: string;

  @IsOptional()
  approverBranchCode?: string;

  @IsOptional()
  approverDepartment?: string;

  @IsOptional()
  userPermissions?: string[];
}

export type HandledException =
  | HttpException
  | AxiosError
  | ForbiddenException
  | Error;
