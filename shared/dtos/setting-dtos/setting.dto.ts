import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { FieldType, FieldOptions } from '../../decorators/field.decorator';
import { ESettingType } from '../../enums/setting.enum';

export class CreateSettingDto {
  @ApiProperty({ example: 'theme', description: 'Setting key' })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", true)
  key: string;

  @ApiProperty({ example: 'dark', description: 'Setting value' })
  @IsNotEmpty()
  @FieldType("text", true)
  value: any;

  @ApiProperty({ example: 'STRING', description: 'Setting value type', enum: ESettingType })
  @IsEnum(ESettingType)
  @IsOptional()
  @FieldType("select", false)
  @FieldOptions(Object.values(ESettingType).map(v => ({ value: v, label: v })))
  type?: ESettingType;

  @ApiPropertyOptional({ example: 'User theme preference', description: 'Setting description' })
  @IsString()
  @IsOptional()
  @FieldType("textarea", false)
  description?: string;

  @ApiPropertyOptional({ example: false, description: 'Whether setting is public' })
  @IsBoolean()
  @IsOptional()
  @FieldType("switch", false)
  isPublic?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Whether setting is editable' })
  @IsBoolean()
  @IsOptional()
  @FieldType("switch", false)
  isEditable?: boolean;
}

export class UpdateSettingDto extends PartialType(CreateSettingDto) {
  
}

export class SettingDto {
  @ApiProperty({ example: 1, description: 'Setting ID' })
  id: number;

  @ApiProperty({ example: 1, description: 'User ID' })
  userId: number;

  @ApiProperty({ example: 'theme', description: 'Setting key' })
  key: string;

  @ApiProperty({ example: 'dark', description: 'Setting value' })
  value: string;

  @ApiProperty({ example: 'STRING', description: 'Setting value type' })
  type: ESettingType;

  @ApiPropertyOptional({ example: 'User theme preference', description: 'Setting description' })
  description?: string;

  @ApiProperty({ example: false, description: 'Whether setting is public' })
  isPublic: boolean;

  @ApiProperty({ example: true, description: 'Whether setting is editable' })
  isEditable: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Updated at' })
  updatedAt: Date;
}
