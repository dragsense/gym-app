import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PartialType } from "../../lib/dto-type-adapter";
import { Type } from "class-transformer";
import { PaginationMetaDto } from "../common/pagination.dto";
import { ListQueryDto } from "../common/list-query.dto";
import { FieldOptions, FieldType } from "../../decorators/field.decorator";
import { ERoleStatus } from "../../enums/role/role.enum";
import { PermissionDto } from "./permission.dto";

export class RoleDto {
  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Role ID",
  })
  id: string;

  @ApiProperty({ example: "Administrator", description: "Role name" })
  name: string;

  @ApiProperty({ example: "admin", description: "Role code/slug" })
  code: string;

  @ApiProperty({
    example: "Full system access",
    description: "Role description",
  })
  description: string;

  @ApiProperty({
    enum: ERoleStatus,
    example: ERoleStatus.ACTIVE,
    description: "Role status",
  })
  status: ERoleStatus;

  @ApiProperty({ example: 1, description: "Number of permissions" })
  permissionsCount: number;

  @ApiProperty({ example: true, description: "Whether role is system defined" })
  isSystem: boolean;

  @ApiProperty({
    example: "2024-01-01T00:00:00.000Z",
    description: "Creation timestamp",
  })
  createdAt: Date;

  @ApiProperty({
    example: "2024-01-01T00:00:00.000Z",
    description: "Last update timestamp",
  })
  updatedAt: Date;
}

export class RolePaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [RoleDto] })
  data: RoleDto[];
}

export class RoleListDto extends ListQueryDto {
  @ApiPropertyOptional({
    enum: ERoleStatus,
    example: ERoleStatus.ACTIVE,
    description: "Filter by role status",
  })
  @IsOptional()
  @IsEnum(ERoleStatus)
  @FieldType("select", false)
  @FieldOptions(Object.values(ERoleStatus).map((v) => ({ value: v, label: v })))
  status?: ERoleStatus;

  @ApiPropertyOptional({ example: true, description: "Filter by system roles" })
  @IsOptional()
  @IsBoolean()
  @FieldType("checkbox", false)
  isSystem?: boolean;
}

export class CreateRoleDto {
  @ApiProperty({ example: "Administrator", description: "Role name" })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", false)
  name: string;

  @ApiProperty({ example: "admin", description: "Role code/slug" })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", false)
  code: string;

  @ApiProperty({
    example: "Full system access",
    description: "Role description",
  })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", false)
  description: string;

  @ApiProperty({
    enum: ERoleStatus,
    example: ERoleStatus.ACTIVE,
    description: "Role status",
  })
  @IsEnum(ERoleStatus)
  @FieldType("select", false)
  @FieldOptions(
    Object.values(ERoleStatus).map((v: ERoleStatus) => ({ value: v, label: v }))
  )
  status?: ERoleStatus;

  @ApiProperty({
    type: [PermissionDto],
    description: "Associated clients (at least one required)",
  })
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  @FieldType("nested", true, PermissionDto)
  @IsArray()
  @ArrayMinSize(1, { message: "At least one client must be selected" })
  permissions: PermissionDto[];
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
