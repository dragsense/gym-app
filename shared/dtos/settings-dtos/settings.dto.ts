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
  ValidateNested,
} from "class-validator";
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { FieldType, FieldOptions } from "../../decorators/field.decorator";
import {
  ECurrency,
  EDateFormat,
  ETimeFormat,
  ETimezone,
  ENotificationFrequency,
} from "../../enums/user-settings.enum";

// Currency Settings
export class CurrencySettingsDto {
  @ApiProperty({
    example: "USD",
    description: "Default currency",
    enum: ECurrency,
  })
  @IsEnum(ECurrency)
  @IsOptional()
  @FieldType("select", false)
  @FieldOptions(Object.values(ECurrency).map((v) => ({ value: v, label: v })))
  defaultCurrency?: ECurrency;

  @ApiProperty({ example: "$", description: "Currency symbol" })
  @IsString()
  @IsOptional()
  @FieldType("text", false)
  currencySymbol?: string;

  @ApiProperty({
    example: "MM/DD/YYYY",
    description: "Date format",
    enum: EDateFormat,
  })
  @IsEnum(EDateFormat)
  @IsOptional()
  @FieldType("select", false)
  @FieldOptions(Object.values(EDateFormat).map((v) => ({ value: v, label: v })))
  dateFormat?: EDateFormat;

  @ApiProperty({
    example: "12h",
    description: "Time format",
    enum: ETimeFormat,
  })
  @IsEnum(ETimeFormat)
  @IsOptional()
  @FieldType("select", false)
  @FieldOptions(Object.values(ETimeFormat).map((v) => ({ value: v, label: v })))
  timeFormat?: ETimeFormat;

  @ApiProperty({
    example: "America/New_York",
    description: "Timezone",
    enum: ETimezone,
  })
  @IsEnum(ETimezone)
  @IsOptional()
  @FieldType("select", false)
  @FieldOptions(Object.values(ETimezone).map((v) => ({ value: v, label: v })))
  timezone?: ETimezone;
}

// Limits Settings
export class LimitSettingsDto {
  @ApiProperty({ example: 10, description: "Maximum sessions per day" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @FieldType("number", false)
  @Type(() => Number)
  maxSessionsPerDay?: number;

  @ApiProperty({ example: 20, description: "Maximum clients per trainer" })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @FieldType("number", false)
  @Type(() => Number)
  maxClientsPerTrainer?: number;

  @ApiProperty({
    example: 60,
    description: "Default session duration in minutes",
  })
  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(480)
  @FieldType("number", false)
  @Type(() => Number)
  sessionDurationDefault?: number;
}

// Business Settings
export class BusinessSettingsDto {
  @ApiProperty({ example: "FitLife Gym", description: "Business name" })
  @IsOptional()
  @IsString()
  @IsOptional()
  @FieldType("text", false)
  businessName?: string;

  @ApiProperty({
    example: "contact@fitlifegym.com",
    description: "Business email",
  })
  @IsOptional()
  @IsEmail()
  @FieldType("email", false)
  businessEmail?: string;

  @ApiProperty({ example: "+1-555-123-4567", description: "Business phone" })
  @IsOptional()
  @IsString()
  @FieldType("text", false)
  businessPhone?: string;

  @ApiProperty({
    example: "123 Main St, City, State 12345",
    description: "Business address",
  })
  @IsOptional()
  @IsString()
  @FieldType("textarea", false)
  businessAddress?: string;

  @ApiProperty({
    example: "https://example.com/logo.png",
    description: "Business logo URL",
  })
  @IsOptional()
  @IsUrl()
  @FieldType("text", false)
  businessLogo?: string;
}

// Billing Settings
export class BillingSettingsDto {
  @ApiProperty({ example: 8.5, description: "Tax rate (%)" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  @FieldType("number", false)
  @Type(() => Number)
  taxRate?: number;

  @ApiProperty({ example: "INV-", description: "Invoice prefix" })
  @IsString()
  @IsOptional()
  @FieldType("text", false)
  invoicePrefix?: string;
}

// Notification Settings
export class NotificationSettingsDto {
  @ApiProperty({ example: true, description: "Enable email notifications" })
  @IsOptional()
  @IsBoolean()
  @FieldType("switch", false)
  emailEnabled?: boolean;

  @ApiProperty({ example: true, description: "Enable SMS notifications" })
  @IsOptional()
  @IsBoolean()
  @FieldType("switch", false)
  smsEnabled?: boolean;

  @ApiProperty({ example: true, description: "Enable push notifications" })
  @IsOptional()
  @IsBoolean()
  @FieldType("switch", false)
  pushEnabled?: boolean;

  @ApiProperty({ example: true, description: "Enable in-app notifications" })
  @IsOptional()
  @IsBoolean()
  @FieldType("switch", false)
  inAppEnabled?: boolean;

  @ApiProperty({
    example: "immediate",
    description: "Session reminder frequency",
    enum: ENotificationFrequency,
  })
  @IsOptional()
  @IsEnum(ENotificationFrequency)
  @FieldType("select", false)
  @FieldOptions(
    Object.values(ENotificationFrequency).map((v) => ({
      value: v,
      label: v.charAt(0).toUpperCase() + v.slice(1),
    }))
  )
  sessionReminderFrequency?: ENotificationFrequency;

  @ApiProperty({
    example: "daily",
    description: "Billing notification frequency",
    enum: ENotificationFrequency,
  })
  @IsOptional()
  @IsEnum(ENotificationFrequency)
  @FieldType("select", false)
  @FieldOptions(
    Object.values(ENotificationFrequency).map((v) => ({
      value: v,
      label: v.charAt(0).toUpperCase() + v.slice(1),
    }))
  )
  billingNotificationFrequency?: ENotificationFrequency;

  @ApiProperty({ example: true, description: "Enable marketing notifications" })
  @IsOptional()
  @IsBoolean()
  @FieldType("switch", false)
  marketingEnabled?: boolean;

  @ApiProperty({
    example: true,
    description: "Enable system update notifications",
  })
  @IsOptional()
  @IsBoolean()
  @FieldType("switch", false)
  systemUpdateEnabled?: boolean;

  @ApiProperty({
    example: true,
    description: "Enable security alert notifications",
  })
  @IsOptional()
  @IsBoolean()
  @FieldType("switch", false)
  securityAlertEnabled?: boolean;
}

// Main User Settings DTO
export class CreateOrUpdateUserSettingsDto {
  @ApiProperty({ type: CurrencySettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CurrencySettingsDto)
  @FieldType("nested", false, CurrencySettingsDto)
  currency?: CurrencySettingsDto;

  @ApiProperty({ type: LimitSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LimitSettingsDto)
  @FieldType("nested", false, LimitSettingsDto)
  limits?: LimitSettingsDto;

  @ApiProperty({ type: BusinessSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessSettingsDto)
  @FieldType("nested", false, BusinessSettingsDto)
  business?: BusinessSettingsDto;

  @ApiProperty({ type: BillingSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BillingSettingsDto)
  @FieldType("nested", false, BillingSettingsDto)
  billing?: BillingSettingsDto;

  @ApiProperty({ type: NotificationSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  @FieldType("nested", false, NotificationSettingsDto)
  notifications?: NotificationSettingsDto;
}

export class UserSettingsDto {
  @ApiProperty({ type: CurrencySettingsDto })
  @IsOptional()
  currency?: CurrencySettingsDto;

  @ApiProperty({ type: LimitSettingsDto })
  @IsOptional()
  limits?: LimitSettingsDto;

  @ApiProperty({ type: BusinessSettingsDto })
  @IsOptional()
  business?: BusinessSettingsDto;

  @ApiProperty({ type: BillingSettingsDto })
  @IsOptional()
  billing?: BillingSettingsDto;

  @ApiProperty({ type: NotificationSettingsDto })
  @IsOptional()
  notifications?: NotificationSettingsDto;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}
