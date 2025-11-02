import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/common/entities';
import { ESessionStatus, ESessionType } from '@shared/enums/session.enum';
import { BeforeInsert, BeforeUpdate } from 'typeorm';
import { ReminderDto } from '@shared/dtos/reminder-dtos';
import { User } from '@/common/base-user/entities/user.entity';
import { EScheduleFrequency } from '@shared/enums/schedule.enum';
import { Client } from '../../clients/entities/client.entity';
import { Trainer } from '../../trainers/entities/trainer.entity';

@Entity('sessions')
export class Session extends GeneralBaseEntity {
  @ApiProperty({ example: 'Morning Workout', description: 'Session title' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({
    example: 'Cardio and strength training session',
    description: 'Session description',
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: '2024-01-15T09:00:00.000Z',
    description: 'Session start date and time',
  })
  @Column({ type: 'timestamptz' })
  startDateTime: Date;

  @ApiPropertyOptional({
    example: 60,
    description: 'Session duration in minutes',
  })
  @Column({ type: 'int', nullable: true, default: 60 })
  duration?: number;

  @ApiPropertyOptional({
    example: '2024-01-15T10:00:00.000Z',
    description:
      'Session end date and time (auto-calculated from startDateTime + duration)',
  })
  @Column({ type: 'timestamptz', nullable: true })
  endDateTime?: Date;

  @ApiProperty({
    example: 'PERSONAL',
    description: 'Session type',
    enum: ESessionType,
  })
  @Column({ type: 'enum', enum: ESessionType })
  type: ESessionType;

  @ApiPropertyOptional({
    example: 'Gym Floor A',
    description: 'Session location',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @ApiPropertyOptional({ example: 50, description: 'Session price' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @ApiPropertyOptional({
    example: 'Bring water bottle and towel',
    description: 'Session notes',
  })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({
    example: 'SCHEDULED',
    description: 'Session status',
    enum: ESessionStatus,
  })
  @Column({
    type: 'enum',
    enum: ESessionStatus,
    default: ESessionStatus.SCHEDULED,
  })
  status: ESessionStatus;

  @ApiProperty({ type: () => Trainer, description: 'Associated trainer' })
  @ManyToOne(() => Trainer, { eager: true })
  @JoinColumn({ name: 'trainerUserId' })
  trainer: Trainer;

  @ApiProperty({
    type: () => [Client],
    description: 'Associated clients (at least one required)',
  })
  @ManyToMany(() => Client, { eager: true })
  @JoinTable({ name: 'session_clients_users' })
  clients: Client[];

  @ApiPropertyOptional({
    type: () => User,
    description: 'User who created this session',
    required: false,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdByUserId' })
  createdBy?: User;

  @ApiPropertyOptional({
    example: EScheduleFrequency.DAILY,
    description: 'Session recurrence',
    enum: EScheduleFrequency,
  })
  @Column({ type: 'enum', enum: EScheduleFrequency, nullable: true })
  recurrence?: EScheduleFrequency;

  @ApiProperty({
    type: () => ReminderDto,
    description: 'Reminder configuration',
  })
  @Column({ type: 'jsonb', nullable: true })
  reminderConfig?: ReminderDto;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether reminders are enabled for this session',
  })
  @Column({ type: 'boolean', default: false })
  enableReminder?: boolean;

  // Automatically calculate endDateTime before insert
  @BeforeInsert()
  @BeforeUpdate()
  beforeInsert() {
    if (!this.startDateTime || !this.duration) {
      return;
    }

    const durationInMilliseconds = this.duration * 60 * 1000;
    const startDateTime = new Date(this.startDateTime);
    this.endDateTime = new Date(
      startDateTime.getTime() + durationInMilliseconds,
    );
  }
}
