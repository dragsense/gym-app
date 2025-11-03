import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateUserAvailabilityTables1735900000000
  implements MigrationInterface
{
  name = 'CreateUserAvailabilityTables1735900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_availability',
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
            name: 'weeklySchedule',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'unavailablePeriods',
            type: 'jsonb',
            default: "'[]'',
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
      'user_availability',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'user_availability',
      new TableIndex({
        name: 'UQ_user_availability_userId',
        columnNames: ['userId'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'user_availability',
      'UQ_user_availability_userId',
    );

    const userAvailabilityTable = await queryRunner.getTable(
      'user_availability',
    );
    const foreignKeys = userAvailabilityTable?.foreignKeys || [];
    for (const fk of foreignKeys) {
      await queryRunner.dropForeignKey('user_availability', fk);
    }

    await queryRunner.dropTable('user_availability');
  }
}


