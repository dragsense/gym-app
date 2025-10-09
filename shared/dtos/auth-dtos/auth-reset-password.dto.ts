import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ResetPasswordDto } from '../user-dtos/reset-password.dto';

  export class ResetPasswordWithTokenDto extends OmitType(ResetPasswordDto, ['currentPassword']) {
  @ApiProperty({ example: 'reset-token-here', description: 'Reset token' })
  @IsString()
  @IsNotEmpty({ message: 'Token cannot be empty' })
  token: string;
}
