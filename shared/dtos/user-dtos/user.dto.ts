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
  IsArray,
  IsEnum,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PartialType } from "../../lib/dto-type-adapter";
import { CreateProfileDto, ProfileDto, UpdateProfileDto } from "./profile.dto";
import { Type, Transform } from "class-transformer";
import { PaginationMetaDto } from "../common/pagination.dto";
import { ListQueryDto, SingleQueryDto } from "../common/list-query.dto";
import { IUser } from "../../interfaces/user.interface";
import { FieldOptions, FieldType } from "../../decorators/field.decorator";
import { OmitType } from "../../lib/dto-type-adapter";
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
} from "../../decorators/crud.dto.decorators";
import { EUserGender } from "../../enums/user.enum";

export class CreateUserDto {
  @ApiProperty({ example: "email@example.com", description: "User email" })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @FieldType("email", true)
  email: string;

  @ApiProperty({ example: "John" })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", true)
  firstName: string;

  @ApiProperty({ example: "Doe" })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", true)
  lastName: string;

  @ApiProperty({ example: "1990-01-01" })
  @IsOptional()
  @IsDateString()
  @FieldType("date")
  dateOfBirth?: string;

  @ApiProperty({ enum: EUserGender, example: EUserGender.MALE })
  @IsOptional()
  @IsEnum(EUserGender)
  @FieldType("select")
  @FieldOptions(
    Object.values(EUserGender).map((v) => ({
      value: v,
      label: v.charAt(0) + v.slice(1).toLowerCase(),
    }))
  )
  gender?: string;

  @ApiPropertyOptional({
    example: "securePass123",
    description:
      "User password (min 6 chars, must include letters and numbers)",
  })
  @IsString()
  @IsOptional()
  @Length(6, 100)
  @MinLength(6)
  password?: string;

  @ApiProperty({
    example: 0,
    description: "User level (0=ADMIN, 1=TRAINER, 2=CLIENT, 3=USER)",
  })
  @IsNumber()
  @IsOptional()
  @FieldType("number")
  level?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  @FieldType("switch")
  isActive?: boolean;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UserSafeDto {
  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "User ID",
  })
  id: string;

  @ApiProperty({ example: "email@example.com", description: "User email" })
  email: string;

  @ApiPropertyOptional({ example: true, description: "User active status" })
  isActive?: boolean;

  @ApiProperty({
    example: "2024-01-01T00:00:00.000Z",
    description: "Creation date",
  })
  createdAt: Date;

  @ApiProperty({
    example: "2024-01-01T00:00:00.000Z",
    description: "Last update date",
  })
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
  @ApiPropertyOptional({ example: 0, description: "Filter by user level" })
  @IsOptional()
  @IsNumber()
  @Equals()
  @Type(() => Number)
  level?: number;
}

export class UserDto {
  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "User ID",
  })
  @IsNotEmpty()
  @IsString()
  @FieldType("text", true)
  id: string;

  @ApiProperty({ example: "email@example.com", description: "User email" })
  @IsOptional()
  @IsString()
  @FieldType("text", false)
  email?: string;

  @ApiProperty({ example: true, description: "User active status" })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: 0,
    description: "User level (0=ADMIN, 1=TRAINER, 2=CLIENT, 3=USER)",
  })
  @IsOptional()
  @IsNumber()
  @FieldType("number")
  level?: number;

  @ApiProperty({ type: () => ProfileDto })
  @Type(() => ProfileDto)
  @IsOptional()
  profile?: ProfileDto;

  @ApiPropertyOptional({
    example: "securePass123",
    description: "User password",
  })
  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}
