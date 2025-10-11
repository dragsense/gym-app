import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  HttpStatus,
  UnauthorizedException,
  Param,
  UseGuards,
  Req,
  Headers,
  HttpException,
} from '@nestjs/common';

import { Response } from 'express';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';

import { LoginDto, LoginResponseDto, SignupDto, ForgotPasswordDto, ResetPasswordWithTokenDto,
  RefreshTokenResponseDto,
  VerifyOtpDto,
  MessageResponseDto } from 'shared/dtos';



import { AuthService } from './auth.service';
import { JwtAuthGuard, JwtRefreshAuthGuard } from '@/guards/jwt-auth.gaurd';
import { TokenService } from './services/tokens.service';
import { MfaService } from './services/mfa-device.service';
import { UsersService } from '../users/users.service';
import { ActivityLogsService } from '@/common/activity-logs/activity-logs.service';
import { EActivityType, EActivityStatus } from 'shared/enums/activity-log.enum';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly mfaService: MfaService,
    private readonly userService: UsersService,
    private readonly activityLogsService: ActivityLogsService,
  ) { }

  @ApiOperation({
    summary: 'User login',
    description: 'Logs in a user and send OTP code',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: LoginResponseDto
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const { email, password, deviceId } = loginDto;

    const { user, token } = await this.authService.validateUser(
      email,
      password
    );

    const trusted = await this.mfaService.isDeviceTrusted(user.id, deviceId);

    if (trusted) {
      const { accessToken, refreshToken } = await this.tokenService.generateTokens({
        id: user.id,
        tokenVersion: user.tokenVersion,
        isActive: user.isActive
      });

      if (!accessToken || !refreshToken) {
        throw new UnauthorizedException('Invalid credentials');
      }

      res.cookie('refresh_token', refreshToken.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: refreshToken.expiresIn * 1000,
      });

      res.setHeader('Authorization', `Bearer ${accessToken.token}`);

      return res.status(HttpStatus.OK).json({ accessToken, message: 'Logged in successfully', requiredOtp: false });
    }

    await this.mfaService.generateEmailOtp(user.email, deviceId);

    return res.status(HttpStatus.OK).json({
      token,
      requiredOtp: true,
      message: 'OTP sent successfully',
    });


  }


  @ApiOperation({
    summary: 'Refresh tokens',
    description: 'Generates new access and refresh tokens using a valid refresh token',
  })
  @ApiBody({ type: RefreshTokenResponseDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens refreshed successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired refresh token',
  })
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  async refreshTokens(
    @Req() req: any,
    @Res() res: Response,
  ) {
    const { refreshToken: oldRefreshToken } = req.user;

    if (!oldRefreshToken) throw new UnauthorizedException('Invalid token');

    const { accessToken, refreshToken } = await this.tokenService.refreshTokens(oldRefreshToken);

    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException('Invalid credentials');
    }

    res.cookie('refresh_token', refreshToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: refreshToken.expiresIn * 1000,
    });

    res.setHeader('Authorization', `Bearer ${accessToken.token}`);

    return res.status(HttpStatus.OK).json({ accessToken, refreshToken, message: 'Logged in successfully' });
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({
    status: 204,
    description: 'User registered successfully.',
    type: MessageResponseDto
  })
  @ApiResponse({ status: 409, description: 'The email is already taken' })
  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }


  @ApiOperation({
    summary: 'User logout',
    description: 'Logs out the user by clearing the authentication cookie',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout successful',
    type: MessageResponseDto
  })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any, @Res() res: Response) {
    const token = req.user.token;
    const userId = req.user.id;
    const userEmail = req.user.email;

    try {
      await this.tokenService.invalidateToken(token);
    } catch (err) {
      // Log failed logout activity
      await this.activityLogsService.create({
        description: `Failed to logout user: ${userEmail}`,
        type: EActivityType.LOGOUT,
        status: EActivityStatus.FAILED,
        endpoint: '/api/auth/logout',
        method: 'POST',
        statusCode: 500,
        metadata: {
          email: userEmail,
          userId,
          timestamp: new Date().toISOString(),
        },
        errorMessage: err.message,
        userId,
      });
    }

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.setHeader('Authorization', '');

    // Log successful logout activity
    await this.activityLogsService.create({
      description: `User logged out successfully: ${userEmail}`,
      type: EActivityType.LOGOUT,
      status: EActivityStatus.SUCCESS,
      endpoint: '/api/auth/logout',
      method: 'POST',
      statusCode: 200,
      metadata: {
        email: userEmail,
        userId,
        timestamp: new Date().toISOString(),
      },
      userId,
    });

    return res.status(HttpStatus.OK).json({ message: 'Logged out successful' });
  }

  @ApiOperation({ summary: 'Logout from all devices' })
  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAll(@Req() req: any, @Res() res: Response) {

    const userId = req.user.id;
    try {
      await this.tokenService.invalidateAllTokens(userId);
      await this.mfaService.removeAllDevices(userId);
    } catch (err) {
    }

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.setHeader('Authorization', '');
    return res.status(HttpStatus.OK).json({ message: 'Logged out from all devices' });
  }


  @Post('send-reset-link')
  @ApiOperation({ summary: 'Request password reset link via email' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'If an account with this email exists, a reset link has been sent',
    type: MessageResponseDto
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.sendResetLink(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using reset token from email' })
  @ApiBody({ type: ResetPasswordWithTokenDto })
  @ApiResponse({
    status: 200, description: 'Password reset successfully',
    type: MessageResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async setNewPassword(@Body() resetDto: ResetPasswordWithTokenDto) {
    return this.authService.resetPassword(resetDto);
  }


  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP code' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({ status: 200, description: 'OTP verified successfully', type: MessageResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto, @Res() res: Response) {

    const { token, code, deviceId, rememberDevice } = dto;

    const { isValid, email } = await this.mfaService.verifyOtp(token, code, deviceId, rememberDevice,
      {
        userAgent: (res.req as any)?.headers?.['user-agent'],
        ipAddress: (res.req as any)?.ip,
      }
    );

    if (!isValid) {
      throw new HttpException('Invalid OTP', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.userService.findOne({ email: email });

    const { accessToken, refreshToken } = await this.tokenService.generateTokens({
      id: user.id,
      isActive: user.isActive
    });

    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException('Invalid credentials');
    }

    res.cookie('refresh_token', refreshToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: refreshToken.expiresIn * 1000,
    });

    res.setHeader('Authorization', `Bearer ${accessToken.token}`);

    return res.status(HttpStatus.OK).json({ accessToken, message: 'Logged in successfully' });
  }



  @ApiOperation({
    summary: 'Resend OTP',
    description: 'Resends an OTP code to the user email if still valid, otherwise generates a new one',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
      required: ['token'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OTP resent or newly generated',
  })
  @Post('resend-otp')
  async resendOtp(@Body() dto: { token: string, deviceId?: string }) {

    const { token, deviceId } = dto;

    const email = this.mfaService.verifyOtpToken(token);

    await this.mfaService.generateEmailOtp(email, deviceId);
    return { message: 'New OTP generated and sent successfully' };
  }
}
