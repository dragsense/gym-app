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
            name: 'participantOneId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'participantTwoId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'lastMessageId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'archivedByParticipantOne',
            type: 'boolean',
            default: false,
          },
          {
            name: 'archivedByParticipantTwo',
            type: 'boolean',
            default: false,
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

    // Create foreign keys for conversations table
    await queryRunner.createForeignKey(
      'conversations',
      new TableForeignKey({
        columnNames: ['participantOneId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'conversations',
      new TableForeignKey({
        columnNames: ['participantTwoId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'conversations',
      new TableForeignKey({
        columnNames: ['lastMessageId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'chat_messages',
        onDelete: 'SET NULL',
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
      'conversations',
      new TableIndex({
        name: 'IDX_conversations_participantOne',
        columnNames: ['participantOneId'],
      }),
    );

    await queryRunner.createIndex(
      'conversations',
      new TableIndex({
        name: 'IDX_conversations_participantTwo',
        columnNames: ['participantTwoId'],
      }),
    );

    await queryRunner.createIndex(
      'conversations',
      new TableIndex({
        name: 'IDX_conversations_participants',
        columnNames: ['participantOneId', 'participantTwoId'],
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

    // Create unique constraint to prevent duplicate conversations between same participants
    await queryRunner.createIndex(
      'conversations',
      new TableIndex({
        name: 'UQ_conversations_participants',
        columnNames: ['participantOneId', 'participantTwoId'],
        isUnique: true,
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
    await queryRunner.dropIndex(
      'conversations',
      'UQ_conversations_participants',
    );
    await queryRunner.dropIndex(
      'conversations',
      'IDX_conversations_participants',
    );
    await queryRunner.dropIndex(
      'conversations',
      'IDX_conversations_participantTwo',
    );
    await queryRunner.dropIndex(
      'conversations',
      'IDX_conversations_participantOne',
    );

    // Drop foreign keys
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
    await queryRunner.dropTable('chat_messages');
    await queryRunner.dropTable('conversations');
  }
}
