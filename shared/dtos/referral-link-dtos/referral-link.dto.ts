import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  ValidateNested,
  Min,
  IsEnum,
  IsArray,
  ValidateIf,
  ArrayMinSize,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { PaginationMetaDto } from '../common/pagination.dto';
import { ListQueryDto, SingleQueryDto } from '../common/list-query.dto';
import { FieldType, FieldOptions } from '../../decorators/field.decorator';
import { OmitType } from '../../lib/dto-type-adapter';
import { UserDto } from '../user-dtos';
import {
  Like,
  Equals,
  DateRange,
} from '../../decorators/crud.dto.decorators';
import { EReferralLinkStatus, EReferralLinkType } from '../../enums/referral-link.enum';
import { IReferralLink } from '../../interfaces/referral-link.interface';

export class CreateReferralLinkDto {
  @ApiProperty({ example: 'My Referral Link', description: 'Referral link title' })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", true)
  title: string;

  @ApiProperty({ example: 'CLIENT', description: 'Referral link type', enum: EReferralLinkType })
  @IsEnum(EReferralLinkType)
  @IsNotEmpty()
  @FieldType("select", true)
  @FieldOptions(Object.values(EReferralLinkType).map(v => ({ value: v, label: v.charAt(0) + v.slice(1).toLowerCase() })))
  type: EReferralLinkType;

  @ApiPropertyOptional({ example: 'Share this link to get referrals', description: 'Referral link description' })
  @IsString()
  @IsOptional()
  @FieldType("textarea", false)
  description?: string;

  @ApiProperty({ example: 10, description: 'Commission percentage for referrals' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @FieldType("number", true)
  @Type(() => Number)
  commissionPercentage: number;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z', description: 'Link expiration date' })
  @IsDateString()
  @IsOptional()
  @FieldType("datetime", false)
  expiresAt?: string;

  @ApiPropertyOptional({ example: 100, description: 'Maximum number of uses allowed' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @FieldType("number", false)
  @Type(() => Number)
  maxUses?: number;
}

export class UpdateReferralLinkDto extends PartialType(OmitType(CreateReferralLinkDto, [])) { }

export class ReferralLinkListDto extends ListQueryDto<IReferralLink> {
  @Like()
  @FieldType('text', false)
  title?: string;

  @Equals()
  @FieldType('select', false)
  @FieldOptions(Object.values(EReferralLinkStatus).map(v => ({ value: v, label: v })))
  status?: EReferralLinkStatus;

  @Equals()
  @FieldType('select', false)
  @FieldOptions(Object.values(EReferralLinkType).map(v => ({ value: v, label: v })))
  type?: EReferralLinkType;
  
  @DateRange()
  @FieldType('date', false)
  expiresAt?: string;
}

export class ReferralLinkDto {
  @ApiProperty({ example: 1, description: 'Referral link ID' })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @FieldType("number", true)
  @Min(1)
  id: number;

  @ApiProperty({ example: 'My Referral Link', description: 'Referral link title' })
  @IsOptional()
  @IsString()
  title: string;

  @ApiProperty({ example: 'https://myapp.com/ref/abc123', description: 'Referral link URL' })
  @IsOptional()
  @IsString()
  linkUrl: string;

  @ApiProperty({ example: 'abc123', description: 'Unique referral code' })
  @IsOptional()
  @IsString()
  referralCode: string;

  @ApiProperty({ example: 'ACTIVE', description: 'Referral link status' })
  @IsOptional()
  status: EReferralLinkStatus;

  @ApiProperty({ example: 'CLIENT', description: 'Referral link type' })
  @IsOptional()
  type: EReferralLinkType;

  @ApiPropertyOptional({ example: 'Share this link to get referrals', description: 'Referral link description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 10, description: 'Commission percentage for referrals' })
  @IsOptional()
  @IsNumber()
  commissionPercentage?: number;

  @ApiProperty({ example: 0, description: 'Number of clicks on this link' })
  @IsOptional()
  @IsNumber()
  clickCount?: number;

  @ApiProperty({ example: 0, description: 'Number of successful referrals from this link' })
  @IsOptional()
  @IsNumber()
  referralCount?: number;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z', description: 'Link expiration date' })
  @IsOptional()
  expiresAt?: string;

  @ApiPropertyOptional({ example: 100, description: 'Maximum number of uses allowed' })
  @IsOptional()
  @IsNumber()
  maxUses?: number;

  @ApiProperty({ example: 0, description: 'Current number of uses' })
  @IsOptional()
  @IsNumber()
  currentUses?: number;

  @ApiProperty({ type: UserDto })
  @ValidateNested()
  @Type(() => UserDto)
  createdBy: UserDto;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}

export class ReferralLinkPaginatedDto {
  @ApiProperty({ type: [ReferralLinkDto] })
  data: ReferralLinkDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}