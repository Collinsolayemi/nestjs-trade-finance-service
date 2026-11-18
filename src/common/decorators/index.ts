import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionEnum } from '../enums';

export const Permissions = Reflector.createDecorator<PermissionEnum[]>();

export const PermissionsGuard = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

export const AutoApproval = (...requiredPermissions: PermissionEnum[]) =>
  createParamDecorator((_: unknown, ctx: ExecutionContext): boolean => {
    const request = ctx.switchToHttp().getRequest();
    const userPermissions = request.user?.user_permissions || [];
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
    return hasAllPermissions;
  })();
