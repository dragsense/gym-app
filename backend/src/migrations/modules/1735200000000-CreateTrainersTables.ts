import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateTrainersTables1735200000000 implements MigrationInterface {
  name = 'CreateTrainersTables1735200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'trainers',
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
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'specialization',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'experience',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'certification',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'hourlyRate',
            type: 'decimal',
            precision: 10,
            scale: 2,
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
      'trainers',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'trainers',
      new TableIndex({
        name: 'UQ_trainers_userId',
        columnNames: ['userId'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('trainers', 'UQ_trainers_userId');

    const trainersTable = await queryRunner.getTable('trainers');
    const foreignKeys = trainersTable?.foreignKeys || [];
    for (const fk of foreignKeys) {
      await queryRunner.dropForeignKey('trainers', fk);
    }

    await queryRunner.dropTable('trainers');
  }
}


