import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResetPasswordDto } from '../user-dtos/reset-password.dto';
import { OmitType, createOmitType } from '../../lib/type-utils';

  export class ResetPasswordWithTokenDto extends createOmitType(ResetPasswordDto, ['currentPassword']) {
  @ApiProperty({ example: 'reset-token-here', description: 'Reset token' })
  @IsString()
  @IsNotEmpty({ message: 'Token cannot be empty' })
  token: string;
}
