import {
  Entity,
  Column,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '@/modules/v1/users/entities/user.entity';
import { FileUpload } from '@/modules/v1/file-upload/entities/file-upload.entity';
import { GeneralBaseEntity } from '@/common/entities';
import { EUserGender } from 'shared/enums/user.enum';

@Entity('profiles')
export class Profile extends GeneralBaseEntity {
  // ─── Shared Fields ─────────────────────

  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number with country code' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '1990-01-01', description: 'Date of birth' })
  @Column({ type: 'date', nullable: true })
  dateOfBirth?: string;

  @ApiPropertyOptional({
    enum: EUserGender,
    example: EUserGender.MALE,
    description: 'User gender',
  })
  @Column({
    type: 'enum',
    enum: EUserGender,
    nullable: true,
  })
  gender?: EUserGender;

  @ApiPropertyOptional({ example: '123 Main St, City, Country', description: 'User address' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @ApiProperty({ type: () => User, description: 'Associated user' })
  @OneToOne(() => User, user => user.profile, { onDelete: 'CASCADE' })
  user: User;

  @ApiPropertyOptional({
    description: 'File entity for the uploaded image',
    type: () => FileUpload,
  })
  @ManyToOne(() => FileUpload, {
    cascade: true,
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  image?: FileUpload | null;
}
