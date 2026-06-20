"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let PayoutsService = class PayoutsService {
    prisma;
    config;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    get paystackSecret() {
        return this.config.getOrThrow('PAYSTACK_SECRET_KEY');
    }
    paystackHeaders() {
        return {
            Authorization: `Bearer ${this.paystackSecret}`,
            'Content-Type': 'application/json',
        };
    }
    async listForVendor(userId) {
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor profile not found');
        return this.prisma.payout.findMany({
            where: { vendorId: vendor.id },
            orderBy: { scheduledAt: 'desc' },
            select: {
                id: true,
                amount: true,
                status: true,
                scheduledAt: true,
                processedAt: true,
                paystackTransferCode: true,
                failureReason: true,
                createdAt: true,
                _count: { select: { lineItems: true } },
            },
        });
    }
    async getOne(payoutId, userId) {
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor profile not found');
        const payout = await this.prisma.payout.findUnique({
            where: { id: payoutId },
            select: {
                id: true,
                vendorId: true,
                amount: true,
                status: true,
                scheduledAt: true,
                processedAt: true,
                paystackTransferCode: true,
                failureReason: true,
                createdAt: true,
                lineItems: {
                    select: {
                        id: true,
                        amount: true,
                        commissionRate: true,
                        transaction: {
                            select: {
                                id: true,
                                amount: true,
                                paystackReference: true,
                            },
                        },
                    },
                },
            },
        });
        if (!payout)
            throw new common_1.NotFoundException('Payout not found');
        if (payout.vendorId !== vendor.id) {
            throw new common_1.UnauthorizedException('You do not own this payout');
        }
        return payout;
    }
    async listPending() {
        return this.prisma.payout.findMany({
            where: { status: client_1.PayoutStatus.PENDING },
            orderBy: { scheduledAt: 'asc' },
            select: {
                id: true,
                amount: true,
                status: true,
                scheduledAt: true,
                createdAt: true,
                vendor: {
                    select: {
                        id: true,
                        businessName: true,
                        bankCode: true,
                        bankAccount: true,
                        paystackRecipientCode: true,
                        user: { select: { id: true, email: true, name: true } },
                    },
                },
                _count: { select: { lineItems: true } },
            },
        });
    }
    async processPayout(payoutId) {
        const payout = await this.prisma.payout.findUnique({
            where: { id: payoutId },
            select: {
                id: true,
                amount: true,
                status: true,
                vendor: {
                    select: {
                        id: true,
                        businessName: true,
                        bankCode: true,
                        bankAccount: true,
                        paystackRecipientCode: true,
                    },
                },
            },
        });
        if (!payout)
            throw new common_1.NotFoundException('Payout not found');
        if (payout.status !== client_1.PayoutStatus.PENDING) {
            throw new common_1.BadRequestException(`Payout is already ${payout.status}`);
        }
        const { vendor } = payout;
        if (!vendor.bankCode || !vendor.bankAccount) {
            throw new common_1.BadRequestException('Vendor has not configured bank account details');
        }
        try {
            let recipientCode = vendor.paystackRecipientCode;
            if (!recipientCode) {
                const recipientRes = await fetch('https://api.paystack.co/transferrecipient', {
                    method: 'POST',
                    headers: this.paystackHeaders(),
                    body: JSON.stringify({
                        type: 'nuban',
                        name: vendor.businessName,
                        account_number: vendor.bankAccount,
                        bank_code: vendor.bankCode,
                        currency: 'NGN',
                    }),
                });
                const recipientData = await recipientRes.json();
                if (!recipientData.status) {
                    throw new common_1.BadRequestException(`Failed to create Paystack recipient: ${recipientData.message}`);
                }
                recipientCode = recipientData.data.recipient_code;
                await this.prisma.vendorProfile.update({
                    where: { id: vendor.id },
                    data: { paystackRecipientCode: recipientCode },
                });
            }
            const amountInKobo = Math.round(Number(payout.amount) * 100);
            const transferRes = await fetch('https://api.paystack.co/transfer', {
                method: 'POST',
                headers: this.paystackHeaders(),
                body: JSON.stringify({
                    source: 'balance',
                    amount: amountInKobo,
                    recipient: recipientCode,
                    reason: 'Planovar vendor payout',
                }),
            });
            const transferData = await transferRes.json();
            if (!transferData.status) {
                throw new common_1.BadRequestException(`Paystack transfer failed: ${transferData.message}`);
            }
            const transferCode = transferData.data.transfer_code;
            await this.prisma.payout.update({
                where: { id: payoutId },
                data: {
                    status: client_1.PayoutStatus.PROCESSING,
                    paystackTransferCode: transferCode,
                },
            });
            return transferCode;
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException)
                throw err;
            await this.prisma.payout.update({
                where: { id: payoutId },
                data: {
                    status: client_1.PayoutStatus.FAILED,
                    failureReason: err instanceof Error ? err.message : 'Unknown error',
                },
            });
            throw new common_1.InternalServerErrorException('Payout processing failed');
        }
    }
    async updateBankDetails(userId, dto) {
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { userId },
            select: { id: true, businessName: true },
        });
        if (!vendor)
            throw new common_1.NotFoundException('Vendor profile not found');
        try {
            const res = await fetch('https://api.paystack.co/transferrecipient', {
                method: 'POST',
                headers: this.paystackHeaders(),
                body: JSON.stringify({
                    type: 'nuban',
                    name: dto.accountName,
                    account_number: dto.bankAccount,
                    bank_code: dto.bankCode,
                    currency: 'NGN',
                }),
            });
            const data = await res.json();
            if (!data.status) {
                throw new common_1.BadRequestException(`Bank verification failed: ${data.message}`);
            }
            const recipientCode = data.data.recipient_code;
            const updated = await this.prisma.vendorProfile.update({
                where: { id: vendor.id },
                data: {
                    bankCode: dto.bankCode,
                    bankAccount: dto.bankAccount,
                    paystackRecipientCode: recipientCode,
                },
                select: {
                    id: true,
                    bankCode: true,
                    bankAccount: true,
                    paystackRecipientCode: true,
                },
            });
            return updated;
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException)
                throw err;
            throw new common_1.InternalServerErrorException('Failed to verify bank account');
        }
    }
};
exports.PayoutsService = PayoutsService;
exports.PayoutsService = PayoutsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(config_1.ConfigService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], PayoutsService);
//# sourceMappingURL=payouts.service.js.map