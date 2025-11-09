import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository, In } from 'typeorm';
import { User } from '@/common/base-user/entities/user.entity';
import { Session } from '@/modules/v1/sessions/entities/session.entity';
import { Billing } from '@/modules/v1/billings/entities/billing.entity';
import { ReferralLink } from '@/modules/v1/referral-links/entities/referral-link.entity';
import { TrainerClient } from '@/modules/v1/trainer-clients/entities/trainer-client.entity';
import { Trainer } from '@/modules/v1/trainers/entities/trainer.entity';
import { Client } from '@/modules/v1/clients/entities/client.entity';

import { EUserLevels } from '@shared/enums';
import { DashboardAnalyticsDto } from '@shared/dtos';
import {
  EAnalyticsPeriod,
  ESessionStatus,
  EBillingStatus,
} from '@shared/enums';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(Billing)
    private readonly billingRepository: Repository<Billing>,
    @InjectRepository(ReferralLink)
    private readonly referralLinkRepository: Repository<ReferralLink>,
    @InjectRepository(TrainerClient)
    private readonly trainerClientRepository: Repository<TrainerClient>,
    @InjectRepository(Trainer)
    private readonly trainerRepository: Repository<Trainer>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async getDashboardStats(user: User, query: DashboardAnalyticsDto) {
    const { period, from, to } = query;
    // Resolve date range
    const start = from
      ? new Date(from)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago
    const end = to ? new Date(to) : new Date();

    const isSuperAdmin = user.level === EUserLevels.SUPER_ADMIN;
    const isAdmin = user.level === EUserLevels.ADMIN;
    const isTrainer = user.level === EUserLevels.TRAINER;
    const isClient = user.level === EUserLevels.CLIENT;

    const dateFilter = { createdAt: Between(start, end) };

    // Get trainer entity if user is a trainer
    let trainerEntity: Trainer | null = null;
    let trainerId: string | null = null;
    if (isTrainer) {
      trainerEntity = await this.trainerRepository.findOne({
        where: { user: { id: user.id } },
      });
      trainerId = trainerEntity?.id || null;
    }

    // Get client IDs for trainer
    let trainerClientIds: string[] = [];
    if (isTrainer && trainerId) {
      const trainerClients = await this.trainerClientRepository.find({
        where: { trainerId },
        relations: ['client'],
      });
      trainerClientIds = trainerClients.map((tc) => tc.clientId);
    }

    // Get all trainer IDs created by admin
    let adminTrainerIds: string[] = [];
    if (isAdmin) {
      const adminTrainers = await this.trainerRepository.find({
        where: { createdByUserId: user.id },
      });
      adminTrainerIds = adminTrainers.map((t) => t.id);

      // Get all clients of admin's trainers
      if (adminTrainerIds.length > 0) {
        const adminTrainerClients = await this.trainerClientRepository.find({
          where: { trainerId: In(adminTrainerIds) },
          relations: ['client'],
        });
        trainerClientIds = adminTrainerClients.map((tc) => tc.clientId);
      }
    }

    // Get client entity if user is a client
    let clientEntity: Client | null = null;
    let clientUserId: string | null = null;
    if (isClient) {
      clientEntity = await this.clientRepository.findOne({
        where: { user: { id: user.id } },
      });
      clientUserId = user.id;
    }

    // Build queries based on role
    const [
      totalAdmins,
      totalUsers,
      totalTrainers,
      totalClients,
      totalActiveTrainers,
      totalActiveClients,
      totalSessions,
      totalBillings,
      activeSessions,
      pendingBillings,
      completedSessions,
      paidBillings,
      totalReferralLinks,
      activeReferralLinks,
      totalReferralCount,
      totalReferralUses,
    ] = await Promise.all([
      // Admins (super admin only)
      isSuperAdmin
        ? this.userRepository.count({
            where: { level: EUserLevels.ADMIN, ...dateFilter },
          })
        : Promise.resolve(0),

      // Users (admin and super admin)
      isSuperAdmin || isAdmin
        ? this.userRepository.count({
            where: { level: EUserLevels.USER, ...dateFilter },
          })
        : Promise.resolve(0),

      // Trainers
      isSuperAdmin
        ? this.userRepository.count({
            where: { level: EUserLevels.TRAINER, ...dateFilter },
          })
        : isAdmin
          ? this.userRepository.count({
              where: {
                level: EUserLevels.TRAINER,
                createdByUserId: user.id,
                ...dateFilter,
              },
            })
          : Promise.resolve(0),

      // Clients
      isSuperAdmin
        ? this.userRepository.count({
            where: { level: EUserLevels.CLIENT, ...dateFilter },
          })
        : isAdmin
          ? this.userRepository.count({
              where: {
                level: EUserLevels.CLIENT,
                createdByUserId: user.id,
                ...dateFilter,
              },
            })
          : isTrainer && trainerClientIds.length > 0
            ? this.clientRepository.count({
                where: { id: In(trainerClientIds), ...dateFilter },
              })
            : Promise.resolve(0),

      // Active Trainers
      isSuperAdmin
        ? this.userRepository.count({
            where: {
              level: EUserLevels.TRAINER,
              isActive: true,
              ...dateFilter,
            },
          })
        : isAdmin
          ? this.userRepository.count({
              where: {
                level: EUserLevels.TRAINER,
                createdByUserId: user.id,
                isActive: true,
                ...dateFilter,
              },
            })
          : Promise.resolve(0),

      // Active Clients
      isSuperAdmin
        ? this.userRepository.count({
            where: {
              level: EUserLevels.CLIENT,
              isActive: true,
              ...dateFilter,
            },
          })
        : isAdmin
          ? this.userRepository.count({
              where: {
                level: EUserLevels.CLIENT,
                createdByUserId: user.id,
                isActive: true,
                ...dateFilter,
              },
            })
          : isTrainer && trainerClientIds.length > 0
            ? this.clientRepository.count({
                where: {
                  id: In(trainerClientIds),
                  user: { isActive: true },
                  ...dateFilter,
                },
              })
            : Promise.resolve(0),

      // Sessions
      isSuperAdmin
        ? this.sessionRepository.count({ where: dateFilter })
        : isAdmin
          ? this.sessionRepository
              .createQueryBuilder('session')
              .leftJoin('session.trainer', 'trainer')
              .where('trainer.createdByUserId = :userId', { userId: user.id })
              .andWhere('session.createdAt BETWEEN :start AND :end', {
                start,
                end,
              })
              .getCount()
          : isTrainer && trainerId
            ? this.sessionRepository
                .createQueryBuilder('session')
                .where('session.trainerUserId = :trainerId', { trainerId })
                .andWhere('session.createdAt BETWEEN :start AND :end', {
                  start,
                  end,
                })
                .getCount()
            : isClient && clientUserId
              ? this.sessionRepository
                  .createQueryBuilder('session')
                  .leftJoin('session.clients', 'client')
                  .where('client.userId = :userId', { userId: clientUserId })
                  .andWhere('session.createdAt BETWEEN :start AND :end', {
                    start,
                    end,
                  })
                  .getCount()
              : Promise.resolve(0),

      // Billings
      isSuperAdmin
        ? this.billingRepository.count({ where: dateFilter })
        : isAdmin
          ? this.billingRepository.count({
              where: { createdByUserId: user.id, ...dateFilter },
            })
          : isClient && clientUserId
            ? this.billingRepository
                .createQueryBuilder('billing')
                .where('billing.recipientUserId = :userId', {
                  userId: clientUserId,
                })
                .andWhere('billing.createdAt BETWEEN :start AND :end', {
                  start,
                  end,
                })
                .getCount()
            : Promise.resolve(0),

      // Active Sessions
      isSuperAdmin
        ? this.sessionRepository.count({
            where: { status: ESessionStatus.SCHEDULED, ...dateFilter },
          })
        : isAdmin
          ? this.sessionRepository
              .createQueryBuilder('session')
              .leftJoin('session.trainer', 'trainer')
              .where('trainer.createdByUserId = :userId', { userId: user.id })
              .andWhere('session.status = :status', {
                status: ESessionStatus.SCHEDULED,
              })
              .andWhere('session.createdAt BETWEEN :start AND :end', {
                start,
                end,
              })
              .getCount()
          : isTrainer && trainerId
            ? this.sessionRepository
                .createQueryBuilder('session')
                .where('session.trainerUserId = :trainerId', { trainerId })
                .andWhere('session.status = :status', {
                  status: ESessionStatus.SCHEDULED,
                })
                .andWhere('session.createdAt BETWEEN :start AND :end', {
                  start,
                  end,
                })
                .getCount()
            : isClient && clientUserId
              ? this.sessionRepository
                  .createQueryBuilder('session')
                  .leftJoin('session.clients', 'client')
                  .where('client.userId = :userId', { userId: clientUserId })
                  .andWhere('session.status = :status', {
                    status: ESessionStatus.SCHEDULED,
                  })
                  .andWhere('session.createdAt BETWEEN :start AND :end', {
                    start,
                    end,
                  })
                  .getCount()
              : Promise.resolve(0),

      // Pending Billings
      isSuperAdmin
        ? this.billingRepository.count({
            where: { status: EBillingStatus.PENDING, ...dateFilter },
          })
        : isAdmin
          ? this.billingRepository.count({
              where: {
                createdByUserId: user.id,
                status: EBillingStatus.PENDING,
                ...dateFilter,
              },
            })
          : isClient && clientUserId
            ? this.billingRepository
                .createQueryBuilder('billing')
                .where('billing.recipientUserId = :userId', {
                  userId: clientUserId,
                })
                .andWhere('billing.status = :status', {
                  status: EBillingStatus.PENDING,
                })
                .andWhere('billing.createdAt BETWEEN :start AND :end', {
                  start,
                  end,
                })
                .getCount()
            : Promise.resolve(0),

      // Completed Sessions
      isSuperAdmin
        ? this.sessionRepository.count({
            where: { status: ESessionStatus.COMPLETED, ...dateFilter },
          })
        : isAdmin
          ? this.sessionRepository
              .createQueryBuilder('session')
              .leftJoin('session.trainer', 'trainer')
              .where('trainer.createdByUserId = :userId', { userId: user.id })
              .andWhere('session.status = :status', {
                status: ESessionStatus.COMPLETED,
              })
              .andWhere('session.createdAt BETWEEN :start AND :end', {
                start,
                end,
              })
              .getCount()
          : isTrainer && trainerId
            ? this.sessionRepository
                .createQueryBuilder('session')
                .where('session.trainerUserId = :trainerId', { trainerId })
                .andWhere('session.status = :status', {
                  status: ESessionStatus.COMPLETED,
                })
                .andWhere('session.createdAt BETWEEN :start AND :end', {
                  start,
                  end,
                })
                .getCount()
            : isClient && clientUserId
              ? this.sessionRepository
                  .createQueryBuilder('session')
                  .leftJoin('session.clients', 'client')
                  .where('client.userId = :userId', { userId: clientUserId })
                  .andWhere('session.status = :status', {
                    status: ESessionStatus.COMPLETED,
                  })
                  .andWhere('session.createdAt BETWEEN :start AND :end', {
                    start,
                    end,
                  })
                  .getCount()
              : Promise.resolve(0),

      // Paid Billings
      isSuperAdmin
        ? this.billingRepository.count({
            where: { status: EBillingStatus.PAID, ...dateFilter },
          })
        : isAdmin
          ? this.billingRepository.count({
              where: {
                createdByUserId: user.id,
                status: EBillingStatus.PAID,
                ...dateFilter,
              },
            })
          : isClient && clientUserId
            ? this.billingRepository
                .createQueryBuilder('billing')
                .where('billing.recipientUserId = :userId', {
                  userId: clientUserId,
                })
                .andWhere('billing.status = :status', {
                  status: EBillingStatus.PAID,
                })
                .andWhere('billing.createdAt BETWEEN :start AND :end', {
                  start,
                  end,
                })
                .getCount()
            : Promise.resolve(0),

      // Referral Links - Total
      isSuperAdmin
        ? this.referralLinkRepository.count({ where: dateFilter })
        : this.referralLinkRepository.count({
            where: { createdByUserId: user.id, ...dateFilter },
          }),

      // Referral Links - Active
      isSuperAdmin
        ? this.referralLinkRepository
            .createQueryBuilder('rl')
            .where('rl.status = :status', { status: 'ACTIVE' })
            .andWhere('rl.createdAt BETWEEN :start AND :end', { start, end })
            .getCount()
        : this.referralLinkRepository
            .createQueryBuilder('rl')
            .where('rl.createdByUserId = :userId', { userId: user.id })
            .andWhere('rl.status = :status', { status: 'ACTIVE' })
            .andWhere('rl.createdAt BETWEEN :start AND :end', { start, end })
            .getCount(),

      // Referral Links - Total Referral Count
      isSuperAdmin
        ? this.referralLinkRepository
            .createQueryBuilder('rl')
            .select('SUM(rl.referralCount)', 'sum')
            .where('rl.createdAt BETWEEN :start AND :end', { start, end })
            .getRawOne()
            .then((result) => parseInt(result?.sum || '0', 10))
        : this.referralLinkRepository
            .createQueryBuilder('rl')
            .select('SUM(rl.referralCount)', 'sum')
            .where('rl.createdByUserId = :userId', { userId: user.id })
            .andWhere('rl.createdAt BETWEEN :start AND :end', { start, end })
            .getRawOne()
            .then((result) => parseInt(result?.sum || '0', 10)),

      // Referral Links - Total Uses
      isSuperAdmin
        ? this.referralLinkRepository
            .createQueryBuilder('rl')
            .select('SUM(rl.currentUses)', 'sum')
            .where('rl.createdAt BETWEEN :start AND :end', { start, end })
            .getRawOne()
            .then((result) => parseInt(result?.sum || '0', 10))
        : this.referralLinkRepository
            .createQueryBuilder('rl')
            .select('SUM(rl.currentUses)', 'sum')
            .where('rl.createdByUserId = :userId', { userId: user.id })
            .andWhere('rl.createdAt BETWEEN :start AND :end', { start, end })
            .getRawOne()
            .then((result) => parseInt(result?.sum || '0', 10)),
    ]);

    // Metrics
    const sessionCompletionRate =
      totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
    const paymentSuccessRate =
      totalBillings > 0 ? (paidBillings / totalBillings) * 100 : 0;

    return {
      period,
      overview: {
        ...(isSuperAdmin && { totalAdmins }),
        ...((isSuperAdmin || isAdmin) && { totalUsers }),
        // Trainers: Only show trainer stats to Super Admin and Admin, not to trainers themselves
        ...((isSuperAdmin || isAdmin) && {
          totalTrainers,
          totalActiveTrainers,
        }),
        // Clients: Show to Super Admin, Admin, and Trainers (their clients)
        ...((isSuperAdmin || isAdmin || isTrainer) && {
          totalClients,
          totalActiveClients,
        }),
        // Sessions: Show to all roles
        ...((isSuperAdmin || isAdmin || isTrainer || isClient) && {
          totalSessions,
          activeSessions,
          completedSessions,
        }),
        // Billings: Show to Super Admin, Admin, and Clients (their billings)
        ...((isSuperAdmin || isAdmin || isClient) && {
          totalBillings,
          pendingBillings,
          paidBillings,
        }),
      },
      metrics: {
        ...((isSuperAdmin || isAdmin || isTrainer || isClient) && {
          sessionCompletionRate: Math.round(sessionCompletionRate * 100) / 100,
        }),
        ...((isSuperAdmin || isAdmin || isClient) && {
          paymentSuccessRate: Math.round(paymentSuccessRate * 100) / 100,
        }),
        // Average sessions per client: Only for Super Admin, Admin, and Trainers
        ...((isSuperAdmin || isAdmin || isTrainer) &&
          totalClients > 0 && {
            averageSessionsPerClient:
              Math.round((totalSessions / totalClients) * 100) / 100,
          }),
      },
      referralLinks: {
        total: totalReferralLinks,
        active: activeReferralLinks,
        totalReferralCount,
        totalUses: totalReferralUses,
      },
    };
  }

  async getSessionsAnalytics(user: User, query: DashboardAnalyticsDto) {
    const { period, from, to } = query;
    const start = from
      ? new Date(from)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = to ? new Date(to) : new Date();

    const isSuperAdmin = user.level === EUserLevels.SUPER_ADMIN;
    const userJoin = isSuperAdmin
      ? ''
      : `LEFT JOIN trainers t ON s."trainerUserId" = t.id`;
    const userCondition = isSuperAdmin ? '' : `AND t."userId" = $3`;

    let groupBy = `DATE_TRUNC('month', s."startDateTime")`;
    if (period === EAnalyticsPeriod.DAY)
      groupBy = `DATE_TRUNC('day', s."startDateTime")`;
    if (period === EAnalyticsPeriod.WEEK)
      groupBy = `DATE_TRUNC('week', s."startDateTime")`;
    if (period === EAnalyticsPeriod.MONTH)
      groupBy = `DATE_TRUNC('month', s."startDateTime")`;
    if (period === EAnalyticsPeriod.YEAR)
      groupBy = `DATE_TRUNC('year', s."startDateTime")`;

    // use BETWEEN $1 AND $2 and pass start/end (DB driver handles Date or ISO)
    const sessionStatsQuery = `
  SELECT 
    ${groupBy} as period,
    COUNT(DISTINCT s.id) as total_sessions,
    COUNT(DISTINCT CASE WHEN s.status = 'COMPLETED' THEN s.id END) as completed_sessions,
    COUNT(DISTINCT CASE WHEN s.status = 'SCHEDULED' THEN s.id END) as scheduled_sessions,
    COUNT(DISTINCT CASE WHEN s.status = 'CANCELLED' THEN s.id END) as cancelled_sessions,
    AVG(s.price) as average_price,
    SUM(s.price * COALESCE(client_counts.client_count, 1)) as total_potential_revenue
  FROM sessions s
  ${userJoin}
  LEFT JOIN (
    SELECT "sessionsId", COUNT(*) as client_count 
    FROM session_clients_users 
    GROUP BY "sessionsId"
  ) client_counts ON s.id = client_counts."sessionsId"
  WHERE s."startDateTime" BETWEEN $1 AND $2 ${userCondition}
  GROUP BY ${groupBy}
  ORDER BY period DESC
`;

    const sessionStats = await this.sessionRepository.query(
      sessionStatsQuery,
      queryParams,
    );

    // Get session type distribution
    const sessionTypeQuery = `
      SELECT 
        s.type,
        COUNT(*) as count,
        AVG(s.price) as average_price
      FROM sessions s
      ${userJoin}
      WHERE s."startDateTime" >= NOW() - INTERVAL '12 months' ${userCondition}
      GROUP BY s.type
      ORDER BY count DESC
    `;

    const sessionTypeParams = isSuperAdmin ? [] : [user.id];
    const sessionTypes = await this.sessionRepository.query(
      sessionTypeQuery,
      sessionTypeParams,
    );

    return {
      period,
      timeline: sessionStats.map((row) => ({
        period: row.period,
        totalSessions: parseInt(row.total_sessions),
        completedSessions: parseInt(row.completed_sessions),
        scheduledSessions: parseInt(row.scheduled_sessions),
        cancelledSessions: parseInt(row.cancelled_sessions),
        averagePrice: parseFloat(row.average_price) || 0,
        totalPotentialRevenue: parseFloat(row.total_potential_revenue) || 0,
        completionRate:
          row.total_sessions > 0
            ? (row.completed_sessions / row.total_sessions) * 100
            : 0,
      })),
      sessionTypes: sessionTypes.map((row) => ({
        type: row.type,
        count: parseInt(row.count),
        averagePrice: parseFloat(row.average_price) || 0,
      })),
    };
  }

  async getBillingAnalytics(user: User, query: DashboardAnalyticsDto) {
    const { period, from, to } = query;
    const start = from
      ? new Date(from)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = to ? new Date(to) : new Date();

    const isSuperAdmin = user.level === EUserLevels.SUPER_ADMIN;
    const isAdmin = user.level === EUserLevels.ADMIN;
    const isClient = user.level === EUserLevels.CLIENT;
    const PLATFORM_FEE_PERCENTAGE = 0.02;
    
    // Build user condition based on role
    let userCondition = '';
    let queryParams: any[] = [start, end];
    
    if (isSuperAdmin) {
      // Super Admin sees all billings
      userCondition = '';
    } else if (isAdmin) {
      // Admin sees billings they created
      userCondition = `AND "createdByUserId" = $3`;
      queryParams.push(user.id);
    } else if (isClient) {
      // Client sees only their own billings
      userCondition = `AND "recipientUserId" = $3`;
      queryParams.push(user.id);
    }

    /** 2. Revenue Stats */
    const revenueStats = await this.billingRepository.query(
      `
    SELECT
      SUM("amount") as total_revenue,
      SUM(CASE WHEN status = 'PAID' THEN "amount" ELSE 0 END) as paid_revenue,
      SUM(CASE WHEN status = 'PENDING' THEN "amount" ELSE 0 END) as pending_revenue,
      SUM(CASE WHEN status = 'PAID' THEN "amount" * ${PLATFORM_FEE_PERCENTAGE} ELSE 0 END) as platform_revenue,
      COUNT(*) as total_transactions
    FROM billings
    WHERE "createdAt" BETWEEN $1 AND $2 ${userCondition}
    `,
      queryParams,
    );

    /** 3. Timeline (dynamic based on period) */
    const groupBy =
      period === EAnalyticsPeriod.YEAR
        ? `DATE_TRUNC('year', "createdAt")`
        : period === EAnalyticsPeriod.MONTH
          ? `DATE_TRUNC('month', "createdAt")`
          : period === EAnalyticsPeriod.WEEK
            ? `DATE_TRUNC('week', "createdAt")`
            : `DATE_TRUNC('day', "createdAt")`;

    const timeline = await this.billingRepository.query(
      `
    SELECT 
      TO_CHAR(${groupBy}, 'YYYY-MM-DD') as bucket,
      SUM("amount") as total,
      SUM(CASE WHEN status = 'PAID' THEN "amount" ELSE 0 END) as paid,
      SUM(CASE WHEN status = 'PAID' THEN "amount" * ${PLATFORM_FEE_PERCENTAGE} ELSE 0 END) as platform_fee
    FROM billings
    WHERE "createdAt" BETWEEN $1 AND $2 ${userCondition}
    GROUP BY bucket
    ORDER BY bucket ASC
    `,
      queryParams,
    );

    /** 5. Detailed Summary */
    const summary = await this.billingRepository.query(
      `
    SELECT
      COUNT(*) as total_billings,
      SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) as paid_billings,
      SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_billings,
      SUM(CASE WHEN status = 'OVERDUE' THEN 1 ELSE 0 END) as overdue_billings,
      SUM(CASE WHEN status = 'PAID' THEN "amount" ELSE 0 END) as total_paid,
      SUM(CASE WHEN status = 'PENDING' THEN "amount" ELSE 0 END) as total_pending,
      SUM(CASE WHEN status = 'OVERDUE' THEN "amount" ELSE 0 END) as total_overdue,
      AVG("amount") as average_billing_amount,
      AVG(CASE WHEN status = 'PAID' THEN "amount" END) as average_paid_amount
    FROM billings
    WHERE "createdAt" BETWEEN $1 AND $2 ${userCondition}
    `,
      queryParams,
    );

    /** 6. Type Distribution */
    const typeDistribution = await this.billingRepository.query(
      `
    SELECT 
      "type" as type,
      COUNT(*) as count,
      SUM("amount") as total_amount,
      SUM(CASE WHEN status = 'PAID' THEN "amount" ELSE 0 END) as paid_amount,
      AVG("amount") as average_amount
    FROM billings
    WHERE "createdAt" BETWEEN $1 AND $2 ${userCondition}
    GROUP BY type
    `,
      queryParams,
    );

    return {
      period,
      revenue: {
        total: Number(revenueStats[0]?.total_revenue || 0),
        paid: Number(revenueStats[0]?.paid_revenue || 0),
        pending: Number(revenueStats[0]?.pending_revenue || 0),
        platform: Number(revenueStats[0]?.platform_revenue || 0),
        trainer:
          Number(revenueStats[0]?.paid_revenue || 0) -
          Number(revenueStats[0]?.platform_revenue || 0),
        transactions: Number(revenueStats[0]?.total_transactions || 0),
      },
      timeline: timeline.map((item) => ({
        bucket: item.bucket,
        total: Number(item.total),
        paid: Number(item.paid),
        platformFee: Number(item.platform_fee),
        trainerPayout: Number(item.paid) - Number(item.platform_fee),
      })),
      summary: summary[0] || null,
      typeDistribution,
    };
  }
}
