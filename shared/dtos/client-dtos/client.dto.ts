import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType} from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { PaginationMetaDto } from '../common/pagination.dto';
import { ListQueryDto, SingleQueryDto } from '../common/list-query.dto';
import { IClient } from '../../interfaces/client.interface';
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
import { CreateUserDto, UpdateUserDto, UserDto } from '../user-dtos/user.dto';



export class CreateClientDto {
  @ApiProperty({ type: CreateUserDto })
  @ValidateNested()
  @Type(() => CreateUserDto)
  @FieldType("nested", true, CreateUserDto)
  user: CreateUserDto;

  @ApiProperty({ example: 'Weight Loss', description: 'Client goal' })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", true)
  goal: string;

  @ApiProperty({ example: 'Beginner', description: 'Fitness level' })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", true)
  fitnessLevel: string;


  @ApiPropertyOptional({ example: 'No injuries', description: 'Medical conditions' })
  @IsOptional()
  @IsString()
  @FieldType("text")
  medicalConditions?: string;

}


export class UpdateClientDto extends PartialType(OmitType(CreateClientDto, ['user'])) {
  @ApiProperty({ type: UpdateUserDto })
  @ValidateNested()
  @Type(() => UpdateUserDto)
  @FieldType("nested", true, UpdateUserDto)
  @IsOptional()
  user?: UpdateUserDto;

} 

export class ClientSafeDto {
  @ApiProperty({ example: 1, description: 'Client ID' })
  id: number;

  @ApiProperty({ example: 'Weight Loss', description: 'Client goal' })
  goal: string;

  @ApiProperty({ example: 'Beginner', description: 'Fitness level' })
  fitnessLevel: string;


  @ApiPropertyOptional({ example: 'No injuries', description: 'Medical conditions' })
  medicalConditions?: string;


  @ApiProperty({ example: { id: 1, email: 'test@test.com', profile: { firstName: 'John', lastName: 'Doe', phoneNumber: '1234567890' } }, description: 'User' })
  user: UserDto;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update date' })
  updatedAt: Date;
}

export class ClientPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [ClientSafeDto] })
  @Type(() => ClientSafeDto)
  data: ClientSafeDto[];
}

export class ClientListDto extends ListQueryDto<IClient> {
  @ApiPropertyOptional({ example: true, description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  @Equals()
  @FieldType('switch', false)
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'Weight Loss', description: 'Filter by goal' })
  @IsOptional()
  @IsString()
  @Like()
  @FieldType('text', false)
  goal?: string;

  @ApiPropertyOptional({ example: 'Beginner', description: 'Filter by fitness level' })
  @IsOptional()
  @IsString()
  @Equals()
  @FieldType('text', false)
  fitnessLevel?: string;
}

export class ClientDto {
  @ApiProperty({ example: 1, description: 'Client ID' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @FieldType("number", true)
  @Min(1)
  id: number;

  @ApiProperty({ example: 'Weight Loss', description: 'Client goal' })
  @IsOptional()
  @IsString()
  goal: string;

  @ApiProperty({ example: 'Beginner', description: 'Fitness level' })
  @IsOptional()
  @IsString()
  fitnessLevel: string;

  @ApiProperty({ example: '2024-01-01', description: 'Start date' })
  @IsOptional()
  @IsString()
  @FieldType("date", false)
  startDate: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Target date' })
  @IsOptional()
  @IsString()
  targetDate?: string;

  @ApiPropertyOptional({ example: 70, description: 'Current weight in kg' })
  @IsOptional()
  @IsNumber()
  currentWeight?: number;

  @ApiPropertyOptional({ example: 65, description: 'Target weight in kg' })
  @IsOptional()
  @IsNumber()
  targetWeight?: number;

  @ApiPropertyOptional({ example: 'No injuries', description: 'Medical conditions' })
  @IsOptional()
  @IsString()
  medicalConditions?: string;

  @ApiProperty({ example: true, description: 'Client active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  createdAt: Date;
  updatedAt: Date;
}
