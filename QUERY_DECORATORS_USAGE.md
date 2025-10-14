# CRUD Query Decorators Usage Guide

## Overview
The CRUD query decorators system extends your existing CRUD decorator framework to provide powerful filtering capabilities directly in your DTO classes using decorators.

## Available Decorators

### Basic Filters
- `@Equals(field?)` - Exact match
- `@NotEquals(field?)` - Not equal
- `@Like(field?)` - Partial text match (case-insensitive)
- `@In(field?)` - Value in array
- `@NotIn(field?)` - Value not in array

### Comparison Filters
- `@LessThan(field?)` - Less than
- `@GreaterThan(field?)` - Greater than
- `@LessThanOrEqual(field?)` - Less than or equal
- `@GreaterThanOrEqual(field?)` - Greater than or equal
- `@Between(field?)` - Between two values

### Null Checks
- `@IsNull(field?)` - Field is null
- `@IsNotNull(field?)` - Field is not null

### Special Filters
- `@DateRange(field?)` - Date range filter (combines between for dates)

## Usage Examples

### Basic DTO with Query Filters

```typescript
import { IsOptional, IsString, IsNumber, IsBoolean, IsDateString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { 
  Between, 
  LessThan, 
  GreaterThan, 
  Like, 
  In, 
  Equals,
  DateRange,
  IsNull,
  IsNotNull,
  TransformToArray,
  TransformToDate
} from 'shared/decorators/crud.dto.decorators';
import { FieldType } from 'shared/decorators/field.decorator';

export class UserListDto extends ListQueryDto<IUser> {
  // Exact match
  @IsOptional()
  @IsNumber()
  @Equals()
  @FieldType('number', false)
  id?: number;

  // Partial text search
  @IsOptional()
  @IsString()
  @Like('email')
  @FieldType('text', false)
  emailLike?: string;

  // Date range
  @IsOptional()
  @Type(() => Object)
  @DateRange('createdAt')
  @FieldType('dateRange', false)
  createdAtRange?: { start: string; end: string };

  // Array filter
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @In('id')
  @FieldType('multiSelect', false)
  ids?: number[];

  // Null check
  @IsOptional()
  @IsBoolean()
  @IsNotNull('profile')
  @FieldType('switch', false)
  hasProfile?: boolean;
}
```

### Controller Usage

```typescript
@Get()
findAll(@Query() query: UserListDto) {
  return this.usersService.get(query, {
    relations: [{
      name: 'profile',
      select: ['id', 'firstName', 'lastName'],
      searchableFields: ['firstName', 'lastName']
    }],
    select: ['id', 'email', 'isActive', 'createdAt'],
    dtoClass: UserListDto, // Important: Pass DTO class for decorators to work
  });
}
```

## API Query Examples

### Exact Match
```
GET /users?id=123
```

### Partial Text Search
```
GET /users?emailLike=john
```

### Date Range
```
GET /users?createdAtRange[start]=2024-01-01T00:00:00.000Z&createdAtRange[end]=2024-12-31T23:59:59.999Z
```

### Array Filter
```
GET /users?ids=1&ids=2&ids=3
```

### Null Check
```
GET /users?hasProfile=true
```

### Combined Filters
```
GET /users?emailLike=admin&isActive=true&createdAtAfter=2024-01-01T00:00:00.000Z
```

## CRUD Service Integration

The CRUD service automatically processes these decorators when you pass the `dtoClass` parameter:

```typescript
// In your service
async get(queryDto: UserListDto) {
  return this.crudService.get(queryDto, {
    relations: [...],
    select: [...],
    dtoClass: UserListDto, // This enables decorator processing
  });
}
```

## Generated SQL Examples

### Between Filter
```sql
WHERE entity.createdAt BETWEEN :createdAtRange_start AND :createdAtRange_end
```

### Like Filter
```sql
WHERE entity.email ILIKE :emailLike
```

### In Filter
```sql
WHERE entity.id IN (:...ids)
```

### Null Check
```sql
WHERE entity.profile IS NOT NULL
```

## Best Practices

1. **Always pass dtoClass**: Include `dtoClass: YourDtoClass` in the options when calling CRUD service methods
2. **Use appropriate validators**: Combine query decorators with proper validation decorators
3. **Field mapping**: Use the `field` parameter in decorators to map to nested properties (e.g., `@Like('profile.firstName')`)
4. **Transform functions**: Use custom transform functions for complex value processing
5. **Documentation**: Use `@ApiPropertyOptional` for proper API documentation

## Backward Compatibility

The system maintains backward compatibility with existing filter implementations. Legacy filters will still work alongside the new decorator-based filters.
