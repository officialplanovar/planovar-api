import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageType } from '@prisma/client';

@Injectable()
export class MessagingService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisService) private readonly redis: RedisService,
  ) {}

  // ─── Conversations ────────────────────────────────────────────────────────

  async createDirectConversation(
    clientId: string,
    vendorId: string,
    bookingId?: string,
  ) {
    // Check for existing conversation
    if (bookingId) {
      const existing = await this.prisma.conversation.findFirst({
        where: { bookingId },
        include: { participants: true },
      });
      if (existing) return existing;
    } else {
      const existing = await this.prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          clientId,
          vendorId,
          bookingId: null,
        },
        include: { participants: true },
      });
      if (existing) return existing;
    }

    // Resolve vendor userId
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { userId: true },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    return this.prisma.conversation.create({
      data: {
        type: 'DIRECT',
        clientId,
        vendorId,
        bookingId: bookingId ?? null,
        participants: {
          create: [
            { userId: clientId },
            { userId: vendor.userId },
          ],
        },
      },
      include: { participants: true },
    });
  }

  async createGroupConversation(
    clientId: string,
    eventId: string,
    groupName?: string,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { clientId: true },
    });
    if (!event) throw new NotFoundException('Event not found');
    if (event.clientId !== clientId) {
      throw new ForbiddenException('Event does not belong to you');
    }

    return this.prisma.conversation.create({
      data: {
        type: 'GROUP',
        clientId,
        eventId,
        groupName: groupName ?? null,
        participants: {
          create: [{ userId: clientId }],
        },
      },
      include: { participants: true },
    });
  }

  async addGroupParticipant(
    conversationId: string,
    requesterId: string,
    userId: string,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.type !== 'GROUP') {
      throw new BadRequestException('Conversation is not a group');
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId === requesterId,
    );
    if (!isParticipant) throw new ForbiddenException('Not a participant');

    const alreadyPresent = conversation.participants.some(
      (p) => p.userId === userId,
    );
    if (alreadyPresent) return { message: 'Already a participant' };

    return this.prisma.conversationParticipant.create({
      data: { conversationId, userId },
    });
  }

  async listConversations(userId: string) {
    const participations = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              include: { user: { select: { id: true, name: true, image: true } } },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: { sender: { select: { id: true, name: true } } },
            },
          },
        },
      },
      orderBy: { conversation: { lastMessageAt: 'desc' } },
    });

    return participations.map((p) => ({
      ...p.conversation,
      unreadCount: p.unreadCount,
      lastMessage: p.conversation.messages[0] ?? null,
    }));
  }

  async getConversation(conversationId: string, userId: string) {
    await this.assertParticipant(conversationId, userId);

    return this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
          include: {
            sender: { select: { id: true, name: true, image: true } },
            attachments: true,
          },
        },
      },
    });
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    dto: SendMessageDto,
  ) {
    await this.assertParticipant(conversationId, senderId);

    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          conversationId,
          senderId,
          content: dto.content ?? null,
          type: dto.type ?? MessageType.TEXT,
          voiceUrl: dto.voiceUrl ?? null,
          voiceDuration: dto.voiceDuration ?? null,
          quoteId: dto.quoteId ?? null,
          attachments: dto.attachments?.length
            ? {
                create: dto.attachments.map((a) => ({
                  url: a.url,
                  publicId: a.publicId ?? null,
                  fileName: a.fileName ?? null,
                  fileType: a.fileType,
                  fileSize: a.fileSize,
                })),
              }
            : undefined,
        },
        include: {
          sender: { select: { id: true, name: true, image: true } },
          attachments: true,
        },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      }),
      this.prisma.conversationParticipant.updateMany({
        where: { conversationId, userId: { not: senderId } },
        data: { unreadCount: { increment: 1 } },
      }),
    ]);

    // Invalidate cached messages
    await this.redis.del(RedisService.keys.conversationMessages(conversationId));

    return message;
  }

  async markRead(conversationId: string, userId: string) {
    await this.assertParticipant(conversationId, userId);

    const now = new Date();

    const [, updated] = await this.prisma.$transaction([
      this.prisma.conversationParticipant.updateMany({
        where: { conversationId, userId },
        data: { unreadCount: 0, lastReadAt: now },
      }),
      this.prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: userId },
          isRead: false,
        },
        data: { isRead: true, readAt: now },
      }),
    ]);

    return { updated: updated.count };
  }

  async getMessages(
    conversationId: string,
    userId: string,
    take = 50,
    cursor?: string,
  ) {
    await this.assertParticipant(conversationId, userId);

    return this.prisma.message.findMany({
      where: {
        conversationId,
        ...(cursor ? { id: { lt: cursor } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        sender: { select: { id: true, name: true, image: true } },
        attachments: true,
      },
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const p = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    return !!p;
  }

  private async assertParticipant(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const ok = await this.isParticipant(conversationId, userId);
    if (!ok) throw new ForbiddenException('Not a participant in this conversation');
  }
}
