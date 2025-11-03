import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateTrainerClientsTables1735500000000
  implements MigrationInterface
{
  name = 'CreateTrainerClientsTables1735500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'trainer_clients',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'trainerId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'clientId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
            default: "'ACTIVE'",
          },
          {
            name: 'notes',
            type: 'text',
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
      'trainer_clients',
      new TableForeignKey({
        columnNames: ['trainerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'trainers',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'trainer_clients',
      new TableForeignKey({
        columnNames: ['clientId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'clients',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'trainer_clients',
      new TableIndex({
        name: 'UQ_trainer_clients_pair',
        columnNames: ['trainerId', 'clientId'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'trainer_clients',
      'UQ_trainer_clients_pair',
    );

    const trainerClientsTable = await queryRunner.getTable('trainer_clients');
    const foreignKeys = trainerClientsTable?.foreignKeys || [];
    for (const fk of foreignKeys) {
      await queryRunner.dropForeignKey('trainer_clients', fk);
    }

    await queryRunner.dropTable('trainer_clients');
  }
}

