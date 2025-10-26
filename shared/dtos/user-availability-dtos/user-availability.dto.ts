import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsNumber,
  Matches,
  ValidateNested,
  Min,
  ValidateIf,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PartialType, createPartialType } from "../../lib/type-utils";
import { FieldType } from "../../decorators/field.decorator";

export class TimeSlotDto {
  @ApiProperty({
    type: String,
    example: "09:00",
    description: "Start time of the slot (HH:mm)",
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Start time must be in HH:mm format",
  })
  @FieldType("time", true)
  start!: string;

  @ApiProperty({
    type: String,
    example: "17:00",
    description: "End time of the slot (HH:mm)",
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "End time must be in HH:mm format",
  })
  @FieldType("time", true)
  end!: string;
}

export class DayScheduleDto {
  @ApiProperty({
    type: Boolean,
    example: true,
    description: "Whether the day is enabled for availability",
  })
  @IsBoolean()
  @FieldType("switch", true)
  enabled!: boolean;

  @ApiProperty({
    type: [TimeSlotDto],
    description: "Array of time slots for the day",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @ArrayMaxSize(5)
  @FieldType("nestedArray", true, TimeSlotDto)
  @ValidateIf((obj) => obj.enabled)
  timeSlots?: TimeSlotDto[];
}

export class UnavailablePeriodDto {
  @ApiProperty({
    type: String,
    example: "Vacation",
    description: "Reason for unavailability",
  })
  @IsString()
  @FieldType("text", true)
  reason!: string;

  @ApiProperty({
    type: String,
    example: "2024-07-01T00:00:00.000Z",
    description: "Start date of the unavailable period (ISO 8601)",
  })
  @IsString()
  @FieldType("date", true)
  startDate!: string;

  @ApiProperty({
    type: String,
    example: "2024-07-10T23:59:59.000Z",
    description: "End date of the unavailable period (ISO 8601)",
  })
  @IsDateString()
  @FieldType("date", true)
  endDate!: string;
}

export class WeeklyScheduleDto {
  @ApiProperty({
    type: DayScheduleDto,
    description: "Monday schedule",
  })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  @FieldType("nested", true, DayScheduleDto)
  @IsOptional()
  monday?: DayScheduleDto;

  @ApiProperty({
    type: DayScheduleDto,
    description: "Tuesday schedule",
  })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  @FieldType("nested", true, DayScheduleDto)
  @IsOptional()
  tuesday?: DayScheduleDto;

  @ApiProperty({
    type: DayScheduleDto,
    description: "Wednesday schedule",
  })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  @FieldType("nested", true, DayScheduleDto)
  @IsOptional()
  wednesday?: DayScheduleDto;

  @ApiProperty({
    type: DayScheduleDto,
    description: "Thursday schedule",
  })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  @FieldType("nested", true, DayScheduleDto)
  @IsOptional()
  thursday?: DayScheduleDto;

  @ApiProperty({
    type: DayScheduleDto,
    description: "Friday schedule",
  })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  @FieldType("nested", true, DayScheduleDto)
  @IsOptional()
  friday?: DayScheduleDto;

  @ApiProperty({
    type: DayScheduleDto,
    description: "Saturday schedule",
  })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  @FieldType("nested", true, DayScheduleDto)
  @IsOptional()
  saturday?: DayScheduleDto;

  @ApiProperty({
    type: DayScheduleDto,
    description: "Sunday schedule",
  })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  @FieldType("nested", true, DayScheduleDto)
  @IsOptional()
  sunday?: DayScheduleDto;
}

export class UserAvailabilityDto {
  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "User Availability ID",
  })
  @IsNotEmpty()
  @IsString()
  @FieldType("text", true)
  id!: string;

  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440001",
    description: "User ID",
  })
  @IsNotEmpty()
  @IsString()
  @FieldType("text", true)
  userId!: string;

  @ApiProperty({
    type: () => WeeklyScheduleDto,
    description: "Weekly schedule object",
  })
  @IsObject()
  @ValidateNested()
  @Type(() => WeeklyScheduleDto)
  @FieldType("nested", true, WeeklyScheduleDto)
  weeklySchedule!: WeeklyScheduleDto;

  @ApiProperty({
    type: () => [UnavailablePeriodDto],
    description: "List of unavailable periods",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnavailablePeriodDto)
  @FieldType("nested", true, UnavailablePeriodDto)
  unavailablePeriods!: UnavailablePeriodDto[];

  @ApiProperty({
    example: "2024-01-01T00:00:00.000Z",
    description: "Creation timestamp",
  })
  createdAt!: Date;

  @ApiProperty({
    example: "2024-01-01T00:00:00.000Z",
    description: "Last update timestamp",
  })
  updatedAt!: Date;
}

export class CreateUserAvailabilityDto {
  @ApiProperty({
    description: "Weekly schedule for the user",
    type: WeeklyScheduleDto,
  })
  @ValidateNested()
  @Type(() => WeeklyScheduleDto)
  @FieldType("nested", true, WeeklyScheduleDto)
  @IsOptional()
  weeklySchedule?: WeeklyScheduleDto;

  @ApiProperty({
    description: "List of unavailable periods",
    type: [UnavailablePeriodDto],
    required: false,
    example: [
      {
        startDate: "2025-08-10",
        endDate: "2025-08-15",
        reason: "Vacation",
      },
    ],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UnavailablePeriodDto)
  @ArrayMaxSize(10)
  @FieldType("nestedArray", true, UnavailablePeriodDto)
  unavailablePeriods?: UnavailablePeriodDto[];
}

export class UpdateUserAvailabilityDto extends createPartialType(
  CreateUserAvailabilityDto
) {}
