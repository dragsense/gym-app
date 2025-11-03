import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';

import { Conversation } from './entities/conversation.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { LoggerService } from '@/common/logger/logger.service';
import { CrudService } from '@/common/crud/crud.service';
import { CrudOptions } from '@/common/crud/interfaces/crud.interface';

@Injectable()
export class BaseChatService extends CrudService<Conversation> {
  private readonly customLogger = new LoggerService(BaseChatService.name);

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(ChatMessage)
    private readonly messageRepo: Repository<ChatMessage>,
    moduleRef: ModuleRef,
  ) {
    const crudOptions: CrudOptions = {
      searchableFields: ['id'],
    };
    super(conversationRepo, moduleRef, crudOptions);
  }

  /**
   * Get conversation repository
   */
  get conversationRepository(): Repository<Conversation> {
    return this.conversationRepo;
  }

  /**
   * Get message repository
   */
  get messageRepository(): Repository<ChatMessage> {
    return this.messageRepo;
  }
}


