import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateProfileTables1735200000000 implements MigrationInterface {
  name = 'CreateProfileTables1735200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create profiles table
    await queryRunner.createTable(
      new Table({
        name: 'profiles',
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
            name: 'phoneNumber',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'imageId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'stripeCustomerId',
            type: 'varchar',
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

    // Create profile_documents join table
    await queryRunner.createTable(
      new Table({
        name: 'profile_documents',
        columns: [
          {
            name: 'profile_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'document_id',
            type: 'uuid',
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'profiles',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'profiles',
      new TableForeignKey({
        columnNames: ['imageId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'uploaded_files',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'profile_documents',
      new TableForeignKey({
        columnNames: ['profile_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'profiles',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'profile_documents',
      new TableForeignKey({
        columnNames: ['document_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'uploaded_files',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'profiles',
      new TableIndex({
        name: 'UQ_profiles_userId',
        columnNames: ['userId'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('profiles', 'UQ_profiles_userId');

    const profileDocumentsTable = await queryRunner.getTable(
      'profile_documents',
    );
    const profileDocumentsForeignKeys =
      profileDocumentsTable?.foreignKeys || [];
    for (const fk of profileDocumentsForeignKeys) {
      await queryRunner.dropForeignKey('profile_documents', fk);
    }

    const profilesTable = await queryRunner.getTable('profiles');
    const profilesForeignKeys = profilesTable?.foreignKeys || [];
    for (const fk of profilesForeignKeys) {
      await queryRunner.dropForeignKey('profiles', fk);
    }

    await queryRunner.dropTable('profile_documents');
    await queryRunner.dropTable('profiles');
  }
}

