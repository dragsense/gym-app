import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getMinRoleLevel } from '../decorators/level.decorator';

@Injectable()
export class RoleLevelGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const minLevel = getMinRoleLevel(context.getHandler());

    if (minLevel === undefined ) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();


    return user?.level <= minLevel;
  }
}
