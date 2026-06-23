"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
const email_service_1 = require("../../common/email/email.service");
const redis_service_1 = require("../../common/redis/redis.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    prisma;
    redis;
    config;
    email;
    subscriptions;
    logger = new common_1.Logger(PaymentsService_1.name);
    constructor(prisma, redis, config, email, subscriptions) {
        this.prisma = prisma;
        this.redis = redis;
        this.config = config;
        this.email = email;
        this.subscriptions = subscriptions;
    }
    async initiatePayment(userId, dto) {
        const installment = await this.prisma.paymentInstallment.findUnique({
            where: { id: dto.installmentId },
            include: {
                quote: {
                    include: {
                        booking: {
                            include: {
                                vendor: { select: { id: true, subscriptionTier: true } },
                                client: { select: { id: true, email: true, name: true } },
                            },
                        },
                    },
                },
            },
        });
        if (!installment)
            throw new common_1.NotFoundException('Installment not found');
        const booking = installment.quote.booking;
        if (booking.clientId !== userId) {
            throw new common_1.ForbiddenException('Only the booking client can initiate payment');
        }
        if (installment.status === client_1.InstallmentStatus.PAID) {
            throw new common_1.ConflictException('This installment has already been paid');
        }
        if (installment.status !== client_1.InstallmentStatus.PENDING &&
            installment.status !== client_1.InstallmentStatus.OVERDUE) {
            throw new common_1.ConflictException(`Cannot pay an installment with status ${installment.status}`);
        }
        const provider = dto.provider ?? 'paystack';
        const reference = `plnv_${Date.now()}_${dto.installmentId.slice(0, 8)}`;
        const amountInKobo = Math.round(installment.amount.toNumber() * 100);
        const clientEmail = booking.client.email;
        const transaction = await this.prisma.transaction.create({
            data: {
                bookingId: booking.id,
                installmentId: dto.installmentId,
                userId,
                type: client_1.TransactionType.PAYMENT,
                amount: installment.amount,
                currency: 'NGN',
                ...(provider === 'paystack'
                    ? { paystackReference: reference, paystackStatus: 'pending' }
                    : { flutterwaveReference: reference }),
                metadata: {
                    installmentId: dto.installmentId,
                    bookingId: booking.id,
                    provider,
                },
            },
        });
        if (provider === 'paystack') {
            const paystackSecretKey = this.config.get('PAYSTACK_SECRET_KEY');
            const payload = {
                email: clientEmail,
                amount: amountInKobo,
                reference,
                metadata: {
                    installmentId: dto.installmentId,
                    bookingId: booking.id,
                    transactionId: transaction.id,
                },
            };
            if (dto.callbackUrl)
                payload.callback_url = dto.callbackUrl;
            const res = await fetch('https://api.paystack.co/transaction/initialize', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${paystackSecretKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.text();
                this.logger.error(`Paystack init failed: ${err}`);
                await this.prisma.transaction.delete({ where: { id: transaction.id } }).catch(() => null);
                throw new common_1.ConflictException('Payment provider error — please try again');
            }
            const data = (await res.json());
            return {
                authorizationUrl: data.data.authorization_url,
                reference: data.data.reference,
                transactionId: transaction.id,
            };
        }
        const flwSecretKey = this.config.get('FLUTTERWAVE_SECRET_KEY');
        const flwPayload = {
            tx_ref: reference,
            amount: installment.amount.toNumber(),
            currency: 'NGN',
            redirect_url: dto.callbackUrl ?? this.config.get('PAYMENT_REDIRECT_URL', 'https://planovar.com/payment/callback'),
            customer: {
                email: clientEmail,
                name: booking.client.name ?? 'Customer',
            },
            meta: {
                installmentId: dto.installmentId,
                bookingId: booking.id,
                transactionId: transaction.id,
            },
        };
        const flwRes = await fetch('https://api.flutterwave.com/v3/payments', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${flwSecretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(flwPayload),
        });
        if (!flwRes.ok) {
            const err = await flwRes.text();
            this.logger.error(`Flutterwave init failed: ${err}`);
            await this.prisma.transaction.delete({ where: { id: transaction.id } }).catch(() => null);
            throw new common_1.ConflictException('Payment provider error — please try again');
        }
        const flwData = (await flwRes.json());
        return {
            authorizationUrl: flwData.data.link,
            reference,
            transactionId: transaction.id,
        };
    }
    async verifyPayment(dto) {
        const provider = dto.provider ?? 'paystack';
        if (provider === 'paystack') {
            const paystackSecretKey = this.config.get('PAYSTACK_SECRET_KEY');
            const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(dto.reference)}`, {
                headers: { Authorization: `Bearer ${paystackSecretKey}` },
            });
            if (!res.ok)
                throw new common_1.NotFoundException('Transaction not found on Paystack');
            const data = (await res.json());
            return { provider: 'paystack', status: data.data.status, data: data.data };
        }
        const flwSecretKey = this.config.get('FLUTTERWAVE_SECRET_KEY');
        const res = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(dto.reference)}`, { headers: { Authorization: `Bearer ${flwSecretKey}` } });
        if (!res.ok)
            throw new common_1.NotFoundException('Transaction not found on Flutterwave');
        const data = (await res.json());
        return { provider: 'flutterwave', status: data.data.status, data: data.data };
    }
    async handlePaystackWebhook(rawBody, signature) {
        const secret = this.config.get('PAYSTACK_SECRET_KEY', '');
        const expectedSig = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
        if (expectedSig !== signature) {
            throw new common_1.UnauthorizedException('Invalid Paystack webhook signature');
        }
        let event;
        try {
            event = JSON.parse(rawBody.toString('utf8'));
        }
        catch (err) {
            this.logger.error('Failed to parse Paystack webhook body', err);
            return;
        }
        const SUBSCRIPTION_EVENTS = new Set([
            'subscription.create',
            'invoice.update',
            'invoice.payment_failed',
            'subscription.disable',
            'subscription.not_renew',
        ]);
        if (SUBSCRIPTION_EVENTS.has(event.event)) {
            await this.subscriptions.handleSubscriptionWebhook(event);
            return;
        }
        if (event.event !== 'charge.success')
            return;
        const reference = event.data.reference;
        if (!reference)
            return;
        try {
            const transaction = await this.prisma.transaction.findUnique({
                where: { paystackReference: reference },
            });
            if (!transaction) {
                this.logger.warn(`Paystack webhook: no transaction found for reference ${reference}`);
                return;
            }
            if (transaction.paystackStatus === 'success') {
                this.logger.log(`Paystack webhook: transaction ${transaction.id} already processed`);
                return;
            }
            await this.prisma.transaction.update({
                where: { id: transaction.id },
                data: { paystackStatus: 'success' },
            });
            await this.processSuccessfulPayment(transaction);
        }
        catch (err) {
            this.logger.error(`Paystack webhook processing error for reference ${reference}`, err);
        }
    }
    async handleFlutterwaveWebhook(rawBody, signature) {
        const expectedHash = this.config.get('FLUTTERWAVE_SECRET_HASH', '');
        if (signature !== expectedHash) {
            throw new common_1.UnauthorizedException('Invalid Flutterwave webhook signature');
        }
        let event;
        try {
            event = JSON.parse(rawBody.toString('utf8'));
        }
        catch (err) {
            this.logger.error('Failed to parse Flutterwave webhook body', err);
            return;
        }
        if (event.event !== 'charge.completed')
            return;
        if (event.data.status !== 'successful')
            return;
        const txRef = event.data.tx_ref;
        if (!txRef)
            return;
        try {
            const transaction = await this.prisma.transaction.findUnique({
                where: { flutterwaveReference: txRef },
            });
            if (!transaction) {
                this.logger.warn(`Flutterwave webhook: no transaction found for tx_ref ${txRef}`);
                return;
            }
            const meta = transaction.metadata;
            if (meta?.flwProcessed === true) {
                this.logger.log(`Flutterwave webhook: transaction ${transaction.id} already processed`);
                return;
            }
            await this.prisma.transaction.update({
                where: { id: transaction.id },
                data: { metadata: { ...(meta ?? {}), flwProcessed: true } },
            });
            await this.processSuccessfulPayment(transaction);
        }
        catch (err) {
            this.logger.error(`Flutterwave webhook processing error for tx_ref ${txRef}`, err);
        }
    }
    async processSuccessfulPayment(transaction) {
        if (!transaction.installmentId) {
            this.logger.log(`Transaction ${transaction.id} has no installmentId — skipping installment logic`);
            return;
        }
        const installment = await this.prisma.paymentInstallment.findUnique({
            where: { id: transaction.installmentId },
            include: {
                quote: {
                    include: {
                        installments: true,
                        booking: {
                            include: {
                                vendor: {
                                    select: {
                                        id: true,
                                        subscriptionTier: true,
                                        userId: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!installment) {
            this.logger.error(`processSuccessfulPayment: installment ${transaction.installmentId} not found`);
            return;
        }
        const booking = installment.quote.booking;
        const vendor = booking.vendor;
        const amount = transaction.amount.toNumber();
        await this.prisma.paymentInstallment.update({
            where: { id: installment.id },
            data: {
                status: client_1.InstallmentStatus.PAID,
                paidAt: new Date(),
            },
        });
        const commissionConfig = await this.prisma.commissionConfig.findUnique({
            where: { tier: vendor.subscriptionTier },
        });
        const commissionRate = commissionConfig?.rate.toNumber() ?? 0.08;
        const platformFee = amount * commissionRate;
        const vendorAmount = amount - platformFee;
        if (installment.type === client_1.InstallmentType.ESCROW) {
            await this.prisma.escrowHold.create({
                data: {
                    bookingId: booking.id,
                    installmentId: installment.id,
                    amount: new client_1.Prisma.Decimal(amount),
                    status: client_1.EscrowStatus.HELD,
                    heldAt: new Date(),
                },
            });
            this.logger.log(`Escrow hold created for installment ${installment.id}, amount: ${amount}`);
        }
        else {
            await this.prisma.booking.update({
                where: { id: booking.id },
                data: {
                    finalAmount: { increment: new client_1.Prisma.Decimal(amount) },
                    platformFee: { increment: new client_1.Prisma.Decimal(platformFee) },
                    vendorPayout: { increment: new client_1.Prisma.Decimal(vendorAmount) },
                },
            });
            const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const payout = await this.prisma.payout.create({
                data: {
                    vendorId: vendor.id,
                    amount: new client_1.Prisma.Decimal(vendorAmount),
                    status: client_1.PayoutStatus.PENDING,
                    scheduledAt,
                },
            });
            await this.prisma.payoutLineItem.create({
                data: {
                    payoutId: payout.id,
                    transactionId: transaction.id,
                    amount: new client_1.Prisma.Decimal(vendorAmount),
                    commissionRate: new client_1.Prisma.Decimal(commissionRate),
                },
            });
            this.logger.log(`Payout ${payout.id} scheduled for vendor ${vendor.id} at ${scheduledAt.toISOString()}`);
        }
        const allInstallments = await this.prisma.paymentInstallment.findMany({
            where: { quoteId: installment.quoteId },
        });
        const allPaid = allInstallments.every((i) => i.status === client_1.InstallmentStatus.PAID);
        if (allPaid) {
            await this.prisma.booking.update({
                where: { id: booking.id },
                data: { status: client_1.BookingStatus.ACTIVE },
            });
            this.logger.log(`All installments paid — booking ${booking.id} set to ACTIVE`);
        }
    }
    async getInstallmentsForBooking(bookingId, userId) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                vendor: { select: { userId: true } },
            },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const isClient = booking.clientId === userId;
        const isVendor = booking.vendor.userId === userId;
        if (!isClient && !isVendor) {
            throw new common_1.ForbiddenException('You are not a participant of this booking');
        }
        const quote = await this.prisma.quote.findFirst({
            where: { bookingId },
            orderBy: { createdAt: 'desc' },
            include: {
                installments: { orderBy: { sortOrder: 'asc' } },
            },
        });
        if (!quote)
            throw new common_1.NotFoundException('No quote found for this booking');
        return quote.installments;
    }
    async releaseEscrow(escrowHoldId, userId) {
        const escrowHold = await this.prisma.escrowHold.findUnique({
            where: { id: escrowHoldId },
            include: {
                booking: {
                    include: {
                        vendor: { select: { id: true, subscriptionTier: true } },
                    },
                },
            },
        });
        if (!escrowHold)
            throw new common_1.NotFoundException('Escrow hold not found');
        if (escrowHold.status !== client_1.EscrowStatus.HELD) {
            throw new common_1.ConflictException(`Escrow hold has status ${escrowHold.status} — cannot release`);
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const isClient = escrowHold.booking.clientId === userId;
        const isAdmin = user.role === 'ADMIN';
        if (!isClient && !isAdmin) {
            throw new common_1.ForbiddenException('Only the booking client or an admin can release escrow');
        }
        const vendor = escrowHold.booking.vendor;
        const amount = escrowHold.amount.toNumber();
        const commissionConfig = await this.prisma.commissionConfig.findUnique({
            where: { tier: vendor.subscriptionTier },
        });
        const commissionRate = commissionConfig?.rate.toNumber() ?? 0.08;
        const platformFee = amount * commissionRate;
        const vendorAmount = amount - platformFee;
        const scheduledAt = new Date();
        const [updatedEscrow, payout] = await this.prisma.$transaction([
            this.prisma.escrowHold.update({
                where: { id: escrowHoldId },
                data: {
                    status: client_1.EscrowStatus.RELEASED,
                    releasedAt: new Date(),
                    releasedBy: userId,
                    releaseReason: isAdmin ? 'admin_release' : 'client_release',
                },
            }),
            this.prisma.payout.create({
                data: {
                    vendorId: vendor.id,
                    amount: new client_1.Prisma.Decimal(vendorAmount),
                    status: client_1.PayoutStatus.PENDING,
                    scheduledAt,
                },
            }),
        ]);
        await this.prisma.booking.update({
            where: { id: escrowHold.bookingId },
            data: {
                platformFee: { increment: new client_1.Prisma.Decimal(platformFee) },
                vendorPayout: { increment: new client_1.Prisma.Decimal(vendorAmount) },
            },
        });
        this.logger.log(`Escrow ${escrowHoldId} released by ${userId} — payout ${payout.id} created for vendor ${vendor.id}`);
        return {
            escrowHold: updatedEscrow,
            payout: { id: payout.id, amount: vendorAmount, scheduledAt },
        };
    }
    async getTransactionHistory(userId, take = 20, skip = 0) {
        const [transactions, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take,
                skip,
                include: {
                    booking: {
                        select: { id: true, eventDate: true },
                    },
                    installment: {
                        select: { id: true, label: true, type: true },
                    },
                },
            }),
            this.prisma.transaction.count({ where: { userId } }),
        ]);
        return {
            data: transactions,
            meta: {
                total,
                take,
                skip,
                hasMore: skip + take < total,
            },
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(redis_service_1.RedisService)),
    __param(2, (0, common_1.Inject)(config_1.ConfigService)),
    __param(3, (0, common_1.Inject)(email_service_1.EmailService)),
    __param(4, (0, common_1.Inject)(subscriptions_service_1.SubscriptionsService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        config_1.ConfigService,
        email_service_1.EmailService,
        subscriptions_service_1.SubscriptionsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map