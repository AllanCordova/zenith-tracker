import { SetMetadata } from '@nestjs/common';
import type { PublicUser } from './auth.service';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: PublicUser['role'][]) =>
  SetMetadata(ROLES_KEY, roles);
