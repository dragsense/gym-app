import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/common/entities';
import { User } from '@/modules/v1/users/entities/user.entity';
import { ECurrency, EDateFormat, ETimeFormat, ETimezone } from '@shared/enums/user-settings.enum';

@Entity('user_settings')
export class UserSettings extends GeneralBaseEntity {

  @ApiProperty({ example: 1, description: 'User ID' })
  @Column({ type: 'int' })
  userId: number;

  // Currency Settings
  @ApiProperty({ example: 'USD', description: 'Default currency', enum: ECurrency })
  @Column({ type: 'enum', enum: ECurrency, default: ECurrency.USD })
  defaultCurrency: ECurrency;

  @ApiProperty({ example: '$', description: 'Currency symbol' })
  @Column({ type: 'varchar', length: 10, default: '$' })
  currencySymbol: string;

  @ApiProperty({ example: 'MM/DD/YYYY', description: 'Date format', enum: EDateFormat })
  @Column({ type: 'enum', enum: EDateFormat, default: EDateFormat.MM_DD_YYYY })
  dateFormat: EDateFormat;

  @ApiProperty({ example: '12h', description: 'Time format', enum: ETimeFormat })
  @Column({ type: 'enum', enum: ETimeFormat, default: ETimeFormat.TWELVE_HOUR })
  timeFormat: ETimeFormat;

  @ApiProperty({ example: 'America/New_York', description: 'Timezone', enum: ETimezone })
  @Column({ type: 'enum', enum: ETimezone, default: ETimezone.EST })
  timezone: ETimezone;

  // Limits Settings
  @ApiProperty({ example: 10, description: 'Maximum sessions per day' })
  @Column({ type: 'int', default: 10 })
  maxSessionsPerDay: number;

  @ApiProperty({ example: 20, description: 'Maximum clients per trainer' })
  @Column({ type: 'int', default: 20 })
  maxClientsPerTrainer: number;

  @ApiProperty({ example: 60, description: 'Default session duration in minutes' })
  @Column({ type: 'int', default: 60 })
  sessionDurationDefault: number;

  // Business Settings
  @ApiProperty({ example: 'FitLife Gym', description: 'Business name' })
  @Column({ type: 'varchar', length: 255 })
  businessName: string;

  @ApiProperty({ example: 'contact@fitlifegym.com', description: 'Business email' })
  @Column({ type: 'varchar', length: 255 })
  businessEmail: string;

  @ApiPropertyOptional({ example: '+1-555-123-4567', description: 'Business phone' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  businessPhone?: string;

  @ApiPropertyOptional({ example: '123 Main St, City, State 12345', description: 'Business address' })
  @Column({ type: 'text', nullable: true })
  businessAddress?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png', description: 'Business logo URL' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  businessLogo?: string;

  // Billing Settings
  @ApiProperty({ example: 15, description: 'Default commission rate (%)' })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 15.00 })
  defaultCommissionRate: number;

  @ApiProperty({ example: 8.5, description: 'Tax rate (%)' })
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 8.50 })
  taxRate: number;

  @ApiProperty({ example: 'INV-', description: 'Invoice prefix' })
  @Column({ type: 'varchar', length: 20, default: 'INV-' })
  invoicePrefix: string;

  // Notification Settings
  @ApiProperty({ example: true, description: 'Enable email notifications' })
  @Column({ type: 'boolean', default: true })
  emailEnabled: boolean;

  @ApiProperty({ example: true, description: 'Enable SMS notifications' })
  @Column({ type: 'boolean', default: true })
  smsEnabled: boolean;

  @ApiProperty({ example: true, description: 'Enable push notifications' })
  @Column({ type: 'boolean', default: true })
  pushEnabled: boolean;

  @ApiProperty({ example: true, description: 'Enable in-app notifications' })
  @Column({ type: 'boolean', default: true })
  inAppEnabled: boolean;

  @ApiProperty({ example: 'immediate', description: 'Session reminder frequency' })
  @Column({ type: 'varchar', length: 20, default: 'immediate' })
  sessionReminderFrequency: string;

  @ApiProperty({ example: 'daily', description: 'Billing notification frequency' })
  @Column({ type: 'varchar', length: 20, default: 'daily' })
  billingNotificationFrequency: string;

  @ApiProperty({ example: true, description: 'Enable marketing notifications' })
  @Column({ type: 'boolean', default: true })
  marketingEnabled: boolean;

  @ApiProperty({ example: true, description: 'Enable system update notifications' })
  @Column({ type: 'boolean', default: true })
  systemUpdateEnabled: boolean;

  @ApiProperty({ example: true, description: 'Enable security alert notifications' })
  @Column({ type: 'boolean', default: true })
  securityAlertEnabled: boolean;

  @ApiProperty({ type: () => User, description: 'Associated user' })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;
}
