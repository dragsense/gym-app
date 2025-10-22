import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  DataSource,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '@/modules/v1/users/entities/user.entity';
import { LoggerService } from '@/common/logger/logger.service';

@EventSubscriber()
@Injectable()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  private readonly logger = new LoggerService(UserSubscriber.name);

  constructor(private readonly dataSource: DataSource,

  ) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  async afterInsert(event: InsertEvent<User>): Promise<void> {
    try {
      const user = event.entity;

      if (!user?.id) {
        this.logger.warn('User ID not found, skipping post-creation setup');
        return;
      }


    } catch (error) {
      this.logger.error(`Failed to initialize user settings for user ${event.entity?.id}:`, error);
      // Don't throw the error to prevent user creation from failing
    }
  }

}
