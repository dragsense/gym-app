import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MIN_USER_LEVEL_METADATA } from '../decorators/level.decorator';

@Injectable()
export class UserLevelGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const minLevel = this.reflector.getAllAndOverride<boolean>(
      MIN_USER_LEVEL_METADATA,
      [context.getHandler(), context.getClass()],
    );

    if (minLevel === undefined) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    return user?.level <= minLevel;
  }
}
