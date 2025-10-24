import {
  IsOptional,
  IsBoolean,
  IsString,
  IsNotEmpty,
  IsNumber,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { PaginationMetaDto } from "../common/pagination.dto";
import { ListQueryDto } from "../common/list-query.dto";
import { FieldType } from "../../decorators";
import { OmitType } from "../../lib/dto-type-adapter";

export class ResourceDto {
  @ApiProperty({ example: 1, description: "Resource ID" })
  @IsNumber()
  id: number;

  @ApiProperty({ example: "users", description: "Resource name (table name)" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: "User", description: "Entity class name" })
  @IsOptional()
  @IsString()
  entityName?: string;

  @ApiProperty({
    example: "User Management",
    description: "Resource display name",
  })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({
    example: "User entity for authentication and authorization",
    description: "Resource description",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, description: "Whether resource is active" })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}

export class ResourcePaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [ResourceDto] })
  data: ResourceDto[];
}

export class ResourceListDto extends ListQueryDto {
  @ApiPropertyOptional({
    example: true,
    description: "Filter by active resources",
  })
  @IsOptional()
  @IsBoolean()
  @FieldType("checkbox", false)
  isActive?: boolean;
}

export class CreateResourceDto {
  @ApiProperty({ example: "users", description: "Resource name (table name)" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "User", description: "Entity class name" })
  @IsString()
  @IsNotEmpty()
  entityName: string;

  @ApiProperty({
    example: "User Management",
    description: "Resource display name",
  })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiPropertyOptional({
    example: "User entity for authentication and authorization",
    description: "Resource description",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: true,
    description: "Whether resource is active",
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateResourceDto extends PartialType(
  OmitType(CreateResourceDto, ["entityName"])
) {}
