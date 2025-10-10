import { formatValue } from "@shared/lib/utils";

export function pickKeys<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Partial<T> {
  return keys.reduce((acc, key) => {
    if (key in obj) acc[key] = obj[key];
    return acc;
  }, {} as Partial<T>);
}


export function strictDeepMerge<T extends Record<string, any>>(target: T, source?: Partial<T>): T {
  if (!source) return { ...target };

  const result: any = Array.isArray(target) ? [...target] : { ...target };

  (Object.keys(target) as (keyof T)[]).forEach((key) => {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (
      sourceValue &&
      typeof targetValue === "object" &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      // Recursively merge nested objects
      result[key] = strictDeepMerge(targetValue as any, sourceValue as any);
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[typeof key];
    } else {
      result[key] = targetValue; // keep default if missing
    }
  });

  return result;
}

// Helper function to check if array contains Files or Blobs
function isFileOrBlobArray(arr: any[]): boolean {
  return arr.length > 0 && arr.every((item: any) => item instanceof File || item instanceof Blob);
}

export function getDirtyData<T>(
  formData: T & Record<string, any>,
  initialValues: T,
  seen = new WeakMap<object, object>()
): Partial<T> {
  const result: Partial<T> = {};

  // Get all keys from both formData and initialValues
  const allKeys = new Set([...Object.keys(initialValues as object), ...Object.keys(formData as object)]);

  for (const key of allKeys) {
    const value = (formData as any)[key];
    const initialValue = (initialValues as any)[key];

    // Skip if value doesn't exist in formData
    if (!(key in formData)) continue;

    // Deep equality check with circular reference protection
    if (isDeepEqual(value, initialValue, seen)) continue;

    if (typeof value === "object" && value !== null) {
      // Handle File, Blob, Date objects as values, not nested objects
      if ((value as any) instanceof File || (value as any) instanceof Blob || (value as any) instanceof Date) {
        (result as any)[key] = value;
      } 
      // Handle arrays
      else if (Array.isArray(value)) {
        // Check if it's an array of Files or Blobs
        if (isFileOrBlobArray(value)) {
          // Treat file arrays as atomic values
          (result as any)[key] = value;
        } else {
          // Handle regular arrays - include if not deeply equal
          (result as any)[key] = value;
        }
      } else {
        // Nested object → recurse
        const nestedDirty = getDirtyData(
          value as any,
          initialValue as any,
          seen
        );
        
        // Only include if nested object has dirty fields
        if (Object.keys(nestedDirty).length > 0) {
          (result as any)[key] = nestedDirty as any;
        }
      }
    } else {
      // Primitive value → assign directly
      (result as any)[key] = value;
    }
  }

  return result;
}

// Deep equality with circular reference protection
function isDeepEqual(a: any, b: any, seen = new WeakMap<object, object>()): boolean {
  // Same reference or both null/undefined
  if (a === b) return true;
  
  // One is null/undefined but not both
  if (a == null || b == null) return a == b;
  
  // Type mismatch
  if (typeof a !== typeof b) return false;
  
  // Handle Date objects
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  
  // Handle File and Blob objects - only equal if same reference
  if ((a instanceof File && b instanceof File) || (a instanceof Blob && b instanceof Blob)) {
    return false; // Files/Blobs are always considered different unless same reference (already checked above)
  }
  
  // Array comparison
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    
    // Check if it's an array of Files or Blobs
    if (isFileOrBlobArray(a) || isFileOrBlobArray(b)) {
      // File arrays are always considered different (unless same reference, already checked)
      return false;
    }
    
    // Regular array comparison
    for (let i = 0; i < a.length; i++) {
      if (!isDeepEqual(a[i], b[i], seen)) return false;
    }
    return true;
  }
  
  // Object comparison with circular reference check
  if (typeof a === 'object' && typeof b === 'object') {
    // Check for circular references
    if (seen.has(a) && seen.get(a) === b) return true;
    seen.set(a, b);
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!(key in b)) return false;
      if (!isDeepEqual(a[key], b[key], seen)) return false;
    }
    return true;
  }
  
  // Primitive comparison
  return a === b;
}

export function extractValues<T extends object>(
  response: any,
  initialValues: T
): any {
  const result: any = {};

  for (const key in initialValues) {
    const initField = initialValues[key];

    if (initField && typeof initField === "object" && "value" in initField) {
      const field = initField.value;

      // Handle nested objects
      if (field && typeof field === "object" && "isNested" in initField) {
        if (Array.isArray(field)) {
          // Handle array of nested objects
          result[key] = {
            value: (response?.[key] || field).map((item: any, index: number) => {
              const arrayItem = field[index] || field[0];
              return {
                isNested: arrayItem.isNested,
                value: extractValues(item, arrayItem.value)
              };
            })
          };
        } else {
          // Handle single nested object
          result[key] = {
            isNested: initField.isNested,
            value: extractValues(response?.[key] ?? {}, field)
          };
        }
      } else {
        // Handle primitive values
        result[key] = {
          value: response?.[key] !== undefined ? response[key] : field,
        };
      }
    }
  }

  return result;
}

export function unwrapValues<T extends object>(formValues: T): any {
  const result: any = {};

  for (const key in formValues) {
    const field = (formValues as any)[key];

    if (field && typeof field === "object" && "value" in field) {
      const value = field.value;

      // Handle arrays
      if (Array.isArray(value)) {
        result[key] = value.map((item: any) => {
          if (item && typeof item === "object" && "isNested" in item) {
            return unwrapValues(item.value);
          } else if (item && typeof item === "object" && "value" in item) {
            return unwrapValues(item);
          } else {
            return item;
          }
        });
      }
      // Handle nested objects
      else if (value && typeof value === "object" && !(value instanceof Date)) {
        result[key] = unwrapValues(value);
      }
      // Handle primitive values
      else {
        result[key] = value;
      }
    }
  }

  return result;
}




export function generateQueryParams(
  queryParams: URLSearchParams,
  params: Record<string, any>
) {

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {

      value.forEach((v) => {
        if (v !== undefined && v !== null && v !== "")
          queryParams.append(key, formatValue(v));
      });
    } else if (typeof value === "object" && !(value instanceof Date)) {
      generateQueryParams(queryParams, value);
    } else {
      queryParams.append(key, formatValue(value));
    }
  });
}
