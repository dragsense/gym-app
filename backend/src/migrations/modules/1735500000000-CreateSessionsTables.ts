import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateSessionsTables1735500000000 implements MigrationInterface {
  name = 'CreateSessionsTables1735500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'sessions',
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
            name: 'startDateTime',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'duration',
            type: 'int',
            default: 60,
            isNullable: true,
          },
          {
            name: 'endDateTime',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['PERSONAL', 'GROUP', 'VIRTUAL'],
            isNullable: false,
          },
          {
            name: 'location',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: [
              'SCHEDULED',
              'IN_PROGRESS',
              'COMPLETED',
              'CANCELLED',
              'NO_SHOW',
            ],
            default: "'SCHEDULED'",
          },
          {
            name: 'trainerUserId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'recurrence',
            type: 'enum',
            enum: ['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'],
            isNullable: true,
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

    // Create session_clients_users join table
    await queryRunner.createTable(
      new Table({
        name: 'session_clients_users',
        columns: [
          {
            name: 'sessionsId',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'clientsId',
            type: 'uuid',
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'sessions',
      new TableForeignKey({
        columnNames: ['trainerUserId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'trainers',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'session_clients_users',
      new TableForeignKey({
        columnNames: ['sessionsId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'sessions',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'session_clients_users',
      new TableForeignKey({
        columnNames: ['clientsId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'clients',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'sessions',
      new TableIndex({
        name: 'IDX_sessions_trainer',
        columnNames: ['trainerUserId'],
      }),
    );

    await queryRunner.createIndex(
      'sessions',
      new TableIndex({
        name: 'IDX_sessions_startDateTime',
        columnNames: ['startDateTime'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('sessions', 'IDX_sessions_startDateTime');
    await queryRunner.dropIndex('sessions', 'IDX_sessions_trainer');

    const sessionClientsTable = await queryRunner.getTable(
      'session_clients_users',
    );
    const sessionClientsForeignKeys = sessionClientsTable?.foreignKeys || [];
    for (const fk of sessionClientsForeignKeys) {
      await queryRunner.dropForeignKey('session_clients_users', fk);
    }

    const sessionsTable = await queryRunner.getTable('sessions');
    const sessionsForeignKeys = sessionsTable?.foreignKeys || [];
    for (const fk of sessionsForeignKeys) {
      await queryRunner.dropForeignKey('sessions', fk);
    }

    await queryRunner.dropTable('session_clients_users');
    await queryRunner.dropTable('sessions');
  }
}


