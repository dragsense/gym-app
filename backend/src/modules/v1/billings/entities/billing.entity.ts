import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/common/entities';
import { EBillingStatus, EBillingType } from 'shared/enums/billing.enum';
import { User } from '../../users/entities/user.entity';
import { EScheduleFrequency } from 'shared/enums/schedule.enum';
import { ReminderDto } from 'shared/dtos/reminder-dtos';

@Entity('billings')
export class Billing extends GeneralBaseEntity {

  @ApiProperty({ example: 'Session Payment - Morning Workout', description: 'Billing title' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({ example: 'Payment for personal training session', description: 'Billing description' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ example: 50, description: 'Billing amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ example: '2024-01-10T09:00:00.000Z', description: 'Billing issue date' })
  @Column({ type: 'timestamptz' })
  issueDate: Date;

  @ApiProperty({ example: '2024-01-15T09:00:00.000Z', description: 'Billing due date' })
  @Column({ type: 'timestamptz' })
  dueDate: Date;

  @ApiProperty({ example: 'PENDING', description: 'Billing status', enum: EBillingStatus })
  @Column({ type: 'enum', enum: EBillingStatus, default: EBillingStatus.PENDING })
  status: EBillingStatus;

  @ApiProperty({ example: 'SESSION', description: 'Billing type', enum: EBillingType })
  @Column({ type: 'enum', enum: EBillingType })
  type: EBillingType;

  @ApiPropertyOptional({ example: EScheduleFrequency.MONTHLY, description: 'Billing recurrence', enum: EScheduleFrequency })
  @Column({ type: 'enum', enum: EScheduleFrequency, nullable: true })
  recurrence?: EScheduleFrequency;

  @ApiPropertyOptional({ example: 'Payment notes and instructions', description: 'Billing notes' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ type: () => User, description: 'Associated recipient' })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'recipientUserId' })
  recipientUser: User;


  @ApiProperty({ type: () => ReminderDto, description: 'Reminder configuration' })
  @Column({ type: 'jsonb', nullable: true })
  reminderConfig?: ReminderDto;

  @ApiPropertyOptional({ example: true, description: 'Whether reminders are enabled for this billing' })
  @Column({ type: 'boolean', default: false })
  enableReminder?: boolean;


  @ApiProperty({ example: '2024-01-15T09:00:00.000Z', description: 'Billing paid at' })
  @Column({ type: 'timestamptz', nullable: true })
  paidAt?: Date;
}
