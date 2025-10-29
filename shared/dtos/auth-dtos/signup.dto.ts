import {
  IsString,
  IsNotEmpty,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Length,
  IsEmail,
  IsOptional,
  IsIn,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { FieldOptions, FieldType } from "../../decorators/field.decorator";
import { SignupUserLevel } from "../../enums/user.enum";
import { Type } from "class-transformer";

@ValidatorConstraint({ name: "passwordMatch", async: false })
class PasswordMatchConstraint implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments) {
    const object = args.object as any;
    return confirmPassword === object.password;
  }

  defaultMessage(args: ValidationArguments) {
    return "Passwords do not match";
  }
}

export class SignupDto {
  @ApiProperty({ example: "John", description: "First name of the user" })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", true)
  firstName: string;

  @ApiProperty({ example: "Doe", description: "Last name of the user" })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", true)
  lastName: string;

  @ApiProperty({ example: "email@example.com" })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @FieldType("email", true)
  email: string;

  @ApiProperty({ example: "secrete" })
  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  @FieldType("password", true)
  password: string;

  @ApiProperty({
    example: "secrete",
    description: "Confirm password (must match password)",
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @Validate(PasswordMatchConstraint)
  @FieldType("password", true)
  confirmPassword: string;

  @ApiPropertyOptional({
    example: "abc123",
    description: "Referral code (optional)",
  })
  @IsString()
  @IsOptional()
  @FieldType("text", false)
  referralCode?: string;

  @ApiProperty({
    example: 2,
    description: "User role level - either 1 (ADMIN) or 2 (TRAINER)",
    enum: SignupUserLevel,
    enumName: "SignupUserLevel",
  })
  @IsNotEmpty()
  @FieldType("radio", true)
  @FieldOptions(
    Object.entries(SignupUserLevel)
      .filter(([key]) => isNaN(Number(key)))
      .map(([key, value]) => ({
        value: value.toString(),
        label: key,
      }))
  )
  @Type(() => Number)
  level: SignupUserLevel;
}
