import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsePermissions } from './usePermissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get(
      UsePermissions,
      ctx.getHandler(),
    );

    if (!requiredPermissions) return true;

    const { user } = ctx.switchToHttp().getRequest<Request>();

    if (!user || !('id' in user && 'permissions' in user))
      throw new UnauthorizedException();

    const hasRole = requiredPermissions.some((requiredPermission) =>
      user.permissions.includes(requiredPermission),
    );

    if (!hasRole) throw new ForbiddenException();

    return true;
  }
}
