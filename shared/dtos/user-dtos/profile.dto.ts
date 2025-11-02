import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PartialType } from "../../lib/dto-type-adapter";
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
} from "class-validator";
import { EUserGender } from "../../enums/user.enum";
import { FieldOptions, FieldType } from "../../decorators/field.decorator";
import { FileUploadDto } from "../file-upload-dtos";

export class CreateProfileDto {
  @ApiProperty({ example: "+1234567890" })
  @IsNotEmpty()
  @IsString()
  @FieldType("text", true)
  phoneNumber?: string;

  @ApiProperty({ example: "123 Main Street, New York" })
  @IsOptional()
  @IsString()
  @FieldType("text")
  address?: string;

  @ApiPropertyOptional({
    type: "string",
    format: "binary",
    required: false,
    description: "Image file",
  })
  @IsOptional()
  @FieldType("custom")
  image?: any;

  @ApiPropertyOptional({
    type: "array",
    items: { type: "string", format: "binary" },
    required: false,
    description: "Document files (max 10)",
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @FieldType("custom")
  documents?: any[];
}

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}

export class ProfileDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string;

  @ApiProperty({ example: "John" })
  firstName: string;

  @ApiProperty({ example: "Doe" })
  lastName: string;

  @ApiProperty({ example: "+1234567890" })
  phoneNumber?: string;

  @ApiProperty({ example: "1990-01-01" })
  dateOfBirth?: string;

  @ApiProperty({ enum: EUserGender, example: EUserGender.MALE })
  gender?: EUserGender;

  @ApiProperty({ example: "123 Main Street, New York" })
  address?: string;

  @ApiProperty({ type: FileUploadDto })
  image?: FileUploadDto;

  @ApiProperty({ type: [FileUploadDto] })
  documents?: FileUploadDto[];
}
