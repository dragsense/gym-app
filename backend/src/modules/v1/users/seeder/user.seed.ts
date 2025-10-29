import { UsersService } from '../users.service';
import { LoggerService } from '@/common/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '@shared/dtos';
import { EUserLevels } from '@shared/enums';

@Injectable()
export class UserSeed {
  private readonly logger = new LoggerService(UserSeed.name);
  constructor(
    private usersService: UsersService,
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
      const existingAdmin = await this.usersService.getSingle({
        email: adminConfig.email,
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
      const createUserDto: CreateUserDto = {
        email: adminConfig.email,
        password: adminConfig.password,
        isActive: true,
        level: EUserLevels.SUPER_ADMIN,
        profile: {
          firstName: adminConfig.firstName,
          lastName: adminConfig.lastName,
        },
      };

      this.logger.log(
        `Creating super admin user with email: ${adminConfig.email}`,
      );

      const result = await this.usersService.createUser(createUserDto);

      this.logger.log(
        `Super Admin user seeded successfully: ${adminConfig.email}`,
      );
      this.logger.log(`User created with ID: ${result.user.id}`);
    } catch (error: unknown) {
      this.logger.error(
        'Error seeding admin user:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }
}
