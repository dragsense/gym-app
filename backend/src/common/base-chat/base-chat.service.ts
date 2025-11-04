import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';

import { Chat } from './entities/chat.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatUser } from './entities/chat-user.entity';
import { LoggerService } from '@/common/logger/logger.service';
import { CrudService } from '@/common/crud/crud.service';
import { CrudOptions } from '@/common/crud/interfaces/crud.interface';

@Injectable()
export class BaseChatService extends CrudService<Chat> {
  private readonly customLogger = new LoggerService(BaseChatService.name);

  constructor(
    @InjectRepository(Chat)
    private readonly chatRepo: Repository<Chat>,
    @InjectRepository(ChatMessage)
    private readonly messageRepo: Repository<ChatMessage>,
    @InjectRepository(ChatUser)
    private readonly chatUserRepo: Repository<ChatUser>,
    moduleRef: ModuleRef,
  ) {
    const crudOptions: CrudOptions = {
      searchableFields: ['id'],
    };
    super(chatRepo, moduleRef, crudOptions);
  }

  /**
   * Get chat repository
   */
  get chatRepository(): Repository<Chat> {
    return this.chatRepo;
  }

  /**
   * Get message repository
   */
  get messageRepository(): Repository<ChatMessage> {
    return this.messageRepo;
  }

  /**
   * Get chat user repository
   */
  get chatUserRepository(): Repository<ChatUser> {
    return this.chatUserRepo;
  }
}


