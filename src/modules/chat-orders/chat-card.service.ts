import { Inject, Injectable } from '@nestjs/common';
import { MessageType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatRealtimeService } from '../../common/realtime/chat-realtime.service';

/**
 * Posts a STRUCTURED CARD message into a conversation (quote, invoice,
 * milestone-paid, order-request, etc.) and keeps the conversation's
 * lastMessageAt + per-participant unread counts in sync — the same side effects
 * as MessagingService.sendMessage, but for the richer card message types.
 *
 * `post()` runs inside the caller's $transaction so the card and the domain
 * object it references are written atomically. AFTER the transaction commits,
 * call `broadcast()` with the returned message id(s) to push them to the
 * conversation room in realtime.
 */
@Injectable()
export class ChatCardService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ChatRealtimeService) private readonly realtime: ChatRealtimeService,
  ) {}

  /** Fetch a message with its full card payload and emit it to the room.
   *  Call post-commit. Best-effort — never throws into the caller. */
  async broadcast(messageId: string): Promise<void> {
    try {
      const msg = await this.prisma.message.findUnique({
        where: { id: messageId },
        include: {
          conversation: { select: { participants: { select: { userId: true } } } },
          sender: { select: { id: true, name: true, image: true } },
          attachments: true,
          quote: { include: { lineItems: { orderBy: { sortOrder: 'asc' } } } },
          invoice: {
            include: {
              lineItems: { orderBy: { sortOrder: 'asc' } },
              milestones: { orderBy: { sortOrder: 'asc' } },
            },
          },
          booking: {
            select: {
              id: true,
              status: true,
              fulfilmentType: true,
              finalAmount: true,
              listing: { select: { title: true } },
            },
          },
          todo: { include: { assignments: true } },
        },
      });
      if (msg) {
        this.realtime.emitMessage(
          msg.conversationId,
          msg,
          msg.conversation.participants.map((p) => p.userId),
        );
      }
    } catch {
      // realtime is best-effort; the message is already persisted.
    }
  }

  async broadcastMany(messageIds: string[]): Promise<void> {
    for (const id of messageIds) await this.broadcast(id);
  }

  async post(
    tx: Prisma.TransactionClient,
    args: {
      conversationId: string;
      senderId: string;
      type: MessageType;
      content?: string | null;
      quoteId?: string | null;
      invoiceId?: string | null;
      bookingId?: string | null;
      todoId?: string | null;
      metadata?: Prisma.InputJsonValue;
    },
  ) {
    const message = await tx.message.create({
      data: {
        conversationId: args.conversationId,
        senderId: args.senderId,
        type: args.type,
        content: args.content ?? null,
        quoteId: args.quoteId ?? null,
        invoiceId: args.invoiceId ?? null,
        bookingId: args.bookingId ?? null,
        todoId: args.todoId ?? null,
        metadata: args.metadata ?? Prisma.JsonNull,
      },
    });
    await tx.conversation.update({
      where: { id: args.conversationId },
      data: { lastMessageAt: new Date() },
    });
    await tx.conversationParticipant.updateMany({
      where: { conversationId: args.conversationId, userId: { not: args.senderId } },
      data: { unreadCount: { increment: 1 } },
    });
    return message;
  }
}
