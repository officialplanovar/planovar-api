import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { emailTemplates } from './templates';

type OtpPurpose = 'verify' | 'reset' | 'login';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null = null;
  private readonly from: string;
  private readonly isDev: boolean;

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY');
    this.from = config.get<string>('EMAIL_FROM', 'noreply@planovar.ng');
    this.isDev = config.get<string>('NODE_ENV', 'development') !== 'production';

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Email service ready (Resend)');
    } else {
      this.logger.warn('RESEND_API_KEY not set — emails will be logged to console only');
    }
  }

  // ─── Core send method ────────────────────────────────────────────────────

  async send(to: string | string[], subject: string, html: string): Promise<void> {
    if (!this.resend) {
      // Dev fallback: print to console
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
    } catch (err) {
      this.logger.error(`Failed to send email "${subject}"`, err);
      // Do not rethrow — email failure should never crash the request
    }
  }

  // ─── Typed senders ───────────────────────────────────────────────────────

  async sendOtp(email: string, otp: string, purpose: OtpPurpose): Promise<void> {
    // Always log OTP to console in development so you can test without Resend
    if (this.isDev) {
      this.logger.log(`[OTP] ${purpose} → ${email}: ${otp}`);
    }
    const { subject, html } = emailTemplates.otp(otp, purpose);
    await this.send(email, subject, html);
  }

  async sendWelcome(email: string, firstName: string, role: 'client' | 'vendor'): Promise<void> {
    const { subject, html } = emailTemplates.welcome({ firstName, role });
    await this.send(email, subject, html);
  }

  async sendBookingRequest(
    vendorEmail: string,
    data: Parameters<typeof emailTemplates.bookingRequest>[0],
  ): Promise<void> {
    const { subject, html } = emailTemplates.bookingRequest(data);
    await this.send(vendorEmail, subject, html);
  }

  async sendBookingConfirmed(
    clientEmail: string,
    data: Parameters<typeof emailTemplates.bookingConfirmed>[0],
  ): Promise<void> {
    const { subject, html } = emailTemplates.bookingConfirmed(data);
    await this.send(clientEmail, subject, html);
  }

  async sendBookingCancelled(
    recipientEmail: string,
    data: Parameters<typeof emailTemplates.bookingCancelled>[0],
  ): Promise<void> {
    const { subject, html } = emailTemplates.bookingCancelled(data);
    await this.send(recipientEmail, subject, html);
  }

  async sendQuoteReceived(
    clientEmail: string,
    data: Parameters<typeof emailTemplates.quoteReceived>[0],
  ): Promise<void> {
    const { subject, html } = emailTemplates.quoteReceived(data);
    await this.send(clientEmail, subject, html);
  }

  async sendQuoteAccepted(
    vendorEmail: string,
    data: Parameters<typeof emailTemplates.quoteAccepted>[0],
  ): Promise<void> {
    const { subject, html } = emailTemplates.quoteAccepted(data);
    await this.send(vendorEmail, subject, html);
  }

  async sendPaymentReceived(
    vendorEmail: string,
    data: Parameters<typeof emailTemplates.paymentReceived>[0],
  ): Promise<void> {
    const { subject, html } = emailTemplates.paymentReceived(data);
    await this.send(vendorEmail, subject, html);
  }

  async sendPayoutProcessed(
    vendorEmail: string,
    data: Parameters<typeof emailTemplates.payoutProcessed>[0],
  ): Promise<void> {
    const { subject, html } = emailTemplates.payoutProcessed(data);
    await this.send(vendorEmail, subject, html);
  }

  async sendInstallmentDue(
    clientEmail: string,
    data: Parameters<typeof emailTemplates.installmentDue>[0],
  ): Promise<void> {
    const { subject, html } = emailTemplates.installmentDue(data);
    await this.send(clientEmail, subject, html);
  }

  async sendReviewRequested(
    clientEmail: string,
    data: Parameters<typeof emailTemplates.reviewRequested>[0],
  ): Promise<void> {
    const { subject, html } = emailTemplates.reviewRequested(data);
    await this.send(clientEmail, subject, html);
  }

  async sendDisputeOpened(
    adminEmail: string,
    data: Parameters<typeof emailTemplates.disputeOpened>[0],
  ): Promise<void> {
    const { subject, html } = emailTemplates.disputeOpened(data);
    await this.send(adminEmail, subject, html);
  }
}
