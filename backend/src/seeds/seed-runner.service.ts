import { Injectable, OnModuleInit } from '@nestjs/common';
import { PaymentMethodsSeed } from '../common/payment-methods/seeder/payment-methods.seed';
import { UserSeed } from '../modules/v1/users/seeder/user.seed';
import { ResourceSeed } from '../common/roles/seeder/resource.seed';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class SeedRunnerService implements OnModuleInit {
  private readonly logger = new LoggerService(SeedRunnerService.name);
  constructor(private paymentMethdSeeder: PaymentMethodsSeed) {}

  async onModuleInit() {
    // Wait for database connection
    try {
      this.logger.log('Starting database seeding...');

      // Run payment methods seed
      await this.paymentMethdSeeder.run();

      this.logger.log('Database seeding completed successfully!');
    } catch (error: unknown) {
      this.logger.error(
        'Error during database seeding:',
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
