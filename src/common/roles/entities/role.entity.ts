import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/common/entities';
import { Permission } from './permission.entity';
import { ERoleStatus } from 'shared/enums/role/role.enum';

@Entity('roles')
export class Role extends GeneralBaseEntity {
  @ApiProperty({ example: 'Administrator', description: 'Role name' })
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @ApiProperty({ example: 'admin', description: 'Role code/slug' })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @ApiProperty({ example: 'Full system access', description: 'Role description' })
  @Column({ type: 'text' })
  description: string;


  @ApiProperty({ 
    enum: ERoleStatus,
    example: ERoleStatus.ACTIVE,
    description: 'Role status' 
  })
  @Column({ 
    type: 'enum', 
    enum: ERoleStatus,
    default: ERoleStatus.ACTIVE 
  })
  status: ERoleStatus;

  @ApiProperty({ example: true, description: 'Whether role is system defined' })
  @Column({ type: 'boolean', default: false })
  isSystem: boolean;

  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'roleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permissionId', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}
