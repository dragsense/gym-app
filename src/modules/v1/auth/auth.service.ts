import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

import { IMessageResponse } from 'shared/interfaces';
import { ResetPasswordWithTokenDto, SignupDto } from 'shared/dtos';
import { UsersService } from '../users/users.service';
import { LoggerService } from '@/common/logger/logger.service';

@Injectable()
export class AuthService {
  private readonly logger = new LoggerService(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly userService: UsersService,
  ) {}

  async signup(
    signupDto: SignupDto,
  ): Promise<IMessageResponse> {

    const {firstName, lastName, ...userData} = signupDto;

    const res = await this.userService.create({
      ...userData,
      isActive: true,
      profile: {
        firstName,
        lastName,
      }
    });

    return { message: 'Registration successful' };
  }


  async validateUser(
    email: string,
    clientPassword: string,
  ): Promise<any> {

    const user = await this.userService.findOne(
      { email },
      {
        select: ['id', 'email', 'password', 'isActive'],
        relations: ['profile']
      });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(clientPassword, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }


    const token = this.jwtService.sign(
      {
        email: user.email,
        purpose: 'otp',
      },
      {
        expiresIn: '1d',
      }
    );

    const { password, ...userWithoutPassword } = user;


    return { token, user: userWithoutPassword };
  }

  async sendResetLink(email: string): Promise<{ message: string }> {
    const user = await this.userService.findOne({ email }, { select: ['id', 'email'], relations: ['profile'] });

    if (user) {

      const appConfig = this.configService.get('app');

      const token = this.jwtService.sign(
        {
          id: user.id,
          purpose: 'password_reset',
        },
      );

      const appUrl = appConfig.appUrl;
      const appName = appConfig.name;
      const resetPasswordPath = appConfig.passwordResetPath;
      const resetUrl = `${appUrl}/${resetPasswordPath}?token=${token}`;

      const emailContent = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Password Reset Request</h2>
        
        <p>Dear ${user.profile?.firstName || 'User'},</p>
        
        <p>We received a request to reset your password for account <strong>${user.email}</strong>.</p>
        
        <p style="text-align: center; margin: 25px 0;">
          <a href="${resetUrl}" 
             style="background-color: #3498db; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;
                    display: inline-block;">
            Reset Your Password
          </a>
        </p>
        
        <p style="font-size: 0.9em; color: #7f8c8d;">
          This link will expire in 15 minutes. If you didn't request this, 
          please ignore this email or contact support if you have concerns.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 20px 0;">
        
        <p style="font-size: 0.8em; color: #7f8c8d;">
          Can't click the button? Copy this link to your browser:<br>
          <a href="${resetUrl}" style="word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
    `;

      const mailerConfig = this.configService.get('mailer');


      try {
        await this.mailerService.sendMail({
          to: user.email,
          from: mailerConfig.from,
          subject: appName + ' - Your Password Reset Instructions',
          html: emailContent,

          text: `Please use the following link to reset your password:\n\n${resetUrl}\n\nThis link expires in 15 minutes.`,
        });

      } catch (error) {
        this.logger.error('Error sending reset email', error.stack);
        throw new HttpException(
          'Failed to send reset email. Please try again later.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return {
      message:
        'If an account with this email exists, a reset link has been sent',
    };
  }

  async resetPassword(
    resetDta: ResetPasswordWithTokenDto,
  ): Promise<{ message: string }> {
    const { token, password, confirmPassword } = resetDta;

    let payload;
    try {
      payload = this.jwtService.verify(token);
    } catch (e) {
      throw new BadRequestException('Invalid or expired token');
    }

    return await this.userService.resetPassword(payload.id, { password, confirmPassword }, true);

  }



}
