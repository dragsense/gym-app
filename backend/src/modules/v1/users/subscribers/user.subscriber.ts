import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  DataSource,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '@/common/system-user/entities/user.entity';
import { LoggerService } from '@/common/logger/logger.service';
import { UserAvailabilityService } from '../../user-availability/user-availability.service';
import { WeeklyScheduleDto } from '@shared/dtos/user-availability-dtos/user-availability.dto';

@EventSubscriber()
@Injectable()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  private readonly logger = new LoggerService(UserSubscriber.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly userAvailabilityService: UserAvailabilityService,
  ) {
    this.dataSource.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  afterInsert(event: InsertEvent<User>): void {
    const user = event.entity;

    if (!user?.id) {
      this.logger.warn('User ID not found, skipping post-creation setup');
      return;
    }

    // Defer creation until after the transaction commits (100ms delay)
    setTimeout(() => {
      (async () => {
        try {
          // Create default user availability with office hours (9 AM - 5 PM, Mon-Fri)
          const defaultWeeklySchedule: WeeklyScheduleDto = {
            monday: {
              enabled: true,
              timeSlots: [{ start: '09:00', end: '17:00' }],
            },
            tuesday: {
              enabled: true,
              timeSlots: [{ start: '09:00', end: '17:00' }],
            },
            wednesday: {
              enabled: true,
              timeSlots: [{ start: '09:00', end: '17:00' }],
            },
            thursday: {
              enabled: true,
              timeSlots: [{ start: '09:00', end: '17:00' }],
            },
            friday: {
              enabled: true,
              timeSlots: [{ start: '09:00', end: '17:00' }],
            },
            saturday: { enabled: false, timeSlots: [] },
            sunday: { enabled: false, timeSlots: [] },
          };

          await this.userAvailabilityService.create({
            user: { id: user.id },
            weeklySchedule: defaultWeeklySchedule,
            unavailablePeriods: [],
          });

          this.logger.log(
            `Default user availability created for user ${user.id}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to initialize user availability for user ${user.id}:`,
            error instanceof Error ? error.message : String(error),
          );
          // Don't throw the error to prevent user creation from failing
        }
      })().catch((err) => {
        this.logger.error(
          `Unhandled error creating user availability for user ${user.id}:`,
          err instanceof Error ? err.message : String(err),
        );
      });
    }, 100);
  }
}
