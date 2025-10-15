import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/common/entities';
import { User } from '@/modules/v1/users/entities/user.entity';

@Entity('trainer_clients')
@Index(['trainerId', 'clientId'], { unique: true }) // Ensure unique trainer-client pairs
export class TrainerClient extends GeneralBaseEntity {

  @ApiProperty({ example: 1, description: 'Trainer user ID' })
  @Column({ type: 'int' })
  trainerId: number;

  @ApiProperty({ example: 2, description: 'Client user ID' })
  @Column({ type: 'int' })
  clientId: number;

  @ApiPropertyOptional({ example: 'Active', description: 'Assignment status' })
  @Column({ type: 'varchar', length: 50, default: 'Active' })
  status: string;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Assignment start date' })
  @Column({ type: 'date', nullable: true })
  startDate?: Date;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Assignment end date' })
  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @ApiPropertyOptional({ example: 'Personal training sessions', description: 'Assignment notes' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Relations
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'trainerId' })
  trainer: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'clientId' })
  client: User;
}
