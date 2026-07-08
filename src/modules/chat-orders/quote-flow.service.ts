import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MessageType,
  NotificationType,
  Prisma,
  QuoteStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ChatCardService } from './chat-card.service';
import { InvoiceService } from './invoice.service';
import { ReviseQuoteDto } from './dto/revise-quote.dto';
import { SendQuoteDto } from './dto/send-quote.dto';

/**
 * The chat-centric quote lifecycle:
 *   sendQuote → (client negotiates in free text) → reviseQuote (new version,
 *   supersedes the previous, history preserved) → acceptQuote (materializes an
 *   invoice + booking) | declineQuote. Quotes live as structured messages in a
 *   DM conversation between one client and one vendor.
 */
@Injectable()
export class QuoteFlowService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ChatCardService) private readonly cards: ChatCardService,
    @Inject(InvoiceService) private readonly invoices: InvoiceService,
    @Inject(NotificationsService)
    private readonly notifications: NotificationsService,
  ) {}

  private quoteNumber(): string {
    return `QT-${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 1e4,
    )
      .toString()
      .padStart(4, '0')}`;
  }

  private async vendorFor(userId: string) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      select: { id: true, userId: true, businessName: true },
    });
    if (!vendor) throw new NotFoundException('Vendor profile not found');
    return vendor;
  }

  /** Find or create the DM conversation between this client and vendor. */
  private async getOrCreateDirect(
    clientId: string,
    vendor: { id: string; userId: string },
  ) {
    const existing = await this.prisma.conversation.findFirst({
      where: { type: 'DIRECT', clientId, vendorId: vendor.id },
      select: { id: true },
    });
    if (existing) return existing.id;

    const created = await this.prisma.conversation.create({
      data: {
        type: 'DIRECT',
        clientId,
        vendorId: vendor.id,
        participants: {
          create: [{ userId: clientId }, { userId: vendor.userId }],
        },
      },
      select: { id: true },
    });
    return created.id;
  }

  private validateTerms(terms?: { percentage: number }[]) {
    if (!terms?.length) return;
    const sum = terms.reduce((acc, t) => acc + t.percentage, 0);
    if (Math.round(sum) !== 100) {
      throw new BadRequestException(
        `Payment term percentages must sum to 100 (got ${sum})`,
      );
    }
  }

  // ── Send (v1) ─────────────────────────────────────────────────────────────

  async sendQuote(vendorUserId: string, dto: SendQuoteDto) {
    const vendor = await this.vendorFor(vendorUserId);
    this.validateTerms(dto.paymentTerms);

    const conversationId = await this.getOrCreateDirect(dto.clientId, vendor);
    const total = dto.lineItems.reduce((s, li) => s + li.amount, 0);
    const validUntil = dto.validUntil
      ? new Date(dto.validUntil)
      : new Date(Date.now() + (dto.validForDays ?? 7) * 86_400_000);

    const result = await this.prisma.$transaction(async (tx) => {
      const quote = await tx.quote.create({
        data: {
          quoteNumber: this.quoteNumber(),
          vendorId: vendor.id,
          clientId: dto.clientId,
          conversationId,
          listingId: dto.listingId,
          eventId: dto.eventId ?? null,
          amount: new Prisma.Decimal(total),
          description: dto.description ?? null,
          notes: dto.notes ?? null,
          paymentTerms: dto.paymentTerms
            ? (dto.paymentTerms as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          validUntil,
          status: QuoteStatus.PENDING,
          version: 1,
          isActive: true,
          lineItems: {
            create: dto.lineItems.map((li, i) => ({
              label: li.label,
              amount: new Prisma.Decimal(li.amount),
              sortOrder: i,
            })),
          },
        },
        include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
      });

      const message = await this.cards.post(tx, {
        conversationId,
        senderId: vendorUserId,
        type: MessageType.QUOTE,
        quoteId: quote.id,
        content: dto.description ?? null,
        metadata: { amount: String(total), version: '1' },
      });
      return { quote, message };
    });

    await this.cards.broadcast(result.message.id);
    void this.notifications
      .create(
        dto.clientId,
        NotificationType.QUOTE_RECEIVED,
        'New quote received',
        `${vendor.businessName} sent you a quote — ₦${total.toLocaleString()}`,
        { quoteId: result.quote.id },
      )
      .catch(() => void 0);

    return result;
  }

  // ── Revise (v+1) ──────────────────────────────────────────────────────────

  async reviseQuote(vendorUserId: string, quoteId: string, dto: ReviseQuoteDto) {
    const vendor = await this.vendorFor(vendorUserId);
    const current = await this.prisma.quote.findUnique({
      where: { id: quoteId },
    });
    if (!current) throw new NotFoundException('Quote not found');
    if (current.vendorId !== vendor.id) {
      throw new ForbiddenException('Not your quote');
    }
    if (!current.isActive) {
      throw new ConflictException(
        'Only the active quote can be revised — this one was superseded, accepted or declined',
      );
    }
    if (!current.conversationId || !current.clientId) {
      throw new BadRequestException('Quote is not attached to a conversation');
    }
    this.validateTerms(dto.paymentTerms);

    const total = dto.lineItems.reduce((s, li) => s + li.amount, 0);
    const validUntil = dto.validUntil
      ? new Date(dto.validUntil)
      : current.validUntil;

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.quote.update({
        where: { id: current.id },
        data: { status: QuoteStatus.SUPERSEDED, isActive: false },
      });

      const quote = await tx.quote.create({
        data: {
          quoteNumber: this.quoteNumber(),
          vendorId: vendor.id,
          clientId: current.clientId,
          conversationId: current.conversationId,
          listingId: current.listingId,
          eventId: current.eventId,
          amount: new Prisma.Decimal(total),
          description: dto.description ?? current.description,
          notes: dto.notes ?? null,
          paymentTerms: dto.paymentTerms
            ? (dto.paymentTerms as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          validUntil,
          status: QuoteStatus.PENDING,
          version: current.version + 1,
          isActive: true,
          parentQuoteId: current.id,
          lineItems: {
            create: dto.lineItems.map((li, i) => ({
              label: li.label,
              amount: new Prisma.Decimal(li.amount),
              sortOrder: i,
            })),
          },
        },
        include: { lineItems: { orderBy: { sortOrder: 'asc' } } },
      });

      const message = await this.cards.post(tx, {
        conversationId: current.conversationId!,
        senderId: vendorUserId,
        type: MessageType.QUOTE_REVISED,
        quoteId: quote.id,
        content: dto.description ?? null,
        metadata: { amount: String(total), version: String(quote.version) },
      });
      return { quote, message };
    });

    await this.cards.broadcast(result.message.id);
    void this.notifications
      .create(
        current.clientId,
        NotificationType.QUOTE_RECEIVED,
        'Quote updated',
        `${vendor.businessName} sent a revised quote (v${result.quote.version}) — ₦${total.toLocaleString()}`,
        { quoteId: result.quote.id },
      )
      .catch(() => void 0);

    return result;
  }

  // ── Accept → invoice ──────────────────────────────────────────────────────

  async acceptQuote(clientUserId: string, quoteId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        lineItems: { orderBy: { sortOrder: 'asc' } },
        vendor: { select: { userId: true, businessName: true } },
      },
    });
    if (!quote) throw new NotFoundException('Quote not found');
    if (quote.clientId !== clientUserId) {
      throw new ForbiddenException('Not your quote');
    }
    if (!quote.isActive || quote.status !== QuoteStatus.PENDING) {
      throw new ConflictException('This quote can no longer be accepted');
    }
    if (quote.validUntil < new Date()) {
      await this.prisma.quote.update({
        where: { id: quote.id },
        data: { status: QuoteStatus.EXPIRED, isActive: false },
      });
      throw new ConflictException(
        'This quote has expired — ask the vendor to re-issue it',
      );
    }
    if (!quote.conversationId) {
      throw new BadRequestException('Quote is not attached to a conversation');
    }

    const { invoice, cardIds } = await this.prisma.$transaction(async (tx) => {
      await tx.quote.update({
        where: { id: quote.id },
        data: {
          status: QuoteStatus.ACCEPTED,
          isActive: false,
          isLocked: true,
          lockedAt: new Date(),
        },
      });

      const inv = await this.invoices.createFromQuoteTx(tx, {
        id: quote.id,
        clientId: quote.clientId,
        vendorId: quote.vendorId,
        listingId: quote.listingId,
        eventId: quote.eventId,
        conversationId: quote.conversationId,
        amount: quote.amount,
        paymentTerms: quote.paymentTerms,
        lineItems: quote.lineItems.map((li) => ({
          label: li.label,
          amount: li.amount,
          sortOrder: li.sortOrder,
        })),
      });

      const acceptedCard = await this.cards.post(tx, {
        conversationId: quote.conversationId!,
        senderId: clientUserId,
        type: MessageType.QUOTE_ACCEPTED,
        quoteId: quote.id,
      });
      const invoiceCard = await this.cards.post(tx, {
        conversationId: quote.conversationId!,
        senderId: quote.vendor.userId,
        type: MessageType.INVOICE,
        invoiceId: inv.id,
        bookingId: inv.bookingId,
        metadata: {
          invoiceNumber: inv.invoiceNumber,
          total: inv.total.toString(),
        },
      });
      return { invoice: inv, cardIds: [acceptedCard.id, invoiceCard.id] };
    });

    await this.cards.broadcastMany(cardIds);
    void this.notifications
      .create(
        quote.vendor.userId,
        NotificationType.QUOTE_ACCEPTED,
        'Quote accepted 🎉',
        `Your ₦${quote.amount.toNumber().toLocaleString()} quote was accepted — invoice ${invoice.invoiceNumber} created`,
        { quoteId: quote.id, invoiceId: invoice.id },
      )
      .catch(() => void 0);

    return invoice;
  }

  // ── Decline ───────────────────────────────────────────────────────────────

  async declineQuote(clientUserId: string, quoteId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id: quoteId },
      include: { vendor: { select: { userId: true } } },
    });
    if (!quote) throw new NotFoundException('Quote not found');
    if (quote.clientId !== clientUserId) {
      throw new ForbiddenException('Not your quote');
    }
    if (!quote.isActive || quote.status !== QuoteStatus.PENDING) {
      throw new ConflictException('This quote can no longer be declined');
    }

    const { updated, cardId } = await this.prisma.$transaction(async (tx) => {
      const q = await tx.quote.update({
        where: { id: quote.id },
        data: { status: QuoteStatus.REJECTED, isActive: false },
      });
      let cid: string | null = null;
      if (quote.conversationId) {
        const card = await this.cards.post(tx, {
          conversationId: quote.conversationId,
          senderId: clientUserId,
          type: MessageType.QUOTE_DECLINED,
          quoteId: quote.id,
        });
        cid = card.id;
      }
      return { updated: q, cardId: cid };
    });

    if (cardId) await this.cards.broadcast(cardId);
    void this.notifications
      .create(
        quote.vendor.userId,
        NotificationType.QUOTE_REJECTED,
        'Quote declined',
        'A client declined your quote — the conversation stays open',
        { quoteId: quote.id },
      )
      .catch(() => void 0);

    return updated;
  }
}
