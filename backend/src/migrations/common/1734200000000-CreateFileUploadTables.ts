import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from 'typeorm';

export class CreateFileUploadTables1734200000000
  implements MigrationInterface
{
  name = 'CreateFileUploadTables1734200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'uploaded_files',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'originalName',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'mimeType',
            type: 'varchar',
            default: "''",
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER'],
            default: "'OTHER'",
          },
          {
            name: 'size',
            type: 'bigint',
            default: 0,
          },
          {
            name: 'path',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'folder',
            type: 'varchar',
            default: "'general'",
          },
          {
            name: 'url',
            type: 'varchar',
            isNullable: false,
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
      'uploaded_files',
      new TableIndex({
        name: 'IDX_uploaded_files_type',
        columnNames: ['type'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('uploaded_files', 'IDX_uploaded_files_type');
    await queryRunner.dropTable('uploaded_files');
  }
}


