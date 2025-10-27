import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  Column,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export abstract class GeneralBaseEntity extends BaseEntity {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'The unique identifier of the entity',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '2024-02-12T14:30:00.000Z',
    description: 'Timestamp when the entity was created',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    example: '2024-02-13T10:45:00.000Z',
    description: 'Timestamp when the entity was last updated',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the user who created this entity',
    required: false,
  })
  @Column({ type: 'uuid', nullable: true })
  createdByUserId: string;
}
