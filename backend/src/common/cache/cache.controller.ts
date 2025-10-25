import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@ApiTags('Cache')
@Controller('cache')
export class CacheController {
  constructor(private readonly configService: ConfigService) {}

  @Get('monitor-url')
  @ApiOperation({ summary: 'Get Dragonfly cache monitor URL' })
  @ApiResponse({
    status: 200,
    description: 'Cache monitor URL retrieved successfully',
  })
  getCacheMonitorUrl() {
    const cacheConfig = this.configService.get('cache');
    const host = 'localhost';
    const port = 6380;
    const dragonflyUrl = `http://${host}:${port}/`;

    return {
      url: dragonflyUrl,
      name: 'Dragonfly Cache Monitor',
      description: 'Monitor Dragonfly cache in real-time',
    };
  }
}
