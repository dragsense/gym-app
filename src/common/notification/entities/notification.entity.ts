import {
  Entity,
  Column,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/common/entities';
import { ENotificationType, ENotificationPriority } from 'shared/enums/notification.enum';

@Entity('notifications')
export class Notification extends GeneralBaseEntity {

  @ApiProperty({ example: 'Welcome to our platform!', description: 'Notification title' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({ example: 'Thank you for joining us. We are excited to have you on board.', description: 'Notification message' })
  @Column({ type: 'text' })
  message: string;

  @ApiProperty({ 
    enum: ENotificationType,
    example: ENotificationType.INFO,
    description: 'Type of notification' 
  })
  @Column({ 
    type: 'enum', 
    enum: ENotificationType,
    default: ENotificationType.INFO 
  })
  type: ENotificationType;

  @ApiProperty({ 
    enum: ENotificationPriority,
    example: ENotificationPriority.NORMAL,
    description: 'Priority level of the notification' 
  })
  @Column({ 
    type: 'enum', 
    enum: ENotificationPriority,
    default: ENotificationPriority.NORMAL 
  })
  priority: ENotificationPriority;

  @ApiPropertyOptional({ example: 123, description: 'Entity ID related to the notification' })
  @Column({ type: 'int', nullable: true })
  entityId?: number;


  @ApiPropertyOptional({ example: 'user', description: 'Entity type related to the notification' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  entityType?: string;

  @ApiPropertyOptional({ example: '{"action": "user_registration", "template": "welcome"}', description: 'Additional metadata for the notification' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ example: false, description: 'Whether the notification has been read' })
  @Column({ type: 'boolean', default: false })
  isRead?: boolean;
}
