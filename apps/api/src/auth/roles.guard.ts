import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { PublicUser } from './auth.service';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<
      PublicUser['role'][]
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredRoles?.length) {
      return true;
    }
    const request = context.switchToHttp().getRequest<{ user?: PublicUser }>();
    const role = request.user?.role;
    return !!role && requiredRoles.includes(role);
  }
}
