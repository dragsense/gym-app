import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType } from '../../decorators/field.decorator';
import { UserDto } from '../user-dtos';
import { TrainerDto } from '../trainer-dtos';
import { ClientDto, ClientSafeDto } from '../client-dtos';
import { ITrainerClient } from '../../interfaces/trainer-client.interface';
import { ListQueryDto } from '../common/list-query.dto';
import { PaginationMetaDto } from '../common/pagination.dto';

export class CreateTrainerClientDto { 
  @ApiProperty({ type: TrainerDto })
  @ValidateNested()
  @Type(() => TrainerDto)
  @FieldType("nested", true, TrainerDto)
  trainer: TrainerDto;

  @ApiProperty({ type: ClientDto })
  @ValidateNested()
  @Type(() => ClientDto)
  @FieldType("nested", true, ClientDto)
  client: ClientDto;

  @ApiPropertyOptional({ example: 'Active', description: 'Assignment status' })
  @IsOptional()
  @IsString()
  @FieldType("text")
  status?: string;


  @ApiPropertyOptional({ example: 'Personal training sessions', description: 'Assignment notes' })
  @IsOptional()
  @IsString()
  @FieldType("textarea")
  notes?: string;
}

export class UpdateTrainerClientDto extends PartialType(CreateTrainerClientDto) {
}

export class TrainerClientListDto extends ListQueryDto<ITrainerClient> {


  @ApiPropertyOptional({ example: 1, description: 'Filter by trainer ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  trainerId?: number;

  @ApiPropertyOptional({ example: 2, description: 'Filter by client ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  clientId?: number;

  @ApiPropertyOptional({ example: 'Active', description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class TrainerClientSafeDto {
  @ApiProperty({ example: 1, description: 'Client ID' })
  id: number;

  @ApiProperty({ type: TrainerDto })
  @ValidateNested()
  @Type(() => TrainerDto)
  trainer: TrainerDto;

  @ApiProperty({ type: ClientDto })
  @ValidateNested()
  @Type(() => ClientDto)
  client: ClientDto;

  @ApiPropertyOptional({ example: 'Active', description: 'Assignment status' })
  @IsOptional()
  @IsString()
  @FieldType("text")
  status: string;

  createdAt: Date;
  updatedAt: Date;

}

export class TrainerClientPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [TrainerClientSafeDto] })
  @Type(() => TrainerClientSafeDto)
  data: TrainerClientSafeDto[];
}