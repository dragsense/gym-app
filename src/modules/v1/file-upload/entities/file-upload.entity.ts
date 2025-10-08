// src/modules/file-upload/entities/uploaded-file.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('uploaded_files')
export class FileUpload {
  @ApiProperty({ example: 1, description: 'Unique identifier of the uploaded file' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'banner.jpg',
    description: 'Original file name as uploaded by the user',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'image/jpeg',
    description: 'MIME type of the uploaded file (e.g. image/jpeg, image/png)',
  })
  @Column()
  mimeType: string;

  @ApiProperty({
    example: 1048576,
    description: 'Size of the file in bytes',
  })
  @Column()
  size: number;

  @ApiProperty({
    example: 'uploads/banner-image/1722104000000-banner.jpg',
    description: 'Relative path to the uploaded file on the server',
  })
  @Column()
  path: string;

  @ApiProperty({
    example: '2025-06-27T10:00:00.000Z',
    description: 'Timestamp when the file was uploaded',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2025-06-27T10:05:00.000Z',
    description: 'Timestamp when the file metadata was last updated',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
