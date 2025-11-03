import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateReferralLinksTables1735700000000
  implements MigrationInterface
{
  name = 'CreateReferralLinksTables1735700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'referral_links',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'linkUrl',
            type: 'varchar',
            length: '500',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'referralCode',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['USER', 'CLIENT', 'TRAINER'],
            default: "'USER'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'INACTIVE', 'EXPIRED'],
            default: "'ACTIVE'",
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'referralCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'expiresAt',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'maxUses',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'currentUses',
            type: 'int',
            default: 0,
          },
          {
            name: 'createdByUserId',
            type: 'uuid',
            isNullable: false,
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
      'referral_links',
      new TableForeignKey({
        columnNames: ['createdByUserId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'referral_links',
      new TableIndex({
        name: 'UQ_referral_links_code',
        columnNames: ['referralCode'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'referral_links',
      new TableIndex({
        name: 'UQ_referral_links_url',
        columnNames: ['linkUrl'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('referral_links', 'UQ_referral_links_url');
    await queryRunner.dropIndex('referral_links', 'UQ_referral_links_code');

    const referralLinksTable = await queryRunner.getTable('referral_links');
    const foreignKeys = referralLinksTable?.foreignKeys || [];
    for (const fk of foreignKeys) {
      await queryRunner.dropForeignKey('referral_links', fk);
    }

    await queryRunner.dropTable('referral_links');
  }
}


