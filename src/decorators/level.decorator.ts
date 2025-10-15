import {  SetMetadata } from '@nestjs/common';

export const MIN_ROLE_LEVEL_METADATA = 'minRoleLevel';

export const MinRoleLevel = (level: number) => SetMetadata(MIN_ROLE_LEVEL_METADATA, level);

export const getMinRoleLevel = (context: any): number => {
  const minLevel = Reflect.getMetadata(MIN_ROLE_LEVEL_METADATA, context);
  return minLevel;
};
