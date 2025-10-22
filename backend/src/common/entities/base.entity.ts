
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';


export abstract class GeneralBaseEntity extends BaseEntity {

  @ApiProperty({ example: '1', description: 'The unique identifier of the entity' })
  @PrimaryGeneratedColumn()
  id: number;


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
}
