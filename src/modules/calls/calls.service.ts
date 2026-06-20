import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';
import { SubscriptionTier } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MessagingService } from '../messaging/messaging.service';

/**
 * LiveKit voice calls. Gated to GOLD-tier vendors (and their clients) per the
 * subscription model. Issues a short-lived room token; the room is keyed by
 * conversation so both parties join the same room.
 */
@Injectable()
export class CallsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(MessagingService) private readonly messaging: MessagingService,
  ) {}

  async createToken(userId: string, conversationId: string) {
    const isParticipant = await this.messaging.isParticipant(
      conversationId,
      userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException('Not a participant in this conversation');
    }

    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, vendor: { select: { subscriptionTier: true } } },
    });
    if (!conv) throw new NotFoundException('Conversation not found');

    // Voice is a Gold-tier perk (the vendor must be on Gold).
    if (conv.vendor?.subscriptionTier !== SubscriptionTier.GOLD) {
      throw new ForbiddenException(
        'Voice calling is available on the Gold plan only',
      );
    }

    const url = this.config.get<string>('LIVEKIT_URL');
    const apiKey = this.config.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.config.get<string>('LIVEKIT_API_SECRET');
    if (!url || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException(
        'Voice calling is not configured (LIVEKIT_* env missing)',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const roomName = `conv_${conversationId}`;
    const at = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: user?.name ?? 'User',
      ttl: '1h',
    });
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    return { url, token: await at.toJwt(), roomName };
  }
}
