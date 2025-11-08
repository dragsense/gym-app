import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EAnalyticsPeriod } from '../../enums/dashboard-analytics.enum';

export class DashboardAnalyticsDto {
  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ example: EAnalyticsPeriod.MONTH })
  @IsOptional()
  @IsEnum(EAnalyticsPeriod)
  period?: EAnalyticsPeriod;
}
