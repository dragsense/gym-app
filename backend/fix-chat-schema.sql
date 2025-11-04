-- Fix chat schema to support multiple users
-- Run this SQL script to update the existing database

-- Step 1: Create chat_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS "chat_users" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "chatId" uuid NOT NULL,
    "userId" uuid NOT NULL,
    "archived" boolean NOT NULL DEFAULT false,
    "joinedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" uuid,
    "updatedByUserId" uuid,
    CONSTRAINT "PK_chat_users" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_chat_users_chat_user" UNIQUE ("chatId", "userId")
);

-- Step 2: Create foreign keys for chat_users
ALTER TABLE "chat_users" 
    ADD CONSTRAINT "FK_chat_users_chat" 
    FOREIGN KEY ("chatId") REFERENCES "conversations"("id") ON DELETE CASCADE;

ALTER TABLE "chat_users" 
    ADD CONSTRAINT "FK_chat_users_user" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

-- Step 3: Migrate existing participant data to chat_users
INSERT INTO "chat_users" ("chatId", "userId", "joinedAt", "createdAt", "updatedAt")
SELECT 
    "id" as "chatId",
    "participantOneId" as "userId",
    "createdAt" as "joinedAt",
    "createdAt",
    "updatedAt"
FROM "conversations"
WHERE "participantOneId" IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO "chat_users" ("chatId", "userId", "joinedAt", "createdAt", "updatedAt")
SELECT 
    "id" as "chatId",
    "participantTwoId" as "userId",
    "createdAt" as "joinedAt",
    "createdAt",
    "updatedAt"
FROM "conversations"
WHERE "participantTwoId" IS NOT NULL
ON CONFLICT DO NOTHING;

-- Step 4: Add name column to conversations if it doesn't exist
ALTER TABLE "conversations" 
    ADD COLUMN IF NOT EXISTS "name" varchar(255);

-- Step 5: Drop foreign keys and indexes for participantOneId and participantTwoId
ALTER TABLE "conversations" 
    DROP CONSTRAINT IF EXISTS "FK_conversations_participantOne";

ALTER TABLE "conversations" 
    DROP CONSTRAINT IF EXISTS "FK_conversations_participantTwo";

DROP INDEX IF EXISTS "IDX_conversations_participantOne";
DROP INDEX IF EXISTS "IDX_conversations_participantTwo";
DROP INDEX IF EXISTS "IDX_conversations_participants";
DROP INDEX IF EXISTS "UQ_conversations_participants";

-- Step 6: Make participantOneId and participantTwoId nullable (so TypeORM can remove them)
ALTER TABLE "conversations" 
    ALTER COLUMN "participantOneId" DROP NOT NULL;

ALTER TABLE "conversations" 
    ALTER COLUMN "participantTwoId" DROP NOT NULL;

-- Step 7: Create indexes for chat_users
CREATE INDEX IF NOT EXISTS "IDX_chat_users_chatId" ON "chat_users"("chatId");
CREATE INDEX IF NOT EXISTS "IDX_chat_users_userId" ON "chat_users"("userId");

