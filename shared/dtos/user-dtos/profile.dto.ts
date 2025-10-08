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
} from 'class-validator';
import { EUserGender } from '../../enums/user.enum';
import { FieldOptions, FieldType } from '../../decorators/field.decorator';



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
  @FieldType("file")
  image?: any;
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

}