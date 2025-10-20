import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType, createPartialType } from '../../lib/type-utils';

export class TimeSlotDto {
  @ApiProperty({
    type: String,
    example: '09:00',
    description: 'Start time of the slot (HH:mm)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Start time must be in HH:mm format',
  })
  start: string;

  @ApiProperty({
    type: String,
    example: '17:00',
    description: 'End time of the slot (HH:mm)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'End time must be in HH:mm format',
  })
  end: string;
}

export class DayScheduleDto {
  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Whether the day is enabled for availability',
  })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({
    type: [TimeSlotDto],
    description: 'Array of time slots for the day',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @ArrayMaxSize(5)
  timeSlots: TimeSlotDto[];
}

export class UnavailablePeriodDto {
  @ApiPropertyOptional({
    type: String,
    example: 'abc123',
    description: 'Optional ID of the unavailable period',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    type: String,
    example: 'Vacation',
    description: 'Reason for unavailability',
  })
  @IsString()
  reason: string;

  @ApiProperty({
    type: String,
    example: '2024-07-01T00:00:00.000Z',
    description: 'Start date of the unavailable period (ISO 8601)',
  })
  @IsDateString()
  startDate: Date;

  @ApiProperty({
    type: String,
    example: '2024-07-10T23:59:59.000Z',
    description: 'End date of the unavailable period (ISO 8601)',
  })
  @IsDateString()
  endDate: Date;
}

export class WeeklyScheduleDto {
  @ApiProperty({
    type: DayScheduleDto,
    description: 'Monday schedule',
  })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  monday: DayScheduleDto;

  @ApiProperty({
    type: DayScheduleDto,
    description: 'Tuesday schedule',
  })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  tuesday: DayScheduleDto;

  @ApiProperty({
    type: DayScheduleDto,
    description: 'Wednesday schedule',
  })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  wednesday: DayScheduleDto;

  @ApiProperty({
    type: DayScheduleDto,
    description: 'Thursday schedule',
  })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  thursday: DayScheduleDto;

  @ApiProperty({
    type: DayScheduleDto,
    description: 'Friday schedule',
  })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  friday: DayScheduleDto;

  @ApiProperty({
    type: DayScheduleDto,
    description: 'Saturday schedule',
  })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  saturday: DayScheduleDto;

  @ApiProperty({
    type: DayScheduleDto,
    description: 'Sunday schedule',
  })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  sunday: DayScheduleDto;
}

export class UserAvailabilityDto {
  @ApiProperty({
    type: () => [UnavailablePeriodDto],
    description: 'List of unavailable periods',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnavailablePeriodDto)
  unavailablePeriods: UnavailablePeriodDto[];

  @ApiProperty({
    type: () => WeeklyScheduleDto,
    description: 'Weekly schedule object',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => WeeklyScheduleDto)
  weeklySchedule: WeeklyScheduleDto;
}

export class CreateUserAvailabilityDto {
  @ApiProperty({
    description: 'Weekly schedule for the user',
    type: WeeklyScheduleDto,
  })
  @IsNotEmpty()
  @IsObject()
  weeklySchedule: {
    monday: DayScheduleDto;
    tuesday: DayScheduleDto;
    wednesday: DayScheduleDto;
    thursday: DayScheduleDto;
    friday: DayScheduleDto;
    saturday: DayScheduleDto;
    sunday: DayScheduleDto;
  };

  @ApiProperty({
    description: 'List of unavailable periods',
    type: [UnavailablePeriodDto],
    required: false,
    example: [
      {
        startDate: '2025-08-10',
        endDate: '2025-08-15',
        reason: 'Vacation'
      }
    ]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnavailablePeriodDto)
  @ArrayMaxSize(10)
  unavailablePeriods?: UnavailablePeriodDto[];
}

export class UpdateUserAvailabilityDto extends createPartialType(CreateUserAvailabilityDto) {

}
