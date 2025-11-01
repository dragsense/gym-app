import { LoggerService } from '@/common/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SystemUsersService } from '../system-users.service';

@Injectable()
export class UserSeed {
  private readonly logger = new LoggerService(UserSeed.name);
  constructor(
    private readonly systemUsersService: SystemUsersService,
    private configService: ConfigService,
  ) {}

  async run(): Promise<void> {
    const adminConfig = this.configService.get('superAdmin') as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    };

    if (!adminConfig) {
      this.logger.warn(
        'Super admin configuration not found, skipping user seed...',
      );
      return;
    }

    try {
      // Check if admin user already exists
      const existingAdmin = await this.systemUsersService.getSingle({
        level: 0,
      });

      if (existingAdmin) {
        this.logger.log(
          `Admin user already exists: ${adminConfig.email}, skipping seed...`,
        );
        return;
      }
    } catch {
      // User doesn't exist, continue with creation
      this.logger.log('Admin user not found, proceeding with creation...');
    }

    try {
      // Create admin user using user service
      const createUserDto = {
        email: adminConfig.email,
        password: adminConfig.password,
        isActive: true,
        level: 0,
      };

      this.logger.log(
        `Creating super admin user with email: ${adminConfig.email}`,
      );

      const user = await this.systemUsersService.create(createUserDto);

      this.logger.log(
        `Super Admin user seeded successfully: ${adminConfig.email}`,
      );
      this.logger.log(`User created with ID: ${user?.id}`);
    } catch (error: unknown) {
      this.logger.error(
        'Error seeding admin user:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }
}
