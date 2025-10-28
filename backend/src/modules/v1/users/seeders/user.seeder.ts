import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users.service';
import { CreateUserDto } from '@shared/dtos';
import { EUserLevels, EUserRole } from '@shared/enums';
import { LoggerService } from '@/common/logger/logger.service';

@Injectable()
export class UserSeeder implements OnModuleInit {
  private readonly logger = new LoggerService(UserSeeder.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed(): Promise<void> {
    const adminConfig = this.configService.get('superAdmin');

    if (!adminConfig) {
      this.logger.error(
        'Super admin configuration not found, skipping seed...',
      );
      return;
    }

    try {
      // Check if admin user already exists
      const existingAdmin = await this.usersService.getSingle({
        email: adminConfig.email,
      });

      if (existingAdmin) {
        this.logger.error('Admin user already exists, skipping seed...');
        return;
      }
    } catch (error) {
      // User doesn't exist, continue with creation
    }

    try {
      // Create admin user using user service
      const createUserDto: CreateUserDto = {
        email: adminConfig.email,
        password: adminConfig.password,
        isActive: true,
        level: EUserLevels[EUserRole.SUPER_ADMIN], // Set level directly in creation
        profile: {
          firstName: adminConfig.firstName,
          lastName: adminConfig.lastName,
        },
      };

      this.logger.log('Creating super admin user... ' + adminConfig);

      await this.usersService.createUser(createUserDto);

      this.logger.log(
        'Super Admin user seeded successfully: ' + adminConfig.email,
      );
    } catch (error) {
      this.logger.error('Error seeding admin user: ' + error);
    }
  }
}
