import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/common/entities';
import { Resource } from './resource.entity';
import { Role } from './role.entity';
import { EPermissionAction, EPermissionStatus } from '@shared/enums';

@Entity('permissions')
export class Permission extends GeneralBaseEntity {
  @ApiProperty({ example: 'user:create', description: 'Permission name/code' })
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @ApiProperty({
    example: 'Create User',
    description: 'Permission display name',
  })
  @Column({ type: 'varchar', length: 100 })
  displayName: string;

  @ApiProperty({
    example: 'Allow creating new users',
    description: 'Permission description',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    enum: EPermissionAction,
    example: EPermissionAction.CREATE,
    description: 'Permission action',
  })
  @Column({
    type: 'enum',
    enum: EPermissionAction,
  })
  action: EPermissionAction;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Resource ID',
  })
  @Column({ type: 'varchar' })
  resourceId: string;

  @ApiProperty({
    enum: EPermissionStatus,
    example: EPermissionStatus.ACTIVE,
    description: 'Permission status',
  })
  @Column({
    type: 'enum',
    enum: EPermissionStatus,
    default: EPermissionStatus.ACTIVE,
  })
  status: EPermissionStatus;

  @ApiProperty({
    example: true,
    description: 'Whether permission is system defined',
  })
  @Column({ type: 'boolean', default: false })
  isSystem: boolean;

  @ApiPropertyOptional({
    example: ['email', 'name'],
    description: 'Included columns (if empty, all columns are accessible)',
  })
  @Column({ type: 'jsonb', nullable: true })
  includedColumns?: string[];

  @ApiPropertyOptional({
    example: ['password', 'ssn'],
    description: 'Excluded columns',
  })
  @Column({ type: 'jsonb', nullable: true })
  excludedColumns?: string[];

  @ManyToOne(() => Resource, (resource) => resource.permissions)
  @JoinColumn({ name: 'resourceId' })
  resource: Resource;

  @ManyToMany(() => Role, (role) => role.permissions)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'permissionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];
}
