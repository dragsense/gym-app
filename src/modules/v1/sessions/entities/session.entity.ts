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
import { Trainer } from '@/modules/v1/trainers/entities/trainer.entity';
import { Client } from '@/modules/v1/clients/entities/client.entity';
import { ESessionStatus, ESessionType } from 'shared/enums/session.enum';

@Entity('sessions')
export class Session extends GeneralBaseEntity {

  @ApiProperty({ example: 'Morning Workout', description: 'Session title' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({ example: 'Cardio and strength training session', description: 'Session description' })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ example: '2024-01-15T09:00:00.000Z', description: 'Session start date and time' })
  @Column({ type: 'timestamptz' })
  startDateTime: Date;

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z', description: 'Session end date and time' })
  @Column({ type: 'timestamptz' })
  endDateTime: Date;

  @ApiProperty({ example: 'PERSONAL', description: 'Session type', enum: ESessionType })
  @Column({ type: 'enum', enum: ESessionType })
  type: ESessionType;

  @ApiPropertyOptional({ example: 'Gym Floor A', description: 'Session location' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @ApiPropertyOptional({ example: 50, description: 'Session price' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @ApiPropertyOptional({ example: 'Bring water bottle and towel', description: 'Session notes' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiProperty({ example: 'SCHEDULED', description: 'Session status', enum: ESessionStatus })
  @Column({ type: 'enum', enum: ESessionStatus, default: ESessionStatus.SCHEDULED })
  status: ESessionStatus;

  @ApiProperty({ type: () => Trainer, description: 'Associated trainer' })
  @ManyToOne(() => Trainer, { eager: true })
  @JoinColumn()
  trainer: Trainer;

  @ApiProperty({ type: () => [Client], description: 'Associated clients' })
  @ManyToMany(() => Client, { eager: true })
  @JoinTable()
  clients: Client[];
}
