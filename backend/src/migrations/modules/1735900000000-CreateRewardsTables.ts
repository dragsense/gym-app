import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateRewardsTables1735900000000 implements MigrationInterface {
  name = 'CreateRewardsTables1735900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reward_points',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'points',
            type: 'int',
            default: 0,
          },
          {
            name: 'type',
            type: 'enum',
            enum: [
              'REFERRAL_BONUS',
              'SIGNUP_BONUS',
              'PURCHASE_BONUS',
              'ACTIVITY_BONUS',
            ],
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'REDEEMED', 'EXPIRED'],
            default: "'ACTIVE'",
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'referralLinkId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'referredUserId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'expiresAt',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'isRedeemable',
            type: 'boolean',
            default: true,
          },
          {
            name: 'redeemedPoints',
            type: 'int',
            default: 0,
          },
          {
            name: 'createdByUserId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedByUserId',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'reward_points',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'reward_points',
      new TableForeignKey({
        columnNames: ['referralLinkId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'referral_links',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createIndex(
      'reward_points',
      new TableIndex({
        name: 'IDX_reward_points_user',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'reward_points',
      new TableIndex({
        name: 'IDX_reward_points_status',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('reward_points', 'IDX_reward_points_status');
    await queryRunner.dropIndex('reward_points', 'IDX_reward_points_user');

    const rewardPointsTable = await queryRunner.getTable('reward_points');
    const foreignKeys = rewardPointsTable?.foreignKeys || [];
    for (const fk of foreignKeys) {
      await queryRunner.dropForeignKey('reward_points', fk);
    }

    await queryRunner.dropTable('reward_points');
  }
}

