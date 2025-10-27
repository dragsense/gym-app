import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/common/entities';
import { User } from '@/modules/v1/users/entities/user.entity';

@Entity('trainers')
export class Trainer extends GeneralBaseEntity {
  @ApiProperty({
    example: 'Fitness Training',
    description: 'Trainer specialization',
  })
  @Column({ type: 'varchar', length: 255 })
  specialization: string;

  @ApiProperty({ example: 5, description: 'Years of experience' })
  @Column({ type: 'int' })
  experience: number;

  @ApiProperty({
    example: 'Certified Personal Trainer',
    description: 'Certification',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  certification?: string;

  @ApiProperty({ example: 50, description: 'Hourly rate' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate?: number;

  @ApiProperty({ type: () => User, description: 'Associated user' })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @ApiPropertyOptional({
    type: () => User,
    description: 'User who created this trainer record',
    required: false,
  })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdByUserId' })
  createdBy?: User;
}
