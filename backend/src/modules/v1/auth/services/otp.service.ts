import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpCode } from '@/modules/v1/auth/entities/otp-code.entity';
import { LessThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/modules/v1/users/entities/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from '@/common/logger/logger.service';

@Injectable()
export class OtpService {
  private readonly logger = new LoggerService(OtpService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(OtpCode)
    private otpRepo: Repository<OtpCode>,
  ) {}

  async initiateLoginOtp(user: User, deviceId?: string): Promise<string> {
    // generate a random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await this.otpRepo.save(
      this.otpRepo.create({
        user,
        code,
        purpose: 'login',
        deviceId: deviceId || null,
        expiresAt,
      }),
    );

    this.logger.log(
      `OTP generated for user ${user.email}, expires at ${expiresAt}`,
    );

    return code;
  }

  async verifyOtp(user: User, code: string): Promise<boolean> {
    const record = await this.otpRepo.findOne({
      where: {
        user: { id: user.id } as any,
        code,
        purpose: 'login',
        isUsed: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!record || record.expiresAt < new Date()) {
      this.logger.warn(`Failed OTP verification for user ${user.email}`);
      throw new BadRequestException('Failed OTP verification');
    }

    record.isUsed = true;
    await this.otpRepo.save(record);

    this.logger.log(`OTP verified successfully for user ${user.email}`);
    return true;
  }

  async removeAllUserOtp(userId?: string): Promise<void> {
    if (!userId) return;
    await this.otpRepo.delete({ user: { id: userId } as any });
  }

  async cleanupExpiredOtps() {
    const result = await this.otpRepo.delete([
      { isUsed: true },
      { expiresAt: LessThan(new Date()) },
    ]);

    this.logger.debug(
      `Cleanup removed ${result.affected} OTP(s) at ${new Date().toISOString()}`,
    );
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('Running OTP cleanup job...');
    await this.cleanupExpiredOtps();
  }
}
