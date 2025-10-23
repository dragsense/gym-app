// auth/token.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from '@/modules/v1/auth/entities/tokens.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from '@/common/logger/logger.service';

@Injectable()
export class TokenService {
    private readonly logger = new LoggerService(TokenService.name);

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService, 
        @InjectRepository(RefreshToken)
        private refreshTokenRepo: Repository<RefreshToken>,
    ) {}


    async generateTokens(payload: any) {
        const accessToken = await this.generateAccessToken(payload);
        const refreshToken = await this.generateRefreshToken(payload, accessToken);

        return {
            accessToken,
            refreshToken
        };
    }

    async generateAccessToken(payload: any) {
        const jwt = this.configService.get('jwt');
        const expiresIn = jwt.accessTokenExpiry;
        const expiresInSeconds = this.expiryToSeconds(expiresIn);

        return {
            token: this.jwtService.sign(payload, { expiresIn }),
            expiresIn: expiresInSeconds,
        };
    }

    async generateRefreshToken(payload: any, accessToken: any) {
        const jwt = this.configService.get('jwt');
        const expiresIn = jwt.refreshTokenExpiry;
        const expiresAt = this.expiryToDate(expiresIn);

        const refreshToken = new RefreshToken();
        refreshToken.token = this.jwtService.sign(payload, { secret: jwt.refreshSecret, expiresIn });
        refreshToken.expiresAt = expiresAt;
        refreshToken.lastToken = accessToken.token;
        refreshToken.user = { id: payload.id } as any;

        await this.refreshTokenRepo.save(refreshToken);

        return {
            token: refreshToken.token,
            expiresIn: this.expiryToSeconds(expiresIn),
        };
    }



    async refreshTokens(refreshToken: string) {
        const tokenEntity = await this.validateRefreshToken(refreshToken);
        const { user, token: currentToken } = tokenEntity;

        const now = new Date();
        const expiresSoon = (tokenEntity.expiresAt.getTime() - now.getTime()) < 1000 * 60 * 60 * 24;

        if (expiresSoon) {
            await this.revokeRefreshToken(refreshToken);
            return this.generateTokens({
                id: user.id,
                isActive: user.isActive
            });
        }


        const accessToken = await this.generateAccessToken({
            id: user.id,
            isActive: user.isActive
        });

        await this.refreshTokenRepo.update(
            { token: currentToken },
            { lastToken: accessToken.token }
        );

        const jwt = this.configService.get('jwt');

        const expiresIn = jwt.refreshTokenExpiry;

        return {
            accessToken,
            refreshToken: {
                token: currentToken,
                expiresIn: this.expiryToSeconds(expiresIn)
            }
        };
    }



    async validateRefreshToken(token: string): Promise<RefreshToken> {
        const tokenEntity = await this.refreshTokenRepo.findOne({
            where: { token },
            relations: ['user']
        });

        if (!tokenEntity || tokenEntity.revoked || tokenEntity.expiresAt < new Date()) {
            throw new BadRequestException('Invalid refresh token');
        }

        return tokenEntity;
    }


    async isTokenInvalidated(token: string): Promise<boolean> {
        const tokenEntity = await this.refreshTokenRepo.findOne({
            where: { lastToken: token }
        });

        return tokenEntity?.revoked === true;
    }

    async revokeRefreshToken(token: string): Promise<void> {
        await this.refreshTokenRepo.update(
            { token },
            { revoked: true }
        );
    }

    async invalidateAllTokens(userId: number): Promise<void> {
        await this.refreshTokenRepo.update(
            { user: { id: userId } as any },
            { revoked: true }
        );
    }

    async invalidateToken(token: string): Promise<void> {
        await this.refreshTokenRepo.update(
            { lastToken: token },
            { revoked: true }
        );
    }

    private parseExpiryString(expiry: string): { value: number; unit: string } {
        const match = expiry.match(/^(\d+)([smhdw])$/);
        if (!match) throw new Error('Invalid expiry format');
        return { value: parseInt(match[1]), unit: match[2] };
    }

    private expiryToSeconds(expiry: string): number {
        const { value, unit } = this.parseExpiryString(expiry);
        const multipliers = {
            s: 1,
            m: 60,
            h: 60 * 60,
            d: 60 * 60 * 24,
            w: 60 * 60 * 24 * 7
        };
        return value * (multipliers[unit] || 1);
    }

    private expiryToDate(expiry: string): Date {
        const seconds = this.expiryToSeconds(expiry);
        const date = new Date();
        date.setSeconds(date.getSeconds() + seconds);
        return date;
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanupExpiredTokens() {

        const jwt = this.configService.get('jwt');

        const days = jwt.refreshTokenCleanupDays || 15;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const result = await this.refreshTokenRepo
            .createQueryBuilder()
            .delete()
            .where('expiresAt < :date', { date: cutoffDate })
            .orWhere('revoked = true')
            .execute();

        this.logger.log(`Cleaned up ${result.affected} expired/revoked tokens`);
    }
}