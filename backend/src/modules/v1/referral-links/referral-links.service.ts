import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CrudService } from '@/common/crud/crud.service';
import { ReferralLink } from './entities/referral-link.entity';
import { CreateReferralLinkDto, UpdateReferralLinkDto } from '@shared/dtos';
import { EReferralLinkStatus } from '@shared/enums/referral-link.enum';
import { EventService } from '@/common/helper/services/event.service';

@Injectable()
export class ReferralLinksService extends CrudService<ReferralLink> {
  constructor(
    @InjectRepository(ReferralLink)
    private readonly referralLinkRepository: Repository<ReferralLink>,
    dataSource: DataSource,
    eventService: EventService,
    
  ) {
    super(referralLinkRepository, dataSource, eventService);
  }

  async createReferralLink(
    createReferralLinkDto: CreateReferralLinkDto,
  ): Promise<ReferralLink> {
    // Get user who created the link
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

      try {
        // Check if code already exists
        await this.getSingle({
          referralCode,
        });
      } catch (error: unknown) {
        if (error instanceof NotFoundException) isUnique = true;
        else
          throw new Error('Failed to generate unique referral code', {
            cause: error,
          });
      }
    }

    return referralCode;
  }

  async updateReferralLink(
    id: string,
    updateReferralLinkDto: UpdateReferralLinkDto,
  ): Promise<ReferralLink> {
    return this.update(id, updateReferralLinkDto);
  }
}
