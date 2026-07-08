import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

/**
 * Bridges non-gateway code (the chat-order services) to the socket server so
 * structured card messages can be pushed to a conversation room in realtime.
 * The MessagingGateway registers its Server instance here on init.
 */
@Injectable()
export class ChatRealtimeService {
  private readonly logger = new Logger(ChatRealtimeService.name);
  private server?: Server;

  setServer(server: Server): void {
    this.server = server;
  }

  /** Room name for a user's personal room (all their devices/screens). */
  static userRoom(userId: string): string {
    return `user:${userId}`;
  }

  /** Emit a 'message' event to the conversation room AND to each participant's
   *  personal room — so screens that aren't in the conversation room (the
   *  conversation list, a brand-new conversation) still update live. No-op if
   *  the socket server isn't up yet (e.g. cron/headless contexts). */
  emitMessage(
    conversationId: string,
    message: unknown,
    participantUserIds: string[] = [],
  ): void {
    if (!this.server) return;
    this.server.to(conversationId).emit('message', message);
    for (const userId of participantUserIds) {
      this.server.to(ChatRealtimeService.userRoom(userId)).emit('message', message);
    }
  }
}
