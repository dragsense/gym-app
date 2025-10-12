import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CacheService } from './cache.service';

@ApiTags('Cache')
@Controller('cache')
export class CacheController {
  private readonly logger = new Logger(CacheController.name);

  constructor(private readonly cacheService: CacheService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get cache statistics' })
  @ApiResponse({ status: 200, description: 'Cache statistics retrieved successfully' })
  getCacheStats() {
    return {
      stats: this.cacheService.getStats(),
      hitRatio: this.cacheService.getHitRatio(),
    };
  }

  @Delete('clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear all cache' })
  @ApiResponse({ status: 200, description: 'All cache cleared successfully' })
  async clearAllCache() {
    this.logger.log('Clearing all cache');
    await this.cacheService.clear();
    return { message: 'Cache cleared successfully' };
  }


}
