import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  Max,
  ValidateNested,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";
import { FieldOptions, FieldType } from "../../decorators/field.decorator";
import { UserDto } from "../user-dtos";
import { TrainerDto } from "../trainer-dtos";
import { ClientDto } from "../client-dtos";
import { ITrainerClient } from "../../interfaces/trainer-client.interface";
import { ListQueryDto } from "../common/list-query.dto";
import { PaginationMetaDto } from "../common/pagination.dto";
import { ETrainerClientStatus } from "../../enums/trainer-client.enum";

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

  @ApiPropertyOptional({
    example: ETrainerClientStatus.ACTIVE,
    description: "Assignment status",
    enum: ETrainerClientStatus,
  })
  @IsOptional()
  @IsEnum(ETrainerClientStatus)
  @FieldType("select")
  @FieldOptions(
    Object.values(ETrainerClientStatus).map((v) => ({
      value: v,
      label: v.charAt(0) + v.slice(1).toLowerCase(),
    }))
  )
  status?: ETrainerClientStatus;

  @ApiPropertyOptional({
    example: "Personal training sessions",
    description: "Assignment notes",
  })
  @IsOptional()
  @IsString()
  @FieldType("textarea")
  notes?: string;
}

export class UpdateTrainerClientDto extends PartialType(
  CreateTrainerClientDto
) {}

export class TrainerClientListDto extends ListQueryDto<ITrainerClient> {
  @ApiPropertyOptional({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Filter by trainer ID",
  })
  @IsOptional()
  @IsString()
  trainerId?: string;

  @ApiPropertyOptional({
    example: "550e8400-e29b-41d4-a716-446655440001",
    description: "Filter by client ID",
  })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({
    example: ETrainerClientStatus.ACTIVE,
    description: "Filter by status",
    enum: ETrainerClientStatus,
  })
  @IsOptional()
  @IsEnum(ETrainerClientStatus)
  status?: ETrainerClientStatus;
}

export class TrainerClientDto {
  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Client ID",
  })
  id: string;

  @ApiProperty({ type: TrainerDto })
  @ValidateNested()
  @Type(() => TrainerDto)
  trainer: TrainerDto;

  @ApiProperty({ type: ClientDto })
  @ValidateNested()
  @Type(() => ClientDto)
  client: ClientDto;

  @ApiPropertyOptional({
    example: ETrainerClientStatus.ACTIVE,
    description: "Assignment status",
    enum: ETrainerClientStatus,
  })
  @IsOptional()
  @IsEnum(ETrainerClientStatus)
  @FieldType("select")
  status: ETrainerClientStatus;

  @ApiPropertyOptional({
    example: "Personal training sessions",
    description: "Assignment notes",
  })
  @IsOptional()
  @IsString()
  @FieldType("textarea")
  notes?: string;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}

export class TrainerClientPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [TrainerClientDto] })
  @Type(() => TrainerClientDto)
  data: TrainerClientDto[];
}
