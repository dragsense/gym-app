import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Length,
  IsOptional,
  MinLength,
  IsBoolean,
  ValidateNested,
  IsNumber,
  Min,
  IsDateString,
  IsArray
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType} from '@nestjs/swagger';
import { CreateProfileDto, ProfileDto, UpdateProfileDto } from './profile.dto';
import { Type, Transform } from 'class-transformer';
import { PaginationMetaDto } from '../common/pagination.dto';
import { ListQueryDto, SingleQueryDto } from '../common/list-query.dto';
import { IUser } from '../../interfaces/user.interface';
import { FieldType } from '../../decorators/field.decorator';
import { OmitType } from '../../lib/dto-type-adapter';
import { 
  Between, 
  LessThan, 
  GreaterThan, 
  LessThanOrEqual, 
  GreaterThanOrEqual, 
  Like, 
  In, 
  NotIn, 
  IsNull, 
  IsNotNull, 
  Equals, 
  NotEquals,
  DateRange,
  TransformToArray,
  TransformToDate,
  RelationFilter,
} from '../../decorators/crud.dto.decorators';

export class CreateUserDto {
  @ApiProperty({ example: 'email@example.com', description: 'User email' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @FieldType("email", true)
  email: string;

  @ApiPropertyOptional({
    example: 'securePass123',
    description: 'User password (min 6 chars, must include letters and numbers)'
  })
  @IsString()
  @IsOptional()
  @Length(6, 100)
  @MinLength(6)
  password?: string;


  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  @FieldType("switch")
  isActive?: boolean;

  @ApiProperty({ type: CreateProfileDto })
  @ValidateNested()
  @Type(() => CreateProfileDto)
  @FieldType("nested", true, CreateProfileDto)
  profile: CreateProfileDto;
}

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['profile'])) {
  @ApiProperty({ type: UpdateProfileDto })
  @ValidateNested()
  @Type(() => UpdateProfileDto)
  @FieldType("nested", true, UpdateProfileDto)
  @IsOptional()
  profile?: UpdateProfileDto;

} 

export class UserSafeDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'email@example.com', description: 'User email' })
  email: string;

  @ApiPropertyOptional({ example: true, description: 'User active status' })
  isActive?: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update date' })
  updatedAt: Date;
}

export class UserWithProfileSafeDto extends UserSafeDto {
  @ApiProperty({ type: () => ProfileDto })
  profile: ProfileDto;
}

export class UserPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [UserSafeDto] })
  @Type(() => UserSafeDto)
  data: UserSafeDto[];
}



export class UserListDto extends ListQueryDto<IUser> {
  // Active status filters
  @ApiPropertyOptional({ example: true, description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  @Equals()
  @FieldType('switch', false)
  isActive?: boolean;

  // Example relation filters
  @ApiPropertyOptional({ example: 'John', description: 'Filter by profile first name' })
  @IsOptional()
  @IsString()
  @Like()
  @RelationFilter('profile.firstName')
  @FieldType('text', false)
  profileFirstName?: string;

  @ApiPropertyOptional({ example: 'v1.0', description: 'Filter by document version' })
  @IsOptional()
  @IsString()
  @Equals()
  @RelationFilter('profile.documents.version.number')
  @FieldType('text', false)
  documentVersion?: string;

  // Example usage of the simplified system:
  // __relations: "profile,profile.documents" (comma-separated relation names - can be nested)
  // __select: "id,email,profile.firstName,profile.documents.name" (can include nested relation fields)
  // __searchable: "email,profile.firstName,profile.documents.name" (comma-separated searchable fields)
  
  // Behavior:
  // - __select can include main entity fields (user.id, user.email) AND specific relation fields
  // - __relations can include nested relations (profile.documents enables access to document fields)
  // - Relation fields in __select are ONLY allowed if parent relation is defined in __relations
  // - Example: __select=profile.documents.name requires __relations=profile.documents
  // - If relation not defined in __relations, the field is silently ignored
  // - Only specific fields in __select are returned, NOT entire relations
  // - ID fields are automatically included for all relations (e.g., profile.firstName includes profile.id)
  // - Special case: If no __select but __relations specified, gets ALL relation fields
  // - Example: __relations=profile&__select=email,profile.firstName returns email + profile.id + profile.firstName
  // - Example: __relations=profile returns default user fields + ALL profile fields
  // - Supports deep nesting: profile.documents.versions, profile.addresses.city, etc.
  // - Restricted fields are always filtered out (no errors, silent filtering)
  // - Restricted fields are defined in backend configuration only (security)
  // - __searchable: If provided, uses those fields for search; otherwise falls back to default searchable fields
  // - Relation filters: Use @RelationFilter decorator to filter on relation fields
  // - Example: @Equals() @RelationFilter('profile.documents.version.number')
  // - This allows filtering users by document version number in nested relations
  // - Combine with condition decorators: @Like(), @Equals(), @Between(), etc.
}




export class UserDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @FieldType("number", true)
  @Min(1)
  id: number;

  @ApiProperty({ example: 'email@example.com', description: 'User email' })
  @IsOptional()
  @IsString()
  @FieldType("text", false)
  email: string;

  @ApiProperty({ example: true, description: 'User active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: () => ProfileDto })
  @Type(() => ProfileDto)
  profile: ProfileDto;

  @ApiPropertyOptional({ example: 'securePass123', description: 'User password' })
  @IsOptional()
  @IsString()
  password?: string;


  createdAt: Date;
  updatedAt: Date;
}

