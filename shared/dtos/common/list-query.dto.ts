import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class PaginationDto<T> {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: keyof T; // ✅ dynamic based on T

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}

export class ListQueryDto<T = any> extends PaginationDto<T> {
    @IsOptional()
    @IsString()
    search?: string;
  
    @IsOptional()
    @IsDateString()
    createdAfter?: string;
  
    @IsOptional()
    @IsDateString()
    createdBefore?: string;
  
    @IsOptional()
    @IsDateString()
    updatedAfter?: string;
  
    @IsOptional()
    @IsDateString()
    updatedBefore?: string;
  }