/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '@/modules/v1/users/entities/user.entity';

@Entity('auth_otp_codes')
export class OtpCode {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ApiProperty({ example: '123456' })
  @Column({ type: 'varchar', length: 10 })
  code: string;

  @ApiProperty({ example: 'login' })
  @Column({ type: 'varchar', length: 30 })
  purpose: string; // e.g., 'login'

  @ApiProperty({ example: 'device-uuid-abc' })
  @Index()
  @Column({ type: 'varchar', length: 200, nullable: true })
  deviceId: string | null;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;

  @ApiProperty({ example: false })
  @Column({ type: 'boolean', default: false })
  isUsed: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}


