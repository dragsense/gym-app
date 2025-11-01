import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { OtpService } from './otp.service';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { TrustedDevice } from '@/modules/v1/auth/entities/trusted-device.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/common/system-user/entities/user.entity';
import { LoggerService } from '@/common/logger/logger.service';

@Injectable()
export class MfaService {
  private readonly logger = new LoggerService(MfaService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    @InjectRepository(TrustedDevice)
    private trustedDeviceRepo: Repository<TrustedDevice>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async generateEmailOtp(email: string, deviceId?: string): Promise<string> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const otp = await this.otpService.initiateLoginOtp(user, deviceId);
    await this.sendOtpEmail(email, otp);
    this.logger.log(`OTP generated and sent to ${email}`);
    return otp;
  }

  verifyOtpToken(token: string): string {
    let payload;
    try {
      payload = this.jwtService.verify(token);
      this.logger.debug(`OTP token verified successfully for ${payload.email}`);
    } catch (e) {
      this.logger.warn(`Invalid or expired OTP token`);
      throw new BadRequestException('Invalid or expired token');
    }
    return payload.email;
  }

  async verifyOtp(
    token: string,
    code: string,
    deviceId?: string,
    rememberDevice?: boolean,
    reqMeta?: { userAgent?: string; ipAddress?: string },
  ): Promise<{ isValid: boolean; email: string }> {
    const email = this.verifyOtpToken(token);

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const isValid = await this.otpService.verifyOtp(user, code);

    if (isValid) {
      this.logger.log(`OTP successfully verified for ${email}`);

      if (rememberDevice && deviceId) {
        const exists = await this.trustedDeviceRepo.findOne({
          where: { user: { id: user.id } as any, deviceId },
        });
        if (!exists) {
          await this.trustedDeviceRepo.save(
            this.trustedDeviceRepo.create({
              user,
              deviceId,
              deviceName: undefined,
              userAgent: reqMeta?.userAgent || null,
              ipAddress: reqMeta?.ipAddress || null,
            }),
          );
        }
      }
    } else {
      this.logger.warn(`Failed OTP verification for ${email}`);
    }

    return { isValid, email };
  }

  async isDeviceTrusted(userId: string, deviceId?: string): Promise<boolean> {
    if (!deviceId) return false;
    const exists = await this.trustedDeviceRepo.findOne({
      where: { user: { id: userId } as any, deviceId },
    });

    this.logger.debug(
      `Device check for user ${userId}, deviceId=${deviceId}: ${exists ? 'trusted' : 'not trusted'}`,
    );

    return !!exists;
  }

  async removeAllDevices(userId?: string): Promise<void> {
    if (!userId) return;
    await this.trustedDeviceRepo.delete({ user: { id: userId } as any });
    await this.otpService.removeAllUserOtp(userId);
  }

  private async sendOtpEmail(to: string, otp: string): Promise<void> {
    const appName = this.configService.get<string>('app.name');
    const from = this.configService.get<string>('mailer.from');

    try {
      await this.mailerService.sendMail({
        to,
        from,
        subject: `${appName} - One-Time Password (OTP)`,
        text: `Hello,

Here is your ${appName} OTP code: ${otp}

This code will expire in 5 minutes. 
If you did not request this, please ignore this email.

— ${appName} Security Team`,
        html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; background-color: #f9fafb;">
          <h2 style="color: #111827; text-align: center; margin-bottom: 20px;">${appName} Security</h2>
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Use the following One-Time Password (OTP) to complete your login:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; font-size: 24px; font-weight: bold; letter-spacing: 6px; color: #2563eb; background: #eff6ff; padding: 12px 24px; border-radius: 6px; border: 1px solid #93c5fd;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
            This code will expire in <strong>5 minutes</strong>. If you did not request this code, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            © ${new Date().getFullYear()} ${appName}. All rights reserved.
          </p>
        </div>
      `,
      });

      this.logger.log(`OTP email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${to}`, error.stack);
      throw new Error('Unable to send OTP email at this time.');
    }
  }
}
