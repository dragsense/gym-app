import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobOptions } from 'bull';

export class CreateQueueDto {
  @ApiProperty({ example: 'email-queue', description: 'Name of the queue' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Bull queue options' })
  @IsOptional()
  @IsObject()
  options?: JobOptions;

  @ApiPropertyOptional({ example: 1, description: 'User ID who created the queue' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  userId?: number;
}