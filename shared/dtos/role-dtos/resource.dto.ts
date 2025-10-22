import {
    IsOptional,
  IsBoolean,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationMetaDto } from '../common/pagination.dto';
import { ListQueryDto } from '../common/list-query.dto';
import {  FieldType } from '../../decorators';
import { OmitType } from '../../lib/dto-type-adapter';

export class ResourceDto {
  @ApiProperty({ example: 1, description: 'Resource ID' })
  id: number;

  @ApiProperty({ example: 'users', description: 'Resource name (table name)' })
  name: string;

  @ApiProperty({ example: 'User', description: 'Entity class name' })
  entityName: string;

  @ApiProperty({ example: 'User Management', description: 'Resource display name' })
  displayName: string;

  @ApiProperty({ example: 'User entity for authentication and authorization', description: 'Resource description' })
  description?: string;

  @ApiProperty({ example: true, description: 'Whether resource is active' })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update timestamp' })
  updatedAt: Date;
}

export class ResourcePaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [ResourceDto] })
  data: ResourceDto[];
}

export class ResourceListDto extends ListQueryDto {
  @ApiPropertyOptional({ example: true, description: 'Filter by active resources' })
  @IsOptional()
  @IsBoolean()
  @FieldType('checkbox', false)
  isActive?: boolean;
}



export class CreateResourceDto {
  @ApiProperty({ example: 'users', description: 'Resource name (table name)' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'User', description: 'Entity class name' })
  @IsString()
  @IsNotEmpty()
  entityName: string;

  @ApiProperty({ example: 'User Management', description: 'Resource display name' })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiPropertyOptional({ example: 'User entity for authentication and authorization', description: 'Resource description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether resource is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 

export class UpdateResourceDto extends PartialType(OmitType(CreateResourceDto, ['entityName'])) {}
