import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  DataSource,
} from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { User } from '@/modules/v1/users/entities/user.entity';

@EventSubscriber()
@Injectable()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  private readonly logger = new Logger(UserSubscriber.name);

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

      this.logger.log(`Setting up initial configuration for user ${user.id} (${user.email})`);

    } catch (error) {
      this.logger.error(`Failed to initialize user settings for user ${event.entity?.id}:`, error);
      // Don't throw the error to prevent user creation from failing
    }
  }

}
