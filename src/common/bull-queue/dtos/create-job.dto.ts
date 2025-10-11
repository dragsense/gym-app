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

export class CreateJobDto {
  @ApiProperty({ example: 'email-queue', description: 'Name of the queue' })
  @IsString()
  @IsNotEmpty()
  queueName: string;

  @ApiProperty({ example: 'send-email', description: 'Name of the job' })
  @IsString()
  @IsNotEmpty()
  jobName: string;

  @ApiProperty({ example: 'send-email', description: 'Action to execute' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiPropertyOptional({ example: { to: 'user@example.com' }, description: 'Job data' })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({ example: 1, description: 'Entity ID' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  entityId?: number;

  @ApiPropertyOptional({ description: 'Bull job options' })
  @IsOptional()
  @IsObject()
  options?: JobOptions;

  @ApiPropertyOptional({ example: 1, description: 'User ID who created the job' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  userId?: number;
}
