import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateAuthTables1735000000000 implements MigrationInterface {
  name = 'CreateAuthTables1735000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create refresh_tokens table
    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'token',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'lastToken',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'expiresAt',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'revoked',
            type: 'boolean',
            default: false,
          },
          {
            name: 'userId',
            type: 'uuid',
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

    // Create auth_otp_codes table
    await queryRunner.createTable(
      new Table({
        name: 'auth_otp_codes',
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
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '10',
            isNullable: false,
          },
          {
            name: 'purpose',
            type: 'varchar',
            length: '30',
            isNullable: false,
          },
          {
            name: 'deviceId',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'expiresAt',
            type: 'timestamptz',
            isNullable: false,
          },
          {
            name: 'isUsed',
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

    // Create auth_trusted_devices table
    await queryRunner.createTable(
      new Table({
        name: 'auth_trusted_devices',
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
            isNullable: false,
          },
          {
            name: 'deviceId',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'deviceName',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'userAgent',
            type: 'text',
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
        ],
      }),
      true,
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'refresh_tokens',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'auth_otp_codes',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'auth_trusted_devices',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({
        name: 'IDX_refresh_tokens_userId',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'auth_otp_codes',
      new TableIndex({
        name: 'IDX_auth_otp_codes_deviceId',
        columnNames: ['deviceId'],
      }),
    );

    await queryRunner.createIndex(
      'auth_trusted_devices',
      new TableIndex({
        name: 'IDX_auth_trusted_devices_deviceId',
        columnNames: ['deviceId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'auth_trusted_devices',
      'IDX_auth_trusted_devices_deviceId',
    );
    await queryRunner.dropIndex(
      'auth_otp_codes',
      'IDX_auth_otp_codes_deviceId',
    );
    await queryRunner.dropIndex('refresh_tokens', 'IDX_refresh_tokens_userId');

    const trustedDevicesTable = await queryRunner.getTable(
      'auth_trusted_devices',
    );
    const trustedDevicesForeignKeys = trustedDevicesTable?.foreignKeys || [];
    for (const fk of trustedDevicesForeignKeys) {
      await queryRunner.dropForeignKey('auth_trusted_devices', fk);
    }

    const otpCodesTable = await queryRunner.getTable('auth_otp_codes');
    const otpCodesForeignKeys = otpCodesTable?.foreignKeys || [];
    for (const fk of otpCodesForeignKeys) {
      await queryRunner.dropForeignKey('auth_otp_codes', fk);
    }

    const refreshTokensTable = await queryRunner.getTable('refresh_tokens');
    const refreshTokensForeignKeys = refreshTokensTable?.foreignKeys || [];
    for (const fk of refreshTokensForeignKeys) {
      await queryRunner.dropForeignKey('refresh_tokens', fk);
    }

    await queryRunner.dropTable('auth_trusted_devices');
    await queryRunner.dropTable('auth_otp_codes');
    await queryRunner.dropTable('refresh_tokens');
  }
}

