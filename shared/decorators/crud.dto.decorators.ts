import { 
  registerDecorator, 
  ValidationOptions, 
  ValidatorConstraint, 
  ValidatorConstraintInterface,
  ValidationArguments
} from 'class-validator';
import { Transform, TransformOptions } from 'class-transformer';
import { plainToClass } from 'class-transformer';

// Number comparison decorators
@ValidatorConstraint({ name: 'isGreaterThan', async: false })
export class IsGreaterThanConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [min] = args.constraints;
    return typeof value === 'number' && value > min;
  }

  defaultMessage(args: ValidationArguments) {
    const [min] = args.constraints;
    return `Value must be greater than ${min}`;
  }
}

@ValidatorConstraint({ name: 'isLessThan', async: false })
export class IsLessThanConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [max] = args.constraints;
    return typeof value === 'number' && value < max;
  }

  defaultMessage(args: ValidationArguments) {
    const [max] = args.constraints;
    return `Value must be less than ${max}`;
  }
}

@ValidatorConstraint({ name: 'isGreaterThanOrEqual', async: false })
export class IsGreaterThanOrEqualConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [min] = args.constraints;
    return typeof value === 'number' && value >= min;
  }

  defaultMessage(args: ValidationArguments) {
    const [min] = args.constraints;
    return `Value must be greater than or equal to ${min}`;
  }
}

@ValidatorConstraint({ name: 'isLessThanOrEqual', async: false })
export class IsLessThanOrEqualConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [max] = args.constraints;
    return typeof value === 'number' && value <= max;
  }

  defaultMessage(args: ValidationArguments) {
    const [max] = args.constraints;
    return `Value must be less than or equal to ${max}`;
  }
}

@ValidatorConstraint({ name: 'isBetween', async: false })
export class IsBetweenConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [min, max] = args.constraints;
    return typeof value === 'number' && value >= min && value <= max;
  }

  defaultMessage(args: ValidationArguments) {
    const [min, max] = args.constraints;
    return `Value must be between ${min} and ${max}`;
  }
}

// Decorator functions
export function IsGreaterThan(min: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [min],
      validator: IsGreaterThanConstraint,
    });
  };
}

export function IsLessThan(max: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [max],
      validator: IsLessThanConstraint,
    });
  };
}

export function IsGreaterThanOrEqual(min: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [min],
      validator: IsGreaterThanOrEqualConstraint,
    });
  };
}

export function IsLessThanOrEqual(max: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [max],
      validator: IsLessThanOrEqualConstraint,
    });
  };
}

export function IsBetween(min: number, max: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [min, max],
      validator: IsBetweenConstraint,
    });
  };
}

// Transform decorators
export function TransformToNumber(options?: TransformOptions) {
  return Transform(({ value }) => {
    if (value === null || value === undefined || value === '') {
      return value;
    }
    const num = Number(value);
    return isNaN(num) ? value : num;
  }, options);
}

export function TransformToBoolean(options?: TransformOptions) {
  return Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  }, options);
}

export function TransformToArray(options?: TransformOptions) {
  return Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim());
    }
    return [value];
  }, options);
}

export function TransformToDate(options?: TransformOptions) {
  return Transform(({ value }) => {
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date;
    }
    return value;
  }, options);
}

// Pagination decorators
export function PaginationDto(validationOptions?: ValidationOptions) {
  return function (target: any) {
    // Add pagination properties to the DTO class
    Object.defineProperty(target.prototype, 'page', {
      value: 1,
      writable: true,
      enumerable: true,
      configurable: true
    });
    
    Object.defineProperty(target.prototype, 'limit', {
      value: 10,
      writable: true,
      enumerable: true,
      configurable: true
    });
  };
}
