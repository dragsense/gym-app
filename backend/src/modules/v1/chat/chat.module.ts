import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { BaseChatModule } from '@/common/base-chat/base-chat.module';
import { ServerGatewayModule } from '@/common/gateways/server-gateway.module';

@Module({
  imports: [BaseChatModule, ServerGatewayModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}


