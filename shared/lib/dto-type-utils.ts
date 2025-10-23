import { FIELD_UI_TYPE, FIELD_OPTIONS, FIELD_DTO_TYPE, FIELD_REQUIRED } from '../decorators/field.decorator';
  
export type Constructor<T = any> = new (...args: any[]) => T;


/**
 * Create an Omitted version of a class.
 * Removes specified fields but keeps FieldType-related metadata on the rest.
 */
export function createOmitType<
  T extends Constructor,
  K extends keyof InstanceType<T>
>(
  BaseClass: T,
  omittedKeys: readonly K[]
): new () => Omit<InstanceType<T>, K> {
  abstract class OmitClass {
    constructor() {
      const baseInstance = new BaseClass();

      for (const key of Object.keys(baseInstance) as (keyof InstanceType<T>)[]) {
        if (!omittedKeys.includes(key as K)) {
          (this as any)[key] = (baseInstance as any)[key];
        }
      }
    }
  }

  const prototype = BaseClass.prototype;

  const allKeys = [
    ...new Set([
      ...Object.keys(new BaseClass()),
      ...Object.getOwnPropertyNames(prototype),
    ]),
  ].filter(k => k !== "constructor" && !omittedKeys.includes(k as K));

  for (const key of allKeys) {
    const uiType = Reflect.getMetadata(FIELD_UI_TYPE, prototype, key);
    const options = Reflect.getMetadata(FIELD_OPTIONS, prototype, key);
    const required = Reflect.getMetadata(FIELD_REQUIRED, prototype, key);
    const dtoType = Reflect.getMetadata(FIELD_DTO_TYPE, prototype, key);

    if (uiType !== undefined)
      Reflect.defineMetadata(FIELD_UI_TYPE, uiType, OmitClass.prototype, key);
    if (options !== undefined)
      Reflect.defineMetadata(FIELD_OPTIONS, options, OmitClass.prototype, key);
    if (required !== undefined)
      Reflect.defineMetadata(FIELD_REQUIRED, required, OmitClass.prototype, key);
    if (dtoType !== undefined)
      Reflect.defineMetadata(FIELD_DTO_TYPE, dtoType, OmitClass.prototype, key);
  }

  Object.defineProperty(OmitClass, "name", {
    value: `Omit${BaseClass.name}`,
  });

  return OmitClass as new () => Omit<InstanceType<T>, K>; 
}



