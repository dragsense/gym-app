import { Injectable, Logger } from '@nestjs/common';


import { UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
@UseInterceptors(CacheInterceptor)
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor() { }

  getAppInfo() {
    return {
      "name": "PaybackBilling",
      "description": "Provides APIs for authentication, customer management, billing, payments, and notifications in a fitness-focused web platform.",
      "version": "1.0.0",
      "documentation": "/api/docs"
    };
  }

}