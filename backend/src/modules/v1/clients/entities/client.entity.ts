import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/common/entities';
import { User } from '@/common/system-user/entities/user.entity';

@Entity('clients')
export class Client extends GeneralBaseEntity {
  @ApiProperty({ example: 'Weight Loss', description: 'Client goal' })
  @Column({ type: 'varchar', length: 255 })
  goal: string;

  @ApiProperty({ example: 'Beginner', description: 'Fitness level' })
  @Column({ type: 'varchar', length: 50 })
  fitnessLevel: string;

  @ApiProperty({ example: 'No injuries', description: 'Medical conditions' })
  @Column({ type: 'text', nullable: true })
  medicalConditions?: string;

  @ApiProperty({ type: () => User, description: 'Associated user' })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @ApiPropertyOptional({
    type: () => User,
    description: 'User who created this client record',
    required: false,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdByUserId' })
  createdBy?: User;
}
