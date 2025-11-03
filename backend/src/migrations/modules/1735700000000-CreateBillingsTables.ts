import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateBillingsTables1735700000000 implements MigrationInterface {
  name = 'CreateBillingsTables1735700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'billings',
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
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'issueDate',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'dueDate',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'],
            default: "'PENDING'",
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['SESSION', 'SUBSCRIPTION', 'MEMBERSHIP', 'OTHER'],
            isNullable: false,
          },
          {
            name: 'recurrence',
            type: 'enum',
            enum: ['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'],
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'recipientUserId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'reminderConfig',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'enableReminder',
            type: 'boolean',
            default: false,
          },
          {
            name: 'paidAt',
            type: 'timestamptz',
            isNullable: true,
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
      'billings',
      new TableForeignKey({
        columnNames: ['recipientUserId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'billings',
      new TableIndex({
        name: 'IDX_billings_recipient',
        columnNames: ['recipientUserId'],
      }),
    );

    await queryRunner.createIndex(
      'billings',
      new TableIndex({
        name: 'IDX_billings_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'billings',
      new TableIndex({
        name: 'IDX_billings_dueDate',
        columnNames: ['dueDate'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('billings', 'IDX_billings_dueDate');
    await queryRunner.dropIndex('billings', 'IDX_billings_status');
    await queryRunner.dropIndex('billings', 'IDX_billings_recipient');

    const billingsTable = await queryRunner.getTable('billings');
    const foreignKeys = billingsTable?.foreignKeys || [];
    for (const fk of foreignKeys) {
      await queryRunner.dropForeignKey('billings', fk);
    }

    await queryRunner.dropTable('billings');
  }
}

