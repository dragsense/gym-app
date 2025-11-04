import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/common/entities';
import { User } from '@/common/base-user/entities/user.entity';
import { Chat } from './chat.entity';

@Entity('chat_messages')
export class ChatMessage extends GeneralBaseEntity {
  @ApiProperty({
    example: 'Hello, how are you?',
    description: 'Message content',
  })
  @Column({ type: 'text' })
  message: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the sender',
  })
  @Column({ type: 'uuid' })
  senderId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID of the chat',
  })
  @Column({ type: 'uuid', name: 'conversationId' })
  chatId: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether the message has been read',
  })
  @Column({ type: 'boolean', default: false })
  isRead?: boolean;

  @ApiPropertyOptional({
    example: '2024-01-01T00:00:00.000Z',
    description: 'When the message was read',
  })
  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @ApiPropertyOptional({
    example: 'text',
    description: 'Message type (text, image, file, etc.)',
  })
  @Column({ type: 'varchar', length: 50, default: 'text' })
  messageType?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the message',
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ApiProperty({
    type: () => User,
    description: 'User who sent the message',
  })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'senderId' })
  sender?: User;

  @ApiProperty({
    type: () => Chat,
    description: 'Chat this message belongs to',
  })
  @ManyToOne(() => Chat, (chat) => chat.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversationId' })
  chat?: Chat;
}

