import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/common/entities';
import { ETrainerClientStatus } from '@shared/enums/trainer-client.enum';
import { Trainer } from '../../trainers/entities/trainer.entity';
import { Client } from '../../clients/entities/client.entity';

@Entity('trainer_clients')
@Index(['trainerId', 'clientId'], { unique: true }) // Ensure unique trainer-client pairs
export class TrainerClient extends GeneralBaseEntity {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Trainer user ID',
  })
  @Column({ type: 'varchar' })
  trainerId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Client user ID',
  })
  @Column({ type: 'varchar' })
  clientId: string;

  @ApiPropertyOptional({
    example: ETrainerClientStatus.ACTIVE,
    description: 'Assignment status',
    enum: ETrainerClientStatus,
  })
  @Column({
    type: 'enum',
    enum: ETrainerClientStatus,
    default: ETrainerClientStatus.ACTIVE,
  })
  status: ETrainerClientStatus;

  @ApiPropertyOptional({
    example: 'Personal training sessions',
    description: 'Assignment notes',
  })
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
