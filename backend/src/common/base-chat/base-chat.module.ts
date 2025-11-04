import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatUser } from './entities/chat-user.entity';
import { BaseChatService } from './base-chat.service';
import { CrudModule } from '../crud/crud.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, ChatMessage, ChatUser]), CrudModule],
  providers: [BaseChatService],
  exports: [BaseChatService],
})
export class BaseChatModule {}


