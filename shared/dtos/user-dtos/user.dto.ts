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
import { ListQueryDto } from '../common/list-query.dto';
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
  TransformToDate
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
  // User ID filters
  @ApiPropertyOptional({ example: 1, description: 'Filter by user ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Equals()
  @FieldType('number', false)
  id?: number;

  // Email filters
  @ApiPropertyOptional({ example: 'john@example.com', description: 'Filter by exact email' })
  @IsOptional()
  @IsString()
  @Equals()
  @FieldType('text', false)
  email?: string;

  @ApiPropertyOptional({ example: 'john', description: 'Search in email (partial match)' })
  @IsOptional()
  @IsString()
  @Like('email')
  @FieldType('text', false)
  emailLike?: string;

  // Active status filters
  @ApiPropertyOptional({ example: true, description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  @Equals()
  @FieldType('switch', false)
  isActive?: boolean;

  // Date range filters
  @ApiPropertyOptional({ 
    example: { start: '2024-01-01T00:00:00.000Z', end: '2024-12-31T23:59:59.999Z' }, 
    description: 'Filter users created between dates' 
  })
  @IsOptional()
  @Type(() => Object)
  @DateRange('createdAt')
  @FieldType('dateRange', false)
  createdAtRange?: { start: string; end: string };

  @ApiPropertyOptional({ 
    example: '2024-01-01T00:00:00.000Z', 
    description: 'Filter users created after this date' 
  })
  @IsOptional()
  @IsDateString()
  @TransformToDate()
  @GreaterThan('createdAt')
  @FieldType('date', false)
  createdAtAfter?: string;

  @ApiPropertyOptional({ 
    example: '2024-12-31T23:59:59.999Z', 
    description: 'Filter users created before this date' 
  })
  @IsOptional()
  @IsDateString()
  @TransformToDate()
  @LessThan('createdAt')
  @FieldType('date', false)
  createdAtBefore?: string;

  @ApiPropertyOptional({ 
    example: { start: '2024-01-01T00:00:00.000Z', end: '2024-12-31T23:59:59.999Z' }, 
    description: 'Filter users updated between dates' 
  })
  @IsOptional()
  @Type(() => Object)
  @DateRange('updatedAt')
  @FieldType('dateRange', false)
  updatedAtRange?: { start: string; end: string };

  // Profile filters
  @ApiPropertyOptional({ example: 'John', description: 'Search in first name' })
  @IsOptional()
  @IsString()
  @Like('profile.firstName')
  @FieldType('text', false)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Search in last name' })
  @IsOptional()
  @IsString()
  @Like('profile.lastName')
  @FieldType('text', false)
  lastName?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Filter by phone number' })
  @IsOptional()
  @IsString()
  @Like('profile.phoneNumber')
  @FieldType('text', false)
  phoneNumber?: string;

  // Array filters
  @ApiPropertyOptional({ example: [1, 2, 3], description: 'Filter by user IDs' })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @TransformToArray()
  @In('id')
  @FieldType('multiSelect', false)
  ids?: number[];

  @ApiPropertyOptional({ example: ['active', 'inactive'], description: 'Filter by active status values' })
  @IsOptional()
  @IsArray()
  @TransformToArray()
  @In('isActive')
  @FieldType('multiSelect', false)
  activeStatuses?: boolean[];

  // Null checks
  @ApiPropertyOptional({ example: true, description: 'Filter users with null profile' })
  @IsOptional()
  @IsBoolean()
  @IsNull('profile')
  @FieldType('switch', false)
  hasNullProfile?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Filter users with non-null profile' })
  @IsOptional()
  @IsBoolean()
  @IsNotNull('profile')
  @FieldType('switch', false)
  hasProfile?: boolean;
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

