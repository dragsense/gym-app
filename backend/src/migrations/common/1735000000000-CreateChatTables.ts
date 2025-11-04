import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateChatTables1735000000000 implements MigrationInterface {
  name = 'CreateChatTables1735000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create conversations table
    await queryRunner.createTable(
      new Table({
        name: 'conversations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'lastMessageId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
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
            name: 'createdByUserId',
            type: 'uuid',
            isNullable: true,
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

    // Create chat_messages table
    await queryRunner.createTable(
      new Table({
        name: 'chat_messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'message',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'senderId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'conversationId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'isRead',
            type: 'boolean',
            default: false,
          },
          {
            name: 'readAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'messageType',
            type: 'varchar',
            length: '50',
            default: "'text'",
          },
          {
            name: 'metadata',
            type: 'jsonb',
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
            name: 'createdByUserId',
            type: 'uuid',
            isNullable: true,
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

    // Create chat_users table
    await queryRunner.createTable(
      new Table({
        name: 'chat_users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'chatId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'archived',
            type: 'boolean',
            default: false,
          },
          {
            name: 'joinedAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
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
            name: 'createdByUserId',
            type: 'uuid',
            isNullable: true,
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

    // Create foreign keys for conversations table
    await queryRunner.createForeignKey(
      'conversations',
      new TableForeignKey({
        columnNames: ['lastMessageId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'chat_messages',
        onDelete: 'SET NULL',
      }),
    );

    // Create foreign keys for chat_users table
    await queryRunner.createForeignKey(
      'chat_users',
      new TableForeignKey({
        columnNames: ['chatId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'conversations',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'chat_users',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create foreign keys for chat_messages table
    await queryRunner.createForeignKey(
      'chat_messages',
      new TableForeignKey({
        columnNames: ['senderId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'chat_messages',
      new TableForeignKey({
        columnNames: ['conversationId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'conversations',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for better query performance
    await queryRunner.createIndex(
      'chat_users',
      new TableIndex({
        name: 'IDX_chat_users_chatId',
        columnNames: ['chatId'],
      }),
    );

    await queryRunner.createIndex(
      'chat_users',
      new TableIndex({
        name: 'IDX_chat_users_userId',
        columnNames: ['userId'],
      }),
    );

    // Create unique constraint to prevent duplicate chat_users entries
    await queryRunner.createIndex(
      'chat_users',
      new TableIndex({
        name: 'UQ_chat_users_chat_user',
        columnNames: ['chatId', 'userId'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'chat_messages',
      new TableIndex({
        name: 'IDX_chat_messages_conversation',
        columnNames: ['conversationId'],
      }),
    );

    await queryRunner.createIndex(
      'chat_messages',
      new TableIndex({
        name: 'IDX_chat_messages_sender',
        columnNames: ['senderId'],
      }),
    );

    await queryRunner.createIndex(
      'chat_messages',
      new TableIndex({
        name: 'IDX_chat_messages_createdAt',
        columnNames: ['createdAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('chat_messages', 'IDX_chat_messages_createdAt');
    await queryRunner.dropIndex('chat_messages', 'IDX_chat_messages_sender');
    await queryRunner.dropIndex(
      'chat_messages',
      'IDX_chat_messages_conversation',
    );
    await queryRunner.dropIndex('chat_users', 'UQ_chat_users_chat_user');
    await queryRunner.dropIndex('chat_users', 'IDX_chat_users_userId');
    await queryRunner.dropIndex('chat_users', 'IDX_chat_users_chatId');

    // Drop foreign keys
    const chatUsersTable = await queryRunner.getTable('chat_users');
    const chatUsersForeignKeys = chatUsersTable?.foreignKeys || [];
    for (const fk of chatUsersForeignKeys) {
      await queryRunner.dropForeignKey('chat_users', fk);
    }

    const chatMessagesTable = await queryRunner.getTable('chat_messages');
    const chatMessagesForeignKeys = chatMessagesTable?.foreignKeys || [];
    for (const fk of chatMessagesForeignKeys) {
      await queryRunner.dropForeignKey('chat_messages', fk);
    }

    const conversationsTable = await queryRunner.getTable('conversations');
    const conversationsForeignKeys = conversationsTable?.foreignKeys || [];
    for (const fk of conversationsForeignKeys) {
      await queryRunner.dropForeignKey('conversations', fk);
    }

    // Drop tables
    await queryRunner.dropTable('chat_users');
    await queryRunner.dropTable('chat_messages');
    await queryRunner.dropTable('conversations');
  }
}
