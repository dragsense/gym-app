import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsEmail,
  Min,
  Max,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { PaginationMetaDto } from '../common/pagination.dto';
import { ListQueryDto, SingleQueryDto } from '../common/list-query.dto';
import { FieldType, FieldOptions } from '../../decorators/field.decorator';
import { OmitType } from '../../lib/dto-type-adapter';
import { ECurrency, EDateFormat, ETimeFormat, ETimezone, ENotificationChannel, ENotificationFrequency, ENotificationType } from '../../enums/user-settings.enum';
import { IUserSettings } from '../../interfaces/user-settings.interface';

// Currency Settings
export class CurrencySettingsDto {
  @ApiProperty({ example: 'USD', description: 'Default currency', enum: ECurrency })
  @IsEnum(ECurrency)
  @IsNotEmpty()
  @FieldType("select", true)
  @FieldOptions(Object.values(ECurrency).map(v => ({ value: v, label: v })))
  defaultCurrency: ECurrency;

  @ApiProperty({ example: '$', description: 'Currency symbol' })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", true)
  currencySymbol: string;

  @ApiProperty({ example: 'MM/DD/YYYY', description: 'Date format', enum: EDateFormat })
  @IsEnum(EDateFormat)
  @IsNotEmpty()
  @FieldType("select", true)
  @FieldOptions(Object.values(EDateFormat).map(v => ({ value: v, label: v })))
  dateFormat: EDateFormat;

  @ApiProperty({ example: '12h', description: 'Time format', enum: ETimeFormat })
  @IsEnum(ETimeFormat)
  @IsNotEmpty()
  @FieldType("select", true)
  @FieldOptions(Object.values(ETimeFormat).map(v => ({ value: v, label: v })))
  timeFormat: ETimeFormat;

  @ApiProperty({ example: 'America/New_York', description: 'Timezone', enum: ETimezone })
  @IsEnum(ETimezone)
  @IsNotEmpty()
  @FieldType("select", true)
  @FieldOptions(Object.values(ETimezone).map(v => ({ value: v, label: v })))
  timezone: ETimezone;
}

// Limits Settings
export class LimitSettingsDto {
  @ApiProperty({ example: 10, description: 'Maximum sessions per day' })
  @IsNumber()
  @Min(1)
  @Max(50)
  @FieldType("number", true)
  @Type(() => Number)
  maxSessionsPerDay: number;

  @ApiProperty({ example: 20, description: 'Maximum clients per trainer' })
  @IsNumber()
  @Min(1)
  @Max(100)
  @FieldType("number", true)
  @Type(() => Number)
  maxClientsPerTrainer: number;

  @ApiProperty({ example: 60, description: 'Default session duration in minutes' })
  @IsNumber()
  @Min(15)
  @Max(480)
  @FieldType("number", true)
  @Type(() => Number)
  sessionDurationDefault: number;
}

// Business Settings
export class BusinessSettingsDto {
  @ApiProperty({ example: 'FitLife Gym', description: 'Business name' })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", true)
  businessName: string;

  @ApiProperty({ example: 'contact@fitlifegym.com', description: 'Business email' })
  @IsEmail()
  @IsNotEmpty()
  @FieldType("email", true)
  businessEmail: string;

  @ApiProperty({ example: '+1-555-123-4567', description: 'Business phone' })
  @IsString()
  @IsOptional()
  @FieldType("text", false)
  businessPhone?: string;

  @ApiProperty({ example: '123 Main St, City, State 12345', description: 'Business address' })
  @IsString()
  @IsOptional()
  @FieldType("textarea", false)
  businessAddress?: string;

  @ApiProperty({ example: 'https://example.com/logo.png', description: 'Business logo URL' })
  @IsUrl()
  @IsOptional()
  @FieldType("text", false)
  businessLogo?: string;
}

// Billing Settings
export class BillingSettingsDto {
  @ApiProperty({ example: 15, description: 'Default commission rate (%)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @FieldType("number", true)
  @Type(() => Number)
  defaultCommissionRate: number;

  @ApiProperty({ example: 8.5, description: 'Tax rate (%)' })
  @IsNumber()
  @Min(0)
  @Max(50)
  @FieldType("number", true)
  @Type(() => Number)
  taxRate: number;

  @ApiProperty({ example: 'INV-', description: 'Invoice prefix' })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", true)
  invoicePrefix: string;
}

// Notification Settings
export class NotificationSettingsDto {
  @ApiProperty({ example: true, description: 'Enable email notifications' })
  @IsBoolean()
  @FieldType("checkbox", true)
  emailEnabled: boolean;

  @ApiProperty({ example: true, description: 'Enable SMS notifications' })
  @IsBoolean()
  @FieldType("checkbox", true)
  smsEnabled: boolean;

  @ApiProperty({ example: true, description: 'Enable push notifications' })
  @IsBoolean()
  @FieldType("checkbox", true)
  pushEnabled: boolean;

  @ApiProperty({ example: true, description: 'Enable in-app notifications' })
  @IsBoolean()
  @FieldType("checkbox", true)
  inAppEnabled: boolean;

  @ApiProperty({ example: 'immediate', description: 'Session reminder frequency', enum: ENotificationFrequency })
  @IsEnum(ENotificationFrequency)
  @IsNotEmpty()
  @FieldType("select", true)
  @FieldOptions(Object.values(ENotificationFrequency).map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) })))
  sessionReminderFrequency: ENotificationFrequency;

  @ApiProperty({ example: 'daily', description: 'Billing notification frequency', enum: ENotificationFrequency })
  @IsEnum(ENotificationFrequency)
  @IsNotEmpty()
  @FieldType("select", true)
  @FieldOptions(Object.values(ENotificationFrequency).map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) })))
  billingNotificationFrequency: ENotificationFrequency;

  @ApiProperty({ example: true, description: 'Enable marketing notifications' })
  @IsBoolean()
  @FieldType("checkbox", true)
  marketingEnabled: boolean;

  @ApiProperty({ example: true, description: 'Enable system update notifications' })
  @IsBoolean()
  @FieldType("checkbox", true)
  systemUpdateEnabled: boolean;

  @ApiProperty({ example: true, description: 'Enable security alert notifications' })
  @IsBoolean()
  @FieldType("checkbox", true)
  securityAlertEnabled: boolean;
}

// Main User Settings DTO
export class CreateUserSettingsDto {
  @ApiProperty({ type: CurrencySettingsDto })
  @IsNotEmpty()
  @FieldType("nested", true, CurrencySettingsDto)
  currency: CurrencySettingsDto;

  @ApiProperty({ type: LimitSettingsDto })
  @IsNotEmpty()
  @FieldType("nested", true, LimitSettingsDto)
  limits: LimitSettingsDto;

  @ApiProperty({ type: BusinessSettingsDto })
  @IsNotEmpty()
  @FieldType("nested", true, BusinessSettingsDto)
  business: BusinessSettingsDto;

  @ApiProperty({ type: BillingSettingsDto })
  @IsNotEmpty()
  @FieldType("nested", true, BillingSettingsDto)
  billing: BillingSettingsDto;

  @ApiProperty({ type: NotificationSettingsDto })
  @IsNotEmpty()
  @FieldType("nested", true, NotificationSettingsDto)
  notifications: NotificationSettingsDto;
}

export class UpdateUserSettingsDto extends PartialType(OmitType(CreateUserSettingsDto, [])) { }

export class UserSettingsListDto extends ListQueryDto<IUserSettings> {
  // Add any filtering options if needed
}

export class UserSettingsDto {
  @ApiProperty({ example: 1, description: 'User Settings ID' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @FieldType("number", true)
  @Min(1)
  id: number;

  @ApiProperty({ example: 1, description: 'User ID' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  userId: number;

  @ApiProperty({ type: CurrencySettingsDto })
  @IsOptional()
  currency: CurrencySettingsDto;

  @ApiProperty({ type: LimitSettingsDto })
  @IsOptional()
  limits: LimitSettingsDto;

  @ApiProperty({ type: BusinessSettingsDto })
  @IsOptional()
  business: BusinessSettingsDto;

  @ApiProperty({ type: BillingSettingsDto })
  @IsOptional()
  billing: BillingSettingsDto;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}

export class UserSettingsPaginatedDto {
  @ApiProperty({ type: [UserSettingsDto] })
  data: UserSettingsDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
