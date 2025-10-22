import { SetMetadata } from '@nestjs/common';

export const RESOURCE_KEY = 'resource';

/**
 * Decorator to specify the resource for permission checking
 * @param resourceName The resource name (table name)
 */
export const Resource = (resourceName: string) =>
  SetMetadata(RESOURCE_KEY, resourceName);
