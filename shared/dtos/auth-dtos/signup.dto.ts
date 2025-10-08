import { IsString, IsNotEmpty, MinLength, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, Length, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'passwordMatch', async: false })
class PasswordMatchConstraint implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments) {
    const object = args.object as any;
    return confirmPassword === object.password;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Passwords do not match';
  }
}

export class SignupDto {

  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'email@example.com' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secrete' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  password: string;

  @ApiProperty({
    example: 'secrete',
    description: 'Confirm password (must match password)',
    minLength: 8
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Validate(PasswordMatchConstraint)
  confirmPassword: string;
}
