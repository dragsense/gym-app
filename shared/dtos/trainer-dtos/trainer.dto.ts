import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  IsDecimal,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { PaginationMetaDto } from '../common/pagination.dto';
import { ListQueryDto, SingleQueryDto } from '../common/list-query.dto';
import { ITrainer } from '../../interfaces/trainer.interface';
import { FieldType } from '../../decorators/field.decorator';
import { OmitType } from '../../lib/dto-type-adapter';
import {
  Between,
  LessThan,
  GreaterThan,
  LessThanOrEqual,
  GreaterThanOrEqual,
  Like,
  In,
  NotIn,
  IsNull,
  IsNotNull,
  Equals,
  NotEquals,
  DateRange,
  TransformToArray,
  TransformToDate,
  RelationFilter,
} from '../../decorators/crud.dto.decorators';
import { CreateUserDto, UpdateUserDto, UserDto } from '../user-dtos';
import { CreateClientDto } from '../client-dtos/client.dto';

export class CreateTrainerDto {
  @ApiProperty({ type: CreateUserDto })
  @ValidateNested()
  @Type(() => CreateUserDto)
  @FieldType("nested", true, CreateUserDto)
  user: CreateUserDto;

  @ApiProperty({ example: 'Fitness Training', description: 'Trainer specialization' })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", true)
  specialization: string;

  @ApiProperty({ example: 5, description: 'Years of experience' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  @FieldType("number", true)
  experience: number;

  @ApiPropertyOptional({ example: 'Certified Personal Trainer', description: 'Certification' })
  @IsOptional()
  @IsString()
  @FieldType("text")
  certification?: string;

  @ApiPropertyOptional({ example: 50, description: 'Hourly rate' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @FieldType("number")
  @Type(() => Number)
  hourlyRate?: number;
}


export class UpdateTrainerDto extends PartialType(OmitType(CreateTrainerDto, ['user'])) {
  @ApiProperty({ type: UpdateUserDto })
  @ValidateNested()
  @Type(() => UpdateUserDto)
  @FieldType("nested", true, UpdateUserDto)
  @IsOptional()
  user?: UpdateUserDto;

}


export class TrainerSafeDto {
  @ApiProperty({ example: 1, description: 'Trainer ID' })
  id: number;

  @ApiProperty({ example: 'Fitness Training', description: 'Trainer specialization' })
  specialization: string;

  @ApiProperty({ example: 5, description: 'Years of experience' })
  experience: number;

  @ApiPropertyOptional({ example: 'Certified Personal Trainer', description: 'Certification' })
  certification?: string;

  @ApiPropertyOptional({ example: 50, description: 'Hourly rate' })
  hourlyRate?: number;
  
  @ApiProperty({ example: { id: 1, email: 'test@test.com', profile: { firstName: 'John', lastName: 'Doe', phoneNumber: '1234567890' } }, description: 'User' })
  user: UserDto;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update date' })
  updatedAt: Date;
}

export class TrainerPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [TrainerSafeDto] })
  @Type(() => TrainerSafeDto)
  data: TrainerSafeDto[];
}

export class TrainerListDto extends ListQueryDto<ITrainer> {
  @ApiPropertyOptional({ example: true, description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  @Equals()
  @FieldType('switch', false)
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'Fitness', description: 'Filter by specialization' })
  @IsOptional()
  @IsString()
  @Like()
  @FieldType('text', false)
  specialization?: string;
}

export class TrainerDto {
  @ApiProperty({ example: 1, description: 'Trainer ID' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @FieldType("number", true)
  @Min(1)
  id: number;

  @ApiProperty({ example: 'Fitness Training', description: 'Trainer specialization' })
  @IsOptional()
  @IsString()
  specialization: string;

  @ApiProperty({ example: 5, description: 'Years of experience' })
  @IsOptional()
  @IsNumber()
  experience: number;

  @ApiPropertyOptional({ example: 'Certified Personal Trainer', description: 'Certification' })
  @IsOptional()
  @IsString()
  certification?: string;

  @ApiPropertyOptional({ example: 50, description: 'Hourly rate' })
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @ApiProperty({ example: true, description: 'Trainer active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: { id: 1, email: 'test@test.com', profile: { firstName: 'John', lastName: 'Doe', phoneNumber: '1234567890' } }, description: 'User' })
  @IsOptional()
  user?: UserDto;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}
