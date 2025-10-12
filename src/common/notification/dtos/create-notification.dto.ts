import { IsString, IsOptional, IsEnum, IsNumber, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ENotificationType, ENotificationPriority } from 'shared/enums/notification.enum';

export class CreateNotificationDto {
  @ApiProperty({ example: 'Welcome to our platform!', description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Thank you for joining us. We are excited to have you on board.', description: 'Notification message' })
  @IsString()
  message: string;

  @ApiProperty({
    enum: ENotificationType,
    example: ENotificationType.INFO,
    description: 'Type of notification'
  })
  @IsEnum(ENotificationType)
  type: ENotificationType;

  @ApiPropertyOptional({
    enum: ENotificationPriority,
    example: ENotificationPriority.NORMAL,
    description: 'Priority level of the notification'
  })
  @IsOptional()
  @IsEnum(ENotificationPriority)
  priority?: ENotificationPriority;

  @ApiPropertyOptional({ example: 1, description: 'User ID who will receive the notification' })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({ example: 123, description: 'Entity ID related to the notification' })
  @IsOptional()
  @IsNumber()
  entityId?: number;

  @ApiPropertyOptional({ example: 'user', description: 'Entity type related to the notification' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ 
    example: {
      action: 'user_registration',
      template: 'welcome',
      timestamp: '2024-01-01T00:00:00.000Z'
    },
    description: 'Additional metadata for the notification'
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ example: false, description: 'Whether the notification has been read' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ example: '/api/v1/notifications', description: 'API endpoint accessed' })
  @IsOptional()
  @IsString()
  endpoint?: string;

  @ApiPropertyOptional({ example: 'POST', description: 'HTTP method used' })
  @IsOptional()
  @IsString()
  method?: string;
}
