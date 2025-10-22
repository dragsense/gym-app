import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CrudService } from '@/common/crud/crud.service';
import { RewardPoints } from './entities/reward-points.entity';
import { ReferralLink } from '@/modules/v1/referral-links/entities/referral-link.entity';
import { ERewardType, ERewardStatus } from './enums/reward.enum';
import { EventService } from '@/common/helper/services/event.service';

@Injectable()
export class RewardsService extends CrudService<RewardPoints> {
  constructor(
    @InjectRepository(RewardPoints)
    private readonly rewardPointsRepository: Repository<RewardPoints>,
    @InjectRepository(ReferralLink)
    private readonly referralLinkRepository: Repository<ReferralLink>,
    dataSource: DataSource,
    eventService: EventService,
  ) {
    super(rewardPointsRepository, dataSource, eventService);
  }

  async processReferralSignup(referredUserId: number, referralCode: string): Promise<void> {
    // Find the referral link
    const referralLink = await this.referralLinkRepository.findOne({
      where: { referralCode },
      relations: ['createdBy'],
    });

    if (!referralLink) {
      return; // Invalid referral code, no reward
    }

    const referrer = referralLink.createdBy;

    // Calculate reward points based on referral count
    const referralCount = referralLink.referralCount + 1;
    let rewardPoints = 0;

    // Reward structure: 10 points for first referral, 15 for second, 25 for third and beyond
    if (referralCount === 1) {
      rewardPoints = 10;
    } else if (referralCount === 2) {
      rewardPoints = 15;
    } else if (referralCount >= 3) {
      rewardPoints = 25;
    }

    if (rewardPoints > 0) {
      // Create reward points record
      await this.create({
        points: rewardPoints,
        type: ERewardType.REFERRAL_BONUS,
        status: ERewardStatus.ACTIVE,
        description: `Referral bonus for bringing ${referralCount} user${referralCount > 1 ? 's' : ''}`,
        user: referrer,
        referralLink,
        referredUserId,
        isRedeemable: true,
      },
        {
          afterCreate: async (savedEntity, manager) => {
            await manager.update(ReferralLink, referralLink.id, {
              referralCount: referralCount,
              currentUses: referralLink.currentUses + 1,
            });
          }
        }
      );


    }
  }

  async getUserRewardPoints(userId: number): Promise<number> {
    const result = await this.rewardPointsRepository
      .createQueryBuilder('reward')
      .select('SUM(reward.points - reward.redeemedPoints)', 'total')
      .where('reward.userId = :userId', { userId })
      .andWhere('reward.status = :status', { status: ERewardStatus.ACTIVE })
      .getRawOne();

    return parseInt(result.total) || 0;
  }

  async getUserRewards(userId: number): Promise<RewardPoints[]> {
    return await this.rewardPointsRepository.find({
      where: { user: { id: userId } },
      relations: ['referralLink'],
      order: { createdAt: 'DESC' },
    });
  }
}
