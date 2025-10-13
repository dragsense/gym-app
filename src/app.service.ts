import { Injectable } from '@nestjs/common';
import { LoggerService } from '@/common/logger/logger.service';

@Injectable()
export class AppService {
  private readonly logger = new LoggerService(AppService.name);

  constructor() { }

  getAppInfo() {

    this.logger.log('Getting app info');
    
    return {
      "name": "PaybackBilling",
      "description": "Provides APIs for authentication, customer management, billing, payments, and notifications in a fitness-focused web platform.",
      "version": "1.0.0",
      "documentation": "/api/docs"
    };
  }

}