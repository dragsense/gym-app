import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users.service';
import { CreateUserDto } from 'shared';
import { EUserLevels, EUserRole } from 'shared';

@Injectable()
export class UserSeeder implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    // Only run seeders in development
    if (this.configService.get('NODE_ENV') === 'development') {
      await this.seed();
    }
  }

  async seed(): Promise<void> {
    const adminConfig = this.configService.get('superAdmin');
    
    try {
      // Check if admin user already exists
      const existingAdmin = await this.usersService.getSingle({ email: adminConfig.email });
      
      if (existingAdmin) {
        console.log('Admin user already exists, skipping seed...');
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
          lastName: adminConfig.lastName
        }
      };

      console.log('Creating super admin user...', adminConfig);


       await this.usersService.createUser(createUserDto);

      console.log('Super Admin user seeded successfully:', adminConfig.email);
    } catch (error) {
      console.error('Error seeding admin user:', error);
    }
  }
}
