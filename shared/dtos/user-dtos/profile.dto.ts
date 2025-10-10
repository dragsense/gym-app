import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsDate,
  IsEnum,
  Min,
  IsDateString,
  IsNotEmpty,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { EUserGender, EUserSkill } from '../../enums/user.enum';
import { FieldOptions, FieldType } from '../../decorators/field.decorator';
import { FileUploadDto } from '../file-upload-dtos';



export class CreateProfileDto {

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", true)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", true)
  lastName: string;


  @ApiProperty({ example: '+1234567890' })
  @IsNotEmpty()
  @IsString()
  @FieldType("text", true)
  phoneNumber?: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  @FieldType("date")
  dateOfBirth?: string;

  @ApiProperty({ enum: EUserGender, example: EUserGender.MALE })
  @IsOptional()
  @IsEnum(EUserGender)
  @FieldType("select")
  @FieldOptions(Object.values(EUserGender).map(v => ({ value: v, label: v })))
  gender?: EUserGender;

  @ApiProperty({ example: '123 Main Street, New York' })
  @IsOptional()
  @IsString()
  @FieldType("text")
  address?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Image file',
  })
  @IsOptional()
  @FieldType("custom")
  image?: any;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
    description: 'Document files (max 10)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @FieldType("custom")
  documents?: any[];

  @ApiPropertyOptional({
    enum: EUserSkill,
    isArray: true,
    example: [EUserSkill.JAVASCRIPT, EUserSkill.REACT],
    description: 'User skills',
  })
  @IsOptional()
  @IsArray()
  @IsEnum(EUserSkill, { each: true })
  @ArrayMaxSize(10)
  @FieldType("multiSelect")
  @FieldOptions(Object.values(EUserSkill).map(v => ({ value: v as string, label: v as string })))
  skills?: EUserSkill[];
}


export class UpdateProfileDto extends PartialType(CreateProfileDto) { }


export class ProfileDto {

  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;
  
  @ApiProperty({ example: '+1234567890' })
  phoneNumber?: string;
  
  @ApiProperty({ example: '1990-01-01' })
  dateOfBirth?: string;
  
  @ApiProperty({ enum: EUserGender, example: EUserGender.MALE })
  gender?: EUserGender;
  

  @ApiProperty({ example: '123 Main Street, New York' })
  address?: string;

  @ApiProperty({ type: FileUploadDto })
  image?: FileUploadDto;

  @ApiProperty({ type: [FileUploadDto] })
  documents?: FileUploadDto[];

  @ApiPropertyOptional({
    enum: EUserSkill,
    isArray: true,
    example: [EUserSkill.JAVASCRIPT, EUserSkill.REACT],
  })
  skills?: EUserSkill[];

}