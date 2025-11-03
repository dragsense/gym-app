import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsDateString,
  IsObject,
  ValidateNested,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { FieldType } from "../../decorators/field.decorator";
import { PaginationMetaDto } from "../common/pagination.dto";
import { ListQueryDto, SingleQueryDto } from "../common/list-query.dto";
import { PartialType } from "../../lib/dto-type-adapter";
import { UserDto } from "../user-dtos/user.dto";

export class SendMessageDto {
  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "ID of the chat (conversation)",
  })
  @IsUUID()
  @IsNotEmpty()
  @FieldType("text", true)
  conversationId: string;

  @ApiProperty({
    example: "Hello, how are you?",
    description: "Message content",
  })
  @IsString()
  @IsNotEmpty()
  @FieldType("textarea", true)
  message: string;

  @ApiPropertyOptional({
    example: "550e8400-e29b-41d4-a716-446655440001",
    description: "ID of the recipient (for creating new chat)",
  })
  @IsOptional()
  @IsUUID()
  @FieldType("text")
  recipientId?: string;
}

export class CreateChatDto {
  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440001",
    description: "ID of the other participant",
  })
  @IsUUID()
  @IsNotEmpty()
  @FieldType("text", true)
  participantId: string;
}

export class ChatMessageDto {
  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Message ID",
  })
  id: string;

  @ApiProperty({
    example: "Hello, how are you?",
    description: "Message content",
  })
  message: string;

  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440001",
    description: "ID of the sender",
  })
  senderId: string;

  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440002",
    description: "ID of the chat",
  })
  conversationId: string;

  @ApiPropertyOptional({
    example: false,
    description: "Whether the message has been read",
  })
  isRead?: boolean;

  @ApiPropertyOptional({
    example: "2024-01-01T00:00:00.000Z",
    description: "When the message was read",
  })
  readAt?: string;

  @ApiPropertyOptional({
    example: "text",
    description: "Message type (text, image, file, etc.)",
  })
  messageType?: string;

  @ApiPropertyOptional({
    description: "Additional metadata for the message",
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    example: "2024-01-01T00:00:00.000Z",
    description: "When the message was created",
  })
  createdAt: string;

  @ApiProperty({
    example: "2024-01-01T00:00:00.000Z",
    description: "When the message was updated",
  })
  updatedAt: string;

  @ApiPropertyOptional({
    type: () => UserDto,
    description: "User who sent the message",
  })
  sender?: UserDto;
}

export class ChatDto {
  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Chat ID",
  })
  id: string;

  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440001",
    description: "ID of the first participant",
  })
  participantOneId: string;

  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440002",
    description: "ID of the second participant",
  })
  participantTwoId: string;

  @ApiPropertyOptional({
    example: "550e8400-e29b-41d4-a716-446655440003",
    description: "ID of the last message",
  })
  lastMessageId?: string;

  @ApiPropertyOptional({
    example: false,
    description: "Whether participant one has archived the chat",
  })
  archivedByParticipantOne?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: "Whether participant two has archived the chat",
  })
  archivedByParticipantTwo?: boolean;

  @ApiProperty({
    example: "2024-01-01T00:00:00.000Z",
    description: "When the conversation was created",
  })
  createdAt: string;

  @ApiProperty({
    example: "2024-01-01T00:00:00.000Z",
    description: "When the conversation was updated",
  })
  updatedAt: string;

  @ApiPropertyOptional({
    type: () => ChatMessageDto,
    description: "Last message sent in the chat",
  })
  lastMessage?: ChatMessageDto;

  @ApiPropertyOptional({
    type: () => [ChatMessageDto],
    description: "Messages in this chat",
  })
  messages?: ChatMessageDto[];

  @ApiPropertyOptional({
    type: () => UserDto,
    description: "First participant user",
  })
  participantOne?: UserDto;

  @ApiPropertyOptional({
    type: () => UserDto,
    description: "Second participant user",
  })
  participantTwo?: UserDto;
}

export class ChatListDto extends ListQueryDto<ChatDto> {}

export class ChatSingleDto extends SingleQueryDto<ChatDto> {}

export class ChatMessageListDto extends ListQueryDto<ChatMessageDto> {}
