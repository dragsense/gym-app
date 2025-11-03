import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateStripeConnectTables1736100000000
  implements MigrationInterface
{
  name = 'CreateStripeConnectTables1736100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'stripe_connect_accounts',
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
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'stripeAccountId',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '10',
            default: "'express'",
          },
          {
            name: 'country',
            type: 'varchar',
            length: '5',
            default: "'US'",
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'chargesEnabled',
            type: 'boolean',
            default: false,
          },
          {
            name: 'detailsSubmitted',
            type: 'boolean',
            default: false,
          },
          {
            name: 'payoutsEnabled',
            type: 'boolean',
            default: false,
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
      'stripe_connect_accounts',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'stripe_connect_accounts',
      new TableIndex({
        name: 'UQ_stripe_connect_userId',
        columnNames: ['userId'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'stripe_connect_accounts',
      new TableIndex({
        name: 'UQ_stripe_connect_accountId',
        columnNames: ['stripeAccountId'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'stripe_connect_accounts',
      'UQ_stripe_connect_accountId',
    );
    await queryRunner.dropIndex(
      'stripe_connect_accounts',
      'UQ_stripe_connect_userId',
    );

    const stripeConnectTable = await queryRunner.getTable(
      'stripe_connect_accounts',
    );
    const foreignKeys = stripeConnectTable?.foreignKeys || [];
    for (const fk of foreignKeys) {
      await queryRunner.dropForeignKey('stripe_connect_accounts', fk);
    }

    await queryRunner.dropTable('stripe_connect_accounts');
  }
}

