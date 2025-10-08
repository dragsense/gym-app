import { type ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { type Resolver } from "react-hook-form";

export function classValidatorResolver<T extends object>(
  dtoClass: ClassConstructor<T>
): Resolver<T> {
  return async (values) => {

    const dto = plainToInstance(dtoClass, values, {
      enableImplicitConversion: true,
      excludeExtraneousValues: false,
    });


    const errors = await validate(dto, {
      skipMissingProperties: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      skipUndefinedProperties: true,
      skipNullProperties: true,
      validationError: { target: false },
    });

    if (errors.length === 0) {
      return { values, errors: {} };
    }

    // Flatten nested validation errors
    const formErrors = flattenValidationErrors(errors);

    return { values: {}, errors: formErrors };
  };
}

function flattenValidationErrors(
  errors: any[],
  parentPath: string = ""
): Record<string, any> {
  return errors.reduce((acc, err) => {
    const fieldPath = parentPath ? `${parentPath}.${err.property}` : err.property;
    if (err.constraints) {
      acc[fieldPath] = {
        type: "validation",
        message: Object.values(err.constraints)[0],
      };

      if(parentPath) {
      acc[parentPath] = {
          type: "validation",
          message: Object.values(err.constraints)[0],
        };
      }
    }

    if (err.children && err.children.length > 0) {
      Object.assign(acc, flattenValidationErrors(err.children, fieldPath));
    }

    return acc;
  }, {} as Record<string, any>);
}
