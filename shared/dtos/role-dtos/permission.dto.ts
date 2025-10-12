import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationMetaDto } from '../common/pagination.dto';
import { ListQueryDto } from '../common/list-query.dto';
import { FieldOptions, FieldType } from '../../decorators/field.decorator';
import { EPermissionAction, EPermissionStatus } from '../../enums/role/permission.enum';

export class PermissionDto {
  @ApiProperty({ example: 1, description: 'Permission ID' })
  id: number;

  @ApiProperty({ example: 'user:create', description: 'Permission name/code' })
  name: string;

  @ApiProperty({ example: 'Create User', description: 'Permission display name' })
  displayName: string;

  @ApiProperty({ example: 'Allow creating new users', description: 'Permission description' })
  description: string;

  @ApiProperty({
    enum: EPermissionAction,
    example: EPermissionAction.CREATE,
    description: 'Permission action'
  })
  action: EPermissionAction;

  @ApiProperty({ example: 1, description: 'Resource ID' })
  resourceId: number;

  @ApiProperty({
    enum: EPermissionStatus,
    example: EPermissionStatus.ACTIVE,
    description: 'Permission status'
  })
  status: EPermissionStatus;

  @ApiProperty({ example: true, description: 'Whether permission is system defined' })
  isSystem: boolean;

  @ApiPropertyOptional({ example: ['email', 'name'], description: 'Included columns' })
  includedColumns?: string[];

  @ApiPropertyOptional({ example: ['password', 'ssn'], description: 'Excluded columns' })
  excludedColumns?: string[];

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update timestamp' })
  updatedAt: Date;
}

export class PermissionPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [PermissionDto] })
  data: PermissionDto[];
}

export class PermissionListDto extends ListQueryDto {
  @ApiPropertyOptional({
    enum: EPermissionAction,
    example: EPermissionAction.CREATE,
    description: 'Filter by permission action'
  })
  @IsOptional()
  @IsEnum(EPermissionAction)
  @FieldType('select', false)
  @FieldOptions(Object.values(EPermissionAction).map(v => ({ value: v, label: v })))
  action?: EPermissionAction;

  @ApiPropertyOptional({
    enum: EPermissionStatus,
    example: EPermissionStatus.ACTIVE,
    description: 'Filter by permission status'
  })
  @IsOptional()
  @IsEnum(EPermissionStatus)
  @FieldType('select', false)
  @FieldOptions(Object.values(EPermissionStatus).map(v => ({ value: v, label: v })))
  status?: EPermissionStatus;

  @ApiPropertyOptional({ example: 1, description: 'Filter by resource ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  resourceId?: number;
}

export class CreatePermissionDto {
  @ApiProperty({ example: 'user:create', description: 'Permission name/code' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Create User', description: 'Permission display name' })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({ example: 'Allow creating new users', description: 'Permission description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    enum: EPermissionAction,
    example: EPermissionAction.CREATE,
    description: 'Permission action'
  })
  @IsEnum(EPermissionAction)
  action: EPermissionAction;

  @ApiProperty({ example: 1, description: 'Resource ID' })
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  resourceId: number;

  @ApiPropertyOptional({
    enum: EPermissionStatus,
    example: EPermissionStatus.ACTIVE,
    description: 'Permission status'
  })
  @IsOptional()
  @IsEnum(EPermissionStatus)
  status?: EPermissionStatus;

  @ApiPropertyOptional({ example: ['email', 'name'], description: 'Included columns' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includedColumns?: string[];

  @ApiPropertyOptional({ example: ['password', 'ssn'], description: 'Excluded columns' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedColumns?: string[];
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
