import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/common/entities';
import { ESettingType } from 'shared/enums/setting.enum';

@Entity('settings')
@Index(['userId', 'key'], { unique: true })
export class Setting extends GeneralBaseEntity {
  @ApiProperty({ example: 1, description: 'User ID' })
  @Column({ type: 'int' })
  userId: number;

  @ApiProperty({ example: 'theme', description: 'Setting key' })
  @Column({ type: 'varchar', length: 100 })
  key: string;

  @ApiProperty({ example: 'dark', description: 'Setting value' })
  @Column({ type: 'text' })
  value: string;

  @ApiProperty({ example: 'STRING', description: 'Setting value type', enum: ESettingType })
  @Column({ type: 'enum', enum: ESettingType, default: ESettingType.STRING })
  type: ESettingType;

  @ApiPropertyOptional({ example: 'User theme preference', description: 'Setting description' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether setting is public/visible to others' })
  @Column({ type: 'boolean', default: false })
  isPublic: boolean;

  @ApiPropertyOptional({ example: true, description: 'Whether setting can be modified by user' })
  @Column({ type: 'boolean', default: true })
  isEditable: boolean;
}
