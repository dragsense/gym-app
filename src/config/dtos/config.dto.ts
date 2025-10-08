import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
}

export class EnvironmentVariables {
  // Application
  @IsString()
  APP_NAME: string;

  @IsString()
  APP_URL: string;

  @IsString()
  HOST: string;

  @IsNumber()
  PORT: number;

  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsString()
  @IsOptional()
  APP_LOGIN_PATH: string;

  @IsString()
  @IsOptional()
  APP_PASSWORD_RESET_PATH: string;

  // Database
  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_USER: string;

  @IsString()
  DB_PASS: string;

  @IsString()
  DB_NAME: string;

  @IsBoolean()
  TYPEORM_SYNCHRONIZE: boolean;

  @IsBoolean()
  TYPEORM_LOGGING: boolean;

  // DB Pool
  @IsNumber()
  @IsOptional()
  DB_POOL_SIZE: number;

  @IsNumber()
  @IsOptional()
  DB_POOL_MAX: number;

  @IsNumber()
  @IsOptional()
  DB_POOL_MIN: number;

  @IsNumber()
  @IsOptional()
  DB_POOL_IDLE: number;

  @IsNumber()
  @IsOptional()
  DB_POOL_CONN_TIMEOUT: number;



  // JWT
  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsOptional()
  ACCESS_TOKEN_EXPIRY: string;

  @IsString()
  @IsOptional()
  REFRESH_TOKEN_EXPIRY: string;

  @IsNumber()
  @IsOptional()
  REFRESH_TOKEN_CLEANUP_DAYS: number;


  // Mailer
  @IsString()
  MAIL_HOST: string;

  @IsNumber()
  MAIL_PORT: number;

  @IsOptional()
  @IsString()
  MAIL_USER: string;

  @IsOptional()
  @IsString()
  MAIL_PASS: string;

  @IsString()
  MAIL_FROM: string;


  // Encryption
  @IsString()
  @IsOptional()
  ENCRYPTION_KEY: string;


  // OTP
  @IsString()
  @IsOptional()
  OTP_SECRET: string;


  // Cookie
  @IsString()
  @IsOptional()
  COOKIE_SECRET: string;

  // Cors
  @IsString()
  @IsOptional()
  CORS_ORIGINS: string;

  // API Prefix
  @IsString()
  @IsOptional()
  API_PREFIX: string;
}
