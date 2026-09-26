import { ConfigService } from '@nestjs/config';
import { emailTemplates } from './templates';
type OtpPurpose = 'verify' | 'reset' | 'login';
export declare class EmailService {
    private readonly config;
    private readonly logger;
    private readonly resend;
    private readonly from;
    private readonly isDev;
    constructor(config: ConfigService);
    send(to: string | string[], subject: string, html: string): Promise<void>;
    sendOtp(email: string, otp: string, purpose: OtpPurpose): Promise<void>;
    sendWelcome(email: string, firstName: string, role: 'client' | 'vendor'): Promise<void>;
    sendBookingRequest(vendorEmail: string, data: Parameters<typeof emailTemplates.bookingRequest>[0]): Promise<void>;
    sendBookingConfirmed(clientEmail: string, data: Parameters<typeof emailTemplates.bookingConfirmed>[0]): Promise<void>;
    sendBookingCancelled(recipientEmail: string, data: Parameters<typeof emailTemplates.bookingCancelled>[0]): Promise<void>;
    sendQuoteReceived(clientEmail: string, data: Parameters<typeof emailTemplates.quoteReceived>[0]): Promise<void>;
    sendQuoteAccepted(vendorEmail: string, data: Parameters<typeof emailTemplates.quoteAccepted>[0]): Promise<void>;
    sendPaymentReceived(vendorEmail: string, data: Parameters<typeof emailTemplates.paymentReceived>[0]): Promise<void>;
    sendPayoutProcessed(vendorEmail: string, data: Parameters<typeof emailTemplates.payoutProcessed>[0]): Promise<void>;
    sendInstallmentDue(clientEmail: string, data: Parameters<typeof emailTemplates.installmentDue>[0]): Promise<void>;
    sendReviewRequested(clientEmail: string, data: Parameters<typeof emailTemplates.reviewRequested>[0]): Promise<void>;
    sendDisputeOpened(adminEmail: string, data: Parameters<typeof emailTemplates.disputeOpened>[0]): Promise<void>;
}
export {};
