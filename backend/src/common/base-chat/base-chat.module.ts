import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { BaseChatService } from './base-chat.service';
import { CrudModule } from '../crud/crud.module';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, ChatMessage]), CrudModule],
  providers: [BaseChatService],
  exports: [BaseChatService],
})
export class BaseChatModule {}


