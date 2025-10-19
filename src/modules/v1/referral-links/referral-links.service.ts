import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CrudService } from '@/common/crud/crud.service';
import { ReferralLink } from './entities/referral-link.entity';
import { CreateReferralLinkDto, UpdateReferralLinkDto, ReferralLinkListDto } from 'shared/dtos/referral-link-dtos';
import { User } from '@/modules/v1/users/entities/user.entity';
import { EReferralLinkStatus } from 'shared/enums/referral-link.enum';
import { EventService } from '@/common/helper/services/event.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReferralLinksService extends CrudService<ReferralLink> {
  constructor(
    @InjectRepository(ReferralLink)
    private readonly referralLinkRepository: Repository<ReferralLink>,
    private readonly usersService: UsersService,
    dataSource: DataSource,
    eventService: EventService,
  ) {
    super(referralLinkRepository, dataSource, eventService);
  }

  async createReferralLink(createReferralLinkDto: CreateReferralLinkDto, userId: number): Promise<ReferralLink> {
    // Get user who created the link
    const createdBy = await this.usersService.getSingle(userId);


    if (!createdBy) {
      throw new Error('User not found');
    }

    // Generate unique referral code
    const referralCode = await this.generateUniqueReferralCode();

    // Generate referral link URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const linkUrl = `${baseUrl}/signup?ref=${referralCode}`;

    // Create referral link
    return this.create({
      ...createReferralLinkDto,
      referralCode,
      linkUrl,
      createdBy: { id: createdBy.id },
      status: EReferralLinkStatus.ACTIVE,
      referralCount: 0,
      currentUses: 0,
    });
  }

  private async generateUniqueReferralCode(): Promise<string> {
    let referralCode: string = '';
    let isUnique = false;

    while (!isUnique) {
      // Generate a random 8-character code
      referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      // Check if code already exists
      const existingLink = await this.getSingle({
        referralCode,
      });

      if (!existingLink) {
        isUnique = true;
      }
    }

    return referralCode;
  }

  async updateReferralLink(id: number, updateReferralLinkDto: UpdateReferralLinkDto): Promise<ReferralLink> {
    return this.update(id, updateReferralLinkDto);
  }

}
