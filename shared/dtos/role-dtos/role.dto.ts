import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationMetaDto } from '../common/pagination.dto';
import { ListQueryDto } from '../common/list-query.dto';
import { FieldOptions, FieldType } from '../../decorators/field.decorator';
import { ERoleStatus } from '../../enums/role/role.enum';

export class RoleDto {
  @ApiProperty({ example: 1, description: 'Role ID' })
  id: number;

  @ApiProperty({ example: 'Administrator', description: 'Role name' })
  name: string;

  @ApiProperty({ example: 'admin', description: 'Role code/slug' })
  code: string;

  @ApiProperty({ example: 'Full system access', description: 'Role description' })
  description: string;

  @ApiProperty({
    enum: ERoleStatus,
    example: ERoleStatus.ACTIVE,
    description: 'Role status'
  })
  status: ERoleStatus;

  @ApiProperty({ example: true, description: 'Whether role is system defined' })
  isSystem: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update timestamp' })
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
    description: 'Filter by role status'
  })
  @IsOptional()
  @IsEnum(ERoleStatus)
  @FieldType('select', false)
  @FieldOptions(Object.values(ERoleStatus).map(v => ({ value: v, label: v })))
  status?: ERoleStatus;

  @ApiPropertyOptional({ example: true, description: 'Filter by system roles' })
  @IsOptional()
  @IsBoolean()
  @FieldType('checkbox', false)
  isSystem?: boolean;
}

export class CreateRoleDto {
  @ApiProperty({ example: 'Administrator', description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'admin', description: 'Role code/slug' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Full system access', description: 'Role description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    enum: ERoleStatus,
    example: ERoleStatus.ACTIVE,
    description: 'Role status'
  })
  @IsEnum(ERoleStatus)
  status?: ERoleStatus;

  @ApiPropertyOptional({ example: true, description: 'Filter by system roles' })
  @IsOptional()
  @IsBoolean()
  @FieldType('checkbox', false)
  isSystem?: boolean;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
