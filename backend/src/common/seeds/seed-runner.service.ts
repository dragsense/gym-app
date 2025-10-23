import { Injectable, OnModuleInit } from '@nestjs/common';
import { PaymentMethodsSeed } from '../payment-methods/seeder/payment-methods.seed';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class SeedRunnerService implements OnModuleInit {
  private readonly logger = new LoggerService(SeedRunnerService.name);
  constructor(private paymentMethdSeeder: PaymentMethodsSeed) { }

  async onModuleInit() {
    // Wait for database connection    
    try {
      this.logger.log('Starting database seeding...');

      // Run payment methods seed
      await this.paymentMethdSeeder.run();

      this.logger.log('Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('Error during database seeding:', error);
    }
  }
}
