import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from 'typeorm';

export class CreateScheduleTables1734500000000 implements MigrationInterface {
  name = 'CreateScheduleTables1734500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'schedules',
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
            default: "'Schedule'",
          },
          {
            name: 'entityId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'action',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'data',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'frequency',
            type: 'enum',
            enum: ['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'],
            default: "'ONCE'",
          },
          {
            name: 'startDate',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'endDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'timeOfDay',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'endTime',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'intervalValue',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'intervalUnit',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'interval',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'timezone',
            type: 'varchar',
            default: "'UTC'",
            isNullable: true,
          },
          {
            name: 'cronExpression',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'weekDays',
            type: 'int',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'monthDays',
            type: 'int',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'months',
            type: 'int',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'],
            default: "'ACTIVE'",
          },
          {
            name: 'nextRunDate',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'lastRunAt',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'executionCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'successCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'failureCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'lastExecutionStatus',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'lastErrorMessage',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'executionHistory',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'retryOnFailure',
            type: 'boolean',
            default: true,
          },
          {
            name: 'maxRetries',
            type: 'int',
            default: 1,
          },
          {
            name: 'currentRetries',
            type: 'int',
            default: 0,
          },
          {
            name: 'retryDelayMinutes',
            type: 'int',
            default: 15,
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

    await queryRunner.createIndex(
      'schedules',
      new TableIndex({
        name: 'IDX_schedules_nextRunDate',
        columnNames: ['nextRunDate'],
      }),
    );

    await queryRunner.createIndex(
      'schedules',
      new TableIndex({
        name: 'IDX_schedules_status',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('schedules', 'IDX_schedules_status');
    await queryRunner.dropIndex('schedules', 'IDX_schedules_nextRunDate');
    await queryRunner.dropTable('schedules');
  }
}


