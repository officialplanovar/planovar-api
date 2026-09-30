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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
const templates_1 = require("./templates");
let EmailService = EmailService_1 = class EmailService {
    config;
    logger = new common_1.Logger(EmailService_1.name);
    resend = null;
    from;
    isDev;
    constructor(config) {
        this.config = config;
        const apiKey = config.get('RESEND_API_KEY');
        this.from = config.get('EMAIL_FROM', 'noreply@planovar.ng');
        this.isDev = config.get('NODE_ENV', 'development') !== 'production';
        if (apiKey) {
            this.resend = new resend_1.Resend(apiKey);
            this.logger.log('Email service ready (Resend)');
        }
        else {
            this.logger.warn('RESEND_API_KEY not set — emails will be logged to console only');
        }
    }
    async send(to, subject, html) {
        if (!this.resend) {
            this.logger.debug(`[EMAIL] To: ${Array.isArray(to) ? to.join(', ') : to}`);
            this.logger.debug(`[EMAIL] Subject: ${subject}`);
            return;
        }
        try {
            const { error } = await this.resend.emails.send({
                from: this.from,
                to: Array.isArray(to) ? to : [to],
                subject,
                html,
            });
            if (error) {
                this.logger.error(`Resend error for "${subject}"`, error);
            }
        }
        catch (err) {
            this.logger.error(`Failed to send email "${subject}"`, err);
        }
    }
    async sendOtp(email, otp, purpose) {
        if (this.isDev) {
            this.logger.log(`[OTP] ${purpose} → ${email}: ${otp}`);
        }
        const { subject, html } = templates_1.emailTemplates.otp(otp, purpose);
        await this.send(email, subject, html);
    }
    async sendWelcome(email, firstName, role) {
        const { subject, html } = templates_1.emailTemplates.welcome({ firstName, role });
        await this.send(email, subject, html);
    }
    async sendBookingRequest(vendorEmail, data) {
        const { subject, html } = templates_1.emailTemplates.bookingRequest(data);
        await this.send(vendorEmail, subject, html);
    }
    async sendBookingConfirmed(clientEmail, data) {
        const { subject, html } = templates_1.emailTemplates.bookingConfirmed(data);
        await this.send(clientEmail, subject, html);
    }
    async sendBookingCancelled(recipientEmail, data) {
        const { subject, html } = templates_1.emailTemplates.bookingCancelled(data);
        await this.send(recipientEmail, subject, html);
    }
    async sendQuoteReceived(clientEmail, data) {
        const { subject, html } = templates_1.emailTemplates.quoteReceived(data);
        await this.send(clientEmail, subject, html);
    }
    async sendQuoteAccepted(vendorEmail, data) {
        const { subject, html } = templates_1.emailTemplates.quoteAccepted(data);
        await this.send(vendorEmail, subject, html);
    }
    async sendPaymentReceived(vendorEmail, data) {
        const { subject, html } = templates_1.emailTemplates.paymentReceived(data);
        await this.send(vendorEmail, subject, html);
    }
    async sendPayoutProcessed(vendorEmail, data) {
        const { subject, html } = templates_1.emailTemplates.payoutProcessed(data);
        await this.send(vendorEmail, subject, html);
    }
    async sendInstallmentDue(clientEmail, data) {
        const { subject, html } = templates_1.emailTemplates.installmentDue(data);
        await this.send(clientEmail, subject, html);
    }
    async sendReviewRequested(clientEmail, data) {
        const { subject, html } = templates_1.emailTemplates.reviewRequested(data);
        await this.send(clientEmail, subject, html);
    }
    async sendDisputeOpened(adminEmail, data) {
        const { subject, html } = templates_1.emailTemplates.disputeOpened(data);
        await this.send(adminEmail, subject, html);
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(config_1.ConfigService)),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map