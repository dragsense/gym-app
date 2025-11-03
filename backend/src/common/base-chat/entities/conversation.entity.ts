import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/common/entities';
import { User } from '@/common/base-user/entities/user.entity';
import { ChatMessage } from './chat-message.entity';

@Entity('conversations')
export class Conversation extends GeneralBaseEntity {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the first participant',
  })
  @Column({ type: 'uuid' })
  participantOneId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID of the second participant',
  })
  @Column({ type: 'uuid' })
  participantTwoId: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440002',
    description: 'ID of the last message',
  })
  @Column({ type: 'uuid', nullable: true })
  lastMessageId?: string;

  @ApiPropertyOptional({
    description: 'Last message sent in the conversation',
    type: () => ChatMessage,
  })
  @ManyToOne(() => ChatMessage, { nullable: true })
  @JoinColumn({ name: 'lastMessageId' })
  lastMessage?: ChatMessage;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether participant one has archived the conversation',
  })
  @Column({ type: 'boolean', default: false })
  archivedByParticipantOne?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether participant two has archived the conversation',
  })
  @Column({ type: 'boolean', default: false })
  archivedByParticipantTwo?: boolean;

  @ApiProperty({
    type: () => [ChatMessage],
    description: 'Messages in this conversation',
  })
  @OneToMany(() => ChatMessage, (message) => message.conversation)
  messages?: ChatMessage[];

  @ApiProperty({ type: () => User, description: 'First participant user' })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'participantOneId' })
  participantOne?: User;

  @ApiProperty({ type: () => User, description: 'Second participant user' })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'participantTwoId' })
  participantTwo?: User;
}

