import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LoggerService } from '@/common/logger/logger.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ServerGateway implements OnGatewayInit {
    @WebSocketServer()
    server: Server;

    private readonly logger = new LoggerService(ServerGateway.name);
    private static instance: ServerGateway;

    afterInit(server: Server) { 
        this.logger.log('🚀 Server Gateway initialized');
        ServerGateway.instance = this;
    }

    handleConnection(client: Socket) {
        this.logger.log(`🔌 Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`🔌 Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinUserRoom')
    handleJoinUserRoom(
        @MessageBody('userId') userId: number,
        @ConnectedSocket() client: Socket
    ) {
        const userRoom = `user_${userId}`;
        client.join(userRoom);
        this.logger.log(`👤 User ${userId} joined room: ${userRoom}`);
        return { success: true, message: `Joined user room ${userId}` };
    }

    @SubscribeMessage('leaveUserRoom')
    handleLeaveUserRoom(
        @MessageBody('userId') userId: number,
        @ConnectedSocket() client: Socket
    ) {
        const userRoom = `user_${userId}`;
        client.leave(userRoom);
        this.logger.log(`👤 User ${userId} left room: ${userRoom}`);
        return { success: true, message: `Left user room ${userId}` };
    }

} 