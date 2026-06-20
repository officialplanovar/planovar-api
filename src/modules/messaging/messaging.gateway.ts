import { Inject, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { auth } from '../../auth/auth.config';
import { MessagingService } from './messaging.service';
import { MessageType } from '@prisma/client';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(MessagingGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(MessagingService) private readonly messagingService: MessagingService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      // Resolve session from handshake headers (cookie / mobile Authorization)
      // or the socket.io `auth.token` option (browsers can't set WS headers).
      const headers = new Headers(
        client.handshake.headers as Record<string, string>,
      );
      const authToken = (
        client.handshake.auth as { token?: string } | undefined
      )?.token;
      if (authToken) headers.set('authorization', `Bearer ${authToken}`);

      const session = await auth.api.getSession({ headers });

      if (!session?.user) {
        client.emit('error', { message: 'Unauthorized' });
        client.disconnect(true);
        return;
      }

      client.data.userId = session.user.id;
      client.emit('connected', { userId: session.user.id });
      this.logger.log(`Client connected: ${session.user.id}`);
    } catch (err) {
      this.logger.error('Connection error', err);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.data.userId ?? client.id}`);
  }

  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ): Promise<void> {
    const userId: string = client.data.userId;
    const { conversationId } = payload;

    const ok = await this.messagingService.isParticipant(conversationId, userId);
    if (!ok) {
      client.emit('error', { message: 'Not a participant in this conversation' });
      return;
    }

    await client.join(conversationId);
    client.emit('joined', { conversationId });
  }

  @SubscribeMessage('leave')
  async handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ): Promise<void> {
    await client.leave(payload.conversationId);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      conversationId: string;
      content?: string;
      type?: MessageType;
      voiceUrl?: string;
      voiceDuration?: number;
      quoteId?: string;
      attachments?: Array<{
        url: string;
        publicId?: string;
        fileName?: string;
        fileType: string;
        fileSize: number;
      }>;
    },
  ) {
    const userId: string = client.data.userId;

    const savedMessage = await this.messagingService.sendMessage(
      payload.conversationId,
      userId,
      {
        content: payload.content,
        type: payload.type ?? MessageType.TEXT,
        voiceUrl: payload.voiceUrl,
        voiceDuration: payload.voiceDuration,
        quoteId: payload.quoteId,
        attachments: payload.attachments,
      },
    );

    this.server.to(payload.conversationId).emit('message', savedMessage);
    return savedMessage;
  }

  // ─── Voice-call signaling (relay only; media is handled by LiveKit) ────────

  @SubscribeMessage('call:invite')
  handleCallInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; roomName?: string },
  ): void {
    const userId: string = client.data.userId;
    // Ring the other participant(s) in the room.
    client.to(payload.conversationId).emit('call:incoming', {
      conversationId: payload.conversationId,
      roomName: payload.roomName,
      fromUserId: userId,
    });
  }

  @SubscribeMessage('call:end')
  handleCallEnd(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ): void {
    client.to(payload.conversationId).emit('call:ended', {
      conversationId: payload.conversationId,
    });
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; isTyping: boolean },
  ): void {
    const userId: string = client.data.userId;
    client.to(payload.conversationId).emit('typing', {
      userId,
      isTyping: payload.isTyping,
    });
  }

  @SubscribeMessage('read')
  async handleRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ): Promise<void> {
    const userId: string = client.data.userId;
    await this.messagingService.markRead(payload.conversationId, userId);
    this.server.to(payload.conversationId).emit('read', { userId });
  }
}
