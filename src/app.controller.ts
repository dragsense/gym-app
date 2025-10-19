import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get API information' })
  @ApiResponse({
    status: 200,
    description: 'API information retrieved successfully',
    schema: {},
  })
  getAppInfo() {
    return this.appService.getAppInfo();
  }

  @Get('csrf-token')
  @ApiOperation({ summary: 'Get CSRF token' })
  getCsrfToken(@Res({ passthrough: true }) res: Response) {
    const cookieSecret = this.configService.get<string>('app.cookieSecret');

    const token = crypto.randomBytes(24).toString('hex');

    res.cookie('csrfToken', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      signed: !!cookieSecret,
    });

    return { csrfToken: token };
  }
}
