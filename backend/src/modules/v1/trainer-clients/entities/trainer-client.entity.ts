import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/common/entities';
import { ETrainerClientStatus } from 'shared/enums/trainer-client.enum';
import { Trainer } from '../../trainers/entities/trainer.entity';
import { Client } from '../../clients/entities/client.entity';

@Entity('trainer_clients')
@Index(['trainerId', 'clientId'], { unique: true }) // Ensure unique trainer-client pairs
export class TrainerClient extends GeneralBaseEntity {

  @ApiProperty({ example: 1, description: 'Trainer user ID' })
  @Column({ type: 'int' })
  trainerId: number;

  @ApiProperty({ example: 2, description: 'Client user ID' })
  @Column({ type: 'int' })
  clientId: number;

  @ApiPropertyOptional({ 
    example: ETrainerClientStatus.ACTIVE, 
    description: 'Assignment status',
    enum: ETrainerClientStatus
  })
  @Column({ 
    type: 'enum', 
    enum: ETrainerClientStatus, 
    default: ETrainerClientStatus.ACTIVE 
  })
  status: ETrainerClientStatus;

  @ApiPropertyOptional({ example: 'Personal training sessions', description: 'Assignment notes' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relations
  @ManyToOne(() => Trainer, { eager: true })
  @JoinColumn({ name: 'trainerId' })
  trainer: Trainer;

  @ManyToOne(() => Client, { eager: true })
  @JoinColumn({ name: 'clientId' })
  client: Client;
}
