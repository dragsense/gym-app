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
  Min
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType} from '@nestjs/swagger';
import { CreateProfileDto, ProfileDto, UpdateProfileDto } from './profile.dto';
import { Type } from 'class-transformer';
import { PaginationMetaDto } from '../common/pagination.dto';
import { ListQueryDto } from '../common/list-query.dto';
import { IUser } from '../../interfaces/user.interface';
import { FieldType } from '../../decorators/field.decorator';
import { OmitType } from '../../lib/dto-type-adapter';

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
}

