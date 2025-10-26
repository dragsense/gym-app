import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  ValidateNested,
  Min,
  IsEnum,
  IsArray,
  ValidateIf,
  ArrayMinSize,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Type, Transform } from "class-transformer";
import { PaginationMetaDto } from "../common/pagination.dto";
import { ListQueryDto, SingleQueryDto } from "../common/list-query.dto";
// import { ISession } from '../../interfaces/session.interface';
import { FieldType, FieldOptions } from "../../decorators/field.decorator";
import { OmitType } from "../../lib/dto-type-adapter";
import { UserDto } from "../user-dtos";
import { Like, Equals, DateRange } from "../../decorators/crud.dto.decorators";
import { ESessionStatus, ESessionType } from "../../enums/session.enum";
import { ISession } from "../../interfaces/session.interface";
import { ReminderDto } from "../reminder-dtos";

export class CreateSessionDto {
  @ApiProperty({ example: "Morning Workout", description: "Session title" })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", true)
  title: string;

  @ApiProperty({
    example: "Cardio and strength training session",
    description: "Session description",
  })
  @IsString()
  @IsOptional()
  @FieldType("textarea", false)
  description?: string;

  @ApiProperty({
    example: "2024-01-15T09:00:00.000Z",
    description: "Session start date and time",
  })
  @IsDateString()
  @IsNotEmpty()
  @FieldType("datetime", true)
  startDateTime: string;

  @ApiPropertyOptional({
    example: 60,
    description: "Session duration in minutes",
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @FieldType("number")
  @Type(() => Number)
  duration?: number;

  @ApiProperty({ type: UserDto })
  @ValidateNested()
  @Type(() => UserDto)
  @FieldType("nested", true, UserDto)
  trainerUser: UserDto;

  @ApiProperty({
    type: [UserDto],
    description: "Associated clients (at least one required)",
  })
  @ValidateNested({ each: true })
  @Type(() => UserDto)
  @FieldType("nested", true, UserDto)
  @IsArray()
  @ArrayMinSize(1, { message: "At least one client must be selected" })
  clientsUsers: UserDto[];

  @ApiProperty({
    example: "PERSONAL",
    description: "Session type",
    enum: ESessionType,
  })
  @IsEnum(ESessionType)
  @IsNotEmpty()
  @FieldType("select", true)
  @FieldOptions(
    Object.values(ESessionType).map((v) => ({
      value: v,
      label: v.charAt(0) + v.slice(1).toLowerCase(),
    }))
  )
  type: ESessionType;

  @ApiPropertyOptional({
    example: "Gym Floor A",
    description: "Session location",
  })
  @IsOptional()
  @IsString()
  @FieldType("text")
  location?: string;

  @ApiPropertyOptional({ example: 50, description: "Session price" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @FieldType("number")
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({
    example: "Bring water bottle and towel",
    description: "Session notes",
  })
  @IsOptional()
  @IsString()
  @FieldType("textarea")
  notes?: string;

  @ApiPropertyOptional({ type: ReminderDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReminderDto)
  @FieldType("nested", false, ReminderDto)
  @ValidateIf((o) => o.enableReminder === true)
  reminderConfig?: ReminderDto;

  @ApiPropertyOptional({
    example: true,
    description: "Whether reminders are enabled for this session",
  })
  @IsOptional()
  @IsBoolean()
  @FieldType("switch")
  enableReminder?: boolean;
}

export class UpdateSessionDto extends PartialType(CreateSessionDto) {}

export class SessionPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [SessionDto] })
  @Type(() => SessionDto)
  data: SessionDto[];
}

export class SessionListDto extends ListQueryDto<ISession> {
  @ApiPropertyOptional({
    example: "SCHEDULED",
    description: "Filter by session status",
  })
  @IsOptional()
  @IsEnum(ESessionStatus)
  @Equals()
  @FieldType("select", false)
  status?: ESessionStatus;

  @ApiPropertyOptional({
    example: "PERSONAL",
    description: "Filter by session type",
  })
  @IsOptional()
  @IsEnum(ESessionType)
  @Equals()
  @FieldType("select", false)
  type?: ESessionType;

  @ApiPropertyOptional({
    example: "Morning",
    description: "Filter by session title",
  })
  @IsOptional()
  @IsString()
  @Like()
  @FieldType("text", false)
  title?: string;

  @ApiPropertyOptional({
    example: "2024-01-01",
    description: "Filter by start date",
  })
  @IsOptional()
  @IsDateString()
  @DateRange()
  @FieldType("date", false)
  startDate?: string;

  @ApiPropertyOptional({
    example: "2024-01-31",
    description: "Filter by end date",
  })
  @IsOptional()
  @IsDateString()
  @DateRange()
  @FieldType("date", false)
  endDate?: string;
}

export class SessionDto {
  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Session ID",
  })
  @IsNotEmpty()
  @IsString()
  @FieldType("text", true)
  id: string;

  @ApiProperty({ example: "Morning Workout", description: "Session title" })
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({
    example: "Cardio and strength training session",
    description: "Session description",
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    example: "2024-01-15T09:00:00.000Z",
    description: "Session start date and time",
  })
  @IsOptional()
  startDateTime: string;

  @ApiPropertyOptional({
    example: 60,
    description: "Session duration in minutes",
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({
    example: "2024-01-15T10:00:00.000Z",
    description: "Session end date and time (auto-calculated)",
  })
  @IsOptional()
  endDateTime?: string;

  @ApiProperty({ example: "PERSONAL", description: "Session type" })
  @IsOptional()
  type: ESessionType;

  @ApiPropertyOptional({
    example: "Gym Floor A",
    description: "Session location",
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 50, description: "Session price" })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({
    example: "Bring water bottle and towel",
    description: "Session notes",
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: "SCHEDULED", description: "Session status" })
  @IsOptional()
  status: ESessionStatus;

  @ApiProperty({ type: UserDto })
  @ValidateNested()
  @Type(() => UserDto)
  trainerUser: UserDto;

  @ApiProperty({ type: [UserDto] })
  @ValidateNested()
  @Type(() => UserDto)
  @IsArray()
  clientsUsers: UserDto[];

  @ApiProperty({ example: 1, description: "Number of clients" })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @FieldType("number", true)
  @Min(0)
  clientsUsersCount?: number;

  @ApiPropertyOptional({
    example: true,
    description: "Whether reminders are enabled for this session",
  })
  @IsOptional()
  @IsBoolean()
  enableReminders?: boolean;

  @ApiPropertyOptional({ type: ReminderDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReminderDto)
  @FieldType("nested", false, ReminderDto)
  @ValidateIf((o) => o.enableReminder === true)
  reminderConfig?: ReminderDto;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}
