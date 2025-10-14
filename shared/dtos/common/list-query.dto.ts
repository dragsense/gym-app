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
import { FieldType } from '../../decorators/field.decorator';

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
    @FieldType('text', false)
    search?: string;
  
    @IsOptional()
    @IsDateString()
    @FieldType('date', false)
    createdAfter?: string;
  
    @IsOptional()
    @IsDateString()
    @FieldType('date', false)
    createdBefore?: string;
  
    @IsOptional()
    @IsDateString()
    @FieldType('date', false)
    updatedAfter?: string;
  
    @IsOptional()
    @IsDateString()
    @FieldType('date', false)
    updatedBefore?: string;

  }