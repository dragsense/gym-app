// smart-dto-types.ts
import { PartialType as SwaggerPartialType, OmitType as SwaggerOmitType } from "@nestjs/swagger";
import { Constructor, createOmitType } from "./dto-type-utils";


/**
 * ===========================================
 * Smart DTO Adapter
 * - Preserves backend TS types
 * - Works in frontend (runtime-safe) without NestJS decorators
 * ===========================================
 */

const isBackend = typeof window === "undefined" && typeof global !== "undefined";

/**
 * Backend-safe OmitType
 * - On backend: use SwaggerOmitType
 * - On frontend: fallback to createOmitType
 */
export const OmitType = isBackend
  ? SwaggerOmitType
  : createOmitType as <T extends Constructor, K extends keyof InstanceType<T>>(
      BaseClass: T,
      keys: readonly K[]
    ) => new () => Omit<InstanceType<T>, K>;

/**
 * Backend-safe PartialType
 * - On backend: use SwaggerPartialType
 * - On frontend: identity function (just return class)
 */
export const PartialType = isBackend
  ? SwaggerPartialType
  : <T extends Constructor>(BaseClass: T) => BaseClass;
