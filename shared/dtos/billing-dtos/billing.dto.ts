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
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { PaginationMetaDto } from '../common/pagination.dto';
import { ListQueryDto, SingleQueryDto } from '../common/list-query.dto';
import { FieldType, FieldOptions } from '../../decorators/field.decorator';
import { OmitType } from '../../lib/dto-type-adapter';
import { UserDto } from '../user-dtos';
import {
  Like,
  Equals,
  DateRange,
} from '../../decorators/crud.dto.decorators';
import { EBillingStatus, EBillingType } from '../../enums/billing.enum';
import { IBilling } from '../../interfaces/billing.interface';
import { ReminderDto } from '../reminder-dtos';
import { EScheduleFrequency } from '../../enums/schedule.enum';



export class CreateBillingDto {
  @ApiProperty({ example: 'Session Payment - Morning Workout', description: 'Billing title' })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", true)
  title: string;

  @ApiProperty({ example: 'Payment for personal training session', description: 'Billing description' })
  @IsString()
  @IsOptional()
  @FieldType("textarea", false)
  description?: string;

  @ApiProperty({ example: 50, description: 'Billing amount' })
  @IsNumber()
  @Min(0)
  @FieldType("number", true)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: '2024-01-10T09:00:00.000Z', description: 'Billing issue date' })
  @IsDateString()
  @IsNotEmpty()
  @FieldType("datetime", true)
  issueDate: string;

  @ApiProperty({ example: '2024-01-15T09:00:00.000Z', description: 'Billing due date' })
  @IsDateString()
  @IsNotEmpty()
  @FieldType("datetime", true)
  dueDate: string;

  @ApiProperty({ type: UserDto })
  @ValidateNested()
  @Type(() => UserDto)
  @FieldType("nested", true, UserDto)
  recipientUser: UserDto;

  @ApiProperty({ example: 'SESSION', description: 'Billing type', enum: EBillingType })
  @IsEnum(EBillingType)
  @IsNotEmpty()
  @FieldType("select", true)
  @FieldOptions(Object.values(EBillingType).map(v => ({ value: v, label: v.charAt(0) + v.slice(1).toLowerCase() })))
  type: EBillingType;

  @ApiPropertyOptional({ example: EScheduleFrequency.MONTHLY, description: 'Billing recurrence', enum: EScheduleFrequency })
  @IsOptional()
  @IsEnum(EScheduleFrequency)
  @FieldType("select", false)
  @FieldOptions(Object.values(EScheduleFrequency).map(v => ({ value: v, label: v.charAt(0) + v.slice(1).toLowerCase() })))
  recurrence?: EScheduleFrequency;

  @ApiPropertyOptional({ example: 'Payment notes and instructions', description: 'Billing notes' })
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

  @ApiPropertyOptional({ example: true, description: 'Whether reminders are enabled for this billing' })
  @IsOptional()
  @IsBoolean()
  @FieldType("switch")
  enableReminder?: boolean;
}

export class UpdateBillingDto extends PartialType(OmitType(CreateBillingDto, [])) { }

export class BillingListDto extends ListQueryDto<IBilling> {
}

export class BillingDto {
  @ApiProperty({ example: 1, description: 'Billing ID' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @FieldType("number", true)
  @Min(1)
  id: number;

  @ApiProperty({ example: 'Session Payment - Morning Workout', description: 'Billing title' })
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Payment for personal training session', description: 'Billing description' })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ example: 50, description: 'Billing amount' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ example: '2024-01-10T09:00:00.000Z', description: 'Billing issue date' })
  @IsOptional()
  issueDate: string;

  @ApiProperty({ example: '2024-01-15T09:00:00.000Z', description: 'Billing due date' })
  @IsOptional()
  dueDate: string;

  @ApiProperty({ example: 'PENDING', description: 'Billing status' })
  @IsOptional()
  status: EBillingStatus;

  @ApiProperty({ example: 'SESSION', description: 'Billing type' })
  @IsOptional()
  type: EBillingType;

  @ApiPropertyOptional({ example: EScheduleFrequency.MONTHLY, description: 'Billing recurrence' })
  @IsOptional()
  recurrence?: EScheduleFrequency;

  @ApiPropertyOptional({ example: 'Payment notes and instructions', description: 'Billing notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: UserDto })
  @ValidateNested()
  @Type(() => UserDto)
  recipientUser: UserDto;

  @ApiProperty({ example: 1, description: 'Number of clients' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @FieldType("number", true)
  @Min(0)
  clientsCount?: number;

  @ApiPropertyOptional({ example: true, description: 'Whether reminders are enabled for this billing' })
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

export class BillingPaginatedDto {
  @ApiProperty({ type: [BillingDto] })
  data: BillingDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
