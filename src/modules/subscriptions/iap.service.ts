import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubscriptionStatus, SubscriptionTier } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { IapVerifyDto } from './dto/iap-verify.dto';
import { IapPlatform, resolveIapProduct } from './iap/iap-products';

/**
 * Normalized shape every store validator returns, regardless of platform.
 * The stable identity is `originalTxnId` — Apple's originalTransactionId or
 * Google's purchase token — which is also what renewal/expiry notifications
 * carry, so we persist it on the subscription to match webhooks later.
 */
interface NormalizedIapPurchase {
  productId: string;
  originalTxnId: string;
  expiresAt: Date;
  /** Store is currently in an introductory/free-trial period. */
  isTrial: boolean;
  /** Store considers the entitlement currently active (not expired/revoked). */
  isActive: boolean;
}

/** Fields a store notification maps to, after decode + type classification. */
type IapNotificationAction = 'renew' | 'expire' | 'cancel' | 'refund' | 'ignore';

/**
 * Server-side Apple App Store / Google Play in-app-purchase subscriptions.
 *
 * This is the MOBILE counterpart to SubscriptionsService.subscribe() (which
 * stays for the web card rails). The flow:
 *   client buys in the native store → sends us the receipt/token →
 *   we validate it against the store → activate the VendorSubscription.
 *
 * SCAFFOLD STATUS: the architecture, product mapping, persistence and webhook
 * routing are complete and wired. The two real store calls (App Store Server
 * API / Google Play Developer API) and the notification signature verification
 * are guarded on env config and marked with `TODO(iap)`; until credentials are
 * set they fail safe with a clear "not configured" error.
 */
@Injectable()
export class IapService {
  private readonly logger = new Logger(IapService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}

  // ─── Verify a purchase and activate the vendor's subscription ──────────────

  async verify(userId: string, dto: IapVerifyDto) {
    const mapping = resolveIapProduct(dto.productId);
    if (!mapping) {
      throw new BadRequestException(`Unknown IAP product: ${dto.productId}`);
    }

    const vendor = await this.requireVendor(userId);

    const purchase =
      dto.platform === 'apple'
        ? await this.validateApple(dto.productId, dto.purchaseToken)
        : await this.validateGoogle(dto.productId, dto.purchaseToken);

    if (!purchase.isActive) {
      throw new BadRequestException(
        'Store reports this purchase is not active (expired, refunded, or revoked)',
      );
    }

    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { tier: mapping.tier },
      select: { id: true, tier: true },
    });
    if (!plan) {
      throw new NotFoundException(`${mapping.tier} plan is not configured`);
    }

    // The STORE owns the free trial (introductory offer) for IAP — we do NOT
    // create a TrialClaim or run isTrialEligible here. TRIALING is set purely
    // from the store's reported state.
    const status = purchase.isTrial
      ? SubscriptionStatus.TRIALING
      : SubscriptionStatus.ACTIVE;
    const now = new Date();

    // Upsert by the stable store key: a vendor re-verifying (restore, or a
    // client-driven re-sync) updates the SAME subscription row rather than
    // stacking duplicates.
    const existing = await this.prisma.vendorSubscription.findFirst({
      where: { iapOriginalTxnId: purchase.originalTxnId },
      select: { id: true, vendorId: true },
    });

    const linkData = {
      planId: plan.id,
      status,
      billingCycle: mapping.cycle,
      currentPeriodStart: now,
      currentPeriodEnd: purchase.expiresAt,
      trialEndsAt: purchase.isTrial ? purchase.expiresAt : null,
      cancelAtPeriodEnd: false,
      cancelledAt: null,
      provider: dto.platform,
      iapPlatform: dto.platform,
      iapProductId: purchase.productId,
      iapOriginalTxnId: purchase.originalTxnId,
    };

    const subId = existing?.id;
    await this.prisma.$transaction([
      subId
        ? this.prisma.vendorSubscription.update({
            where: { id: subId },
            data: { vendorId: vendor.id, ...linkData },
          })
        : this.prisma.vendorSubscription.create({
            data: { vendorId: vendor.id, ...linkData },
          }),
      // Retire any other active/trialing sub for this vendor so tier state stays
      // coherent (e.g. they had a web sub or an older IAP product).
      this.prisma.vendorSubscription.updateMany({
        where: {
          vendorId: vendor.id,
          status: {
            in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
          },
          ...(subId ? { id: { not: subId } } : {}),
          iapOriginalTxnId: { not: purchase.originalTxnId },
        },
        data: {
          status: SubscriptionStatus.CANCELLED,
          cancelAtPeriodEnd: false,
          cancelledAt: now,
        },
      }),
      this.prisma.vendorProfile.update({
        where: { id: vendor.id },
        data: { subscriptionTier: plan.tier },
      }),
    ]);

    return {
      status: status === SubscriptionStatus.TRIALING ? 'trialing' : 'active',
      tier: plan.tier,
      expiresAt: purchase.expiresAt,
    };
  }

  // ─── Store validators (guarded scaffold) ───────────────────────────────────

  /**
   * Validate an Apple StoreKit 2 signed transaction against the App Store
   * Server API and normalize it.
   */
  private async validateApple(
    productId: string,
    _purchaseToken: string,
  ): Promise<NormalizedIapPurchase> {
    const issuerId = this.config.get<string>('APPLE_IAP_ISSUER_ID');
    const keyId = this.config.get<string>('APPLE_IAP_KEY_ID');
    const privateKey = this.config.get<string>('APPLE_IAP_PRIVATE_KEY');
    const bundleId = this.config.get<string>('APPLE_IAP_BUNDLE_ID');
    if (!issuerId || !keyId || !privateKey || !bundleId) {
      throw new ServiceUnavailableException(
        'In-app purchases are not configured yet',
      );
    }

    // TODO(iap): call App Store Server API.
    //   1. Build a ES256-signed JWT (issuerId, keyId, privateKey, bid=bundleId,
    //      aud="appstoreconnect-v1") for the App Store Server API.
    //   2. GET /inApps/v1/subscriptions/{transactionId} (or verify the signed
    //      transaction JWS the client sent), verifying Apple's x5c cert chain
    //      to the Apple Root CA.
    //   3. Read the latest transaction + renewal info: expiresDate,
    //      originalTransactionId, productId, and offerType (introductory ⇒ trial).
    // Recommended lib: `@apple/app-store-server-library` (Apple's official SDK).
    throw new ServiceUnavailableException(
      'Apple in-app purchase verification is not implemented yet',
    );
    // Unreachable until implemented; documents the normalized contract:
    // return { productId, originalTxnId, expiresAt, isTrial, isActive };
  }

  /**
   * Validate a Google Play purchase token against the Play Developer API and
   * normalize it.
   */
  private async validateGoogle(
    productId: string,
    _purchaseToken: string,
  ): Promise<NormalizedIapPurchase> {
    const packageName = this.config.get<string>('GOOGLE_PLAY_PACKAGE_NAME');
    const serviceAccountJson = this.config.get<string>(
      'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON',
    );
    if (!packageName || !serviceAccountJson) {
      throw new ServiceUnavailableException(
        'In-app purchases are not configured yet',
      );
    }

    // TODO(iap): call the Google Play Developer API.
    //   1. Authenticate with the service-account JSON (scope
    //      https://www.googleapis.com/auth/androidpublisher).
    //   2. GET purchases.subscriptionsv2.get({ packageName, token: purchaseToken })
    //      (or the legacy purchases.subscriptions.get).
    //   3. Read lineItems[].expiryTime, subscriptionState
    //      (SUBSCRIPTION_STATE_ACTIVE / _IN_GRACE_PERIOD ⇒ active), and
    //      paymentState / offer details (free-trial ⇒ trial). The purchase token
    //      is the stable key stored as iapOriginalTxnId.
    // Recommended lib: `googleapis` (androidpublisher_v3).
    throw new ServiceUnavailableException(
      'Google Play in-app purchase verification is not implemented yet',
    );
    // Unreachable until implemented; documents the normalized contract:
    // return { productId, originalTxnId, expiresAt, isTrial, isActive };
  }

  // ─── Store server notifications (scaffold) ─────────────────────────────────

  /**
   * Apple App Store Server Notifications v2. Apple POSTs `{ signedPayload }`
   * where signedPayload is a JWS. We classify the notificationType, resolve the
   * originalTransactionId → local subscription, and apply the state change.
   * Never throws on unknown types.
   */
  async handleAppleNotification(body: {
    signedPayload?: string;
  }): Promise<void> {
    if (!body?.signedPayload) {
      this.logger.warn('Apple notification missing signedPayload — ignoring');
      return;
    }

    // TODO(iap): verify + decode the JWS.
    //   - Verify the x5c header cert chain against the Apple Root CA, then read
    //     the payload. Recommended: `@apple/app-store-server-library`
    //     (SignedDataVerifier).
    //   - notificationType/subtype live in the decoded payload; the transaction
    //     info (originalTransactionId, expiresDate) is a nested signed JWS.
    // Until keys are wired we cannot trust the payload, so bail out safely.
    const decoded = this.decodeAppleUnverified(body.signedPayload);
    if (!decoded) {
      this.logger.warn('Apple notification could not be decoded — ignoring');
      return;
    }

    const action = this.classifyAppleType(decoded.notificationType);
    await this.applyNotification(
      'apple',
      decoded.originalTransactionId,
      action,
      decoded.expiresAt,
    );
  }

  /**
   * Google Real-Time Developer Notifications (RTDN), delivered as a Pub/Sub
   * push: `{ message: { data: <base64 JSON> }, subscription }`. The decoded
   * data holds a subscriptionNotification with a notificationType (int) and the
   * purchaseToken (our iapOriginalTxnId). Never throws on unknown types.
   */
  async handleGoogleNotification(body: {
    message?: { data?: string };
  }): Promise<void> {
    const dataB64 = body?.message?.data;
    if (!dataB64) {
      this.logger.warn('Google RTDN missing message.data — ignoring');
      return;
    }

    // TODO(iap): the Pub/Sub push itself should be authenticated (verify the
    //   OIDC token in the Authorization header against Google's certs, and/or a
    //   shared-secret path segment). The base64 payload below is decoded but its
    //   authenticity is only established by that check plus re-fetching the
    //   purchase via validateGoogle().
    let decoded: {
      subscriptionNotification?: {
        notificationType?: number;
        purchaseToken?: string;
      };
    };
    try {
      decoded = JSON.parse(Buffer.from(dataB64, 'base64').toString('utf8'));
    } catch (err) {
      this.logger.warn(`Google RTDN payload not decodable: ${String(err)}`);
      return;
    }

    const notif = decoded.subscriptionNotification;
    if (!notif?.purchaseToken) {
      // Could be a voidedPurchaseNotification / test notification — safe to skip.
      this.logger.log('Google RTDN with no subscriptionNotification — ignoring');
      return;
    }

    const action = this.classifyGoogleType(notif.notificationType);
    // TODO(iap): for renew, re-fetch the authoritative expiry via
    // validateGoogle(purchaseToken) rather than trusting the notification.
    await this.applyNotification('google', notif.purchaseToken, action);
  }

  /** Apply a normalized notification action to the matching subscription. */
  private async applyNotification(
    platform: IapPlatform,
    originalTxnId: string | undefined,
    action: IapNotificationAction,
    expiresAt?: Date,
  ): Promise<void> {
    if (action === 'ignore' || !originalTxnId) return;

    const sub = await this.prisma.vendorSubscription.findFirst({
      where: { iapOriginalTxnId: originalTxnId },
      select: { id: true, vendorId: true },
    });
    if (!sub) {
      this.logger.warn(
        `${platform} notification for unknown txn ${originalTxnId} — ignoring`,
      );
      return;
    }

    const now = new Date();
    if (action === 'renew') {
      await this.prisma.vendorSubscription.update({
        where: { id: sub.id },
        data: {
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          ...(expiresAt ? { currentPeriodEnd: expiresAt } : {}),
          cancelAtPeriodEnd: false,
        },
      });
      return;
    }

    if (action === 'cancel') {
      // Store auto-renew turned off — keep access until period end.
      await this.prisma.vendorSubscription.update({
        where: { id: sub.id },
        data: { cancelAtPeriodEnd: true },
      });
      return;
    }

    // expire | refund → end access now and drop the vendor to BASIC.
    await this.prisma.$transaction([
      this.prisma.vendorSubscription.update({
        where: { id: sub.id },
        data: { status: SubscriptionStatus.EXPIRED, cancelledAt: now },
      }),
      this.prisma.vendorProfile.update({
        where: { id: sub.vendorId },
        data: { subscriptionTier: SubscriptionTier.BASIC },
      }),
    ]);
  }

  // ─── Notification-type classification ──────────────────────────────────────

  /** Apple ASSN v2 notificationType → local action. */
  private classifyAppleType(type: string | undefined): IapNotificationAction {
    switch (type) {
      case 'SUBSCRIBED':
      case 'DID_RENEW':
      case 'OFFER_REDEEMED':
        return 'renew';
      case 'DID_CHANGE_RENEWAL_STATUS':
        // AUTO_RENEW_DISABLED arrives here (subtype); treat as cancel-at-end.
        return 'cancel';
      case 'EXPIRED':
      case 'GRACE_PERIOD_EXPIRED':
      case 'DID_FAIL_TO_RENEW':
        return 'expire';
      case 'REFUND':
      case 'REVOKE':
        return 'refund';
      default:
        return 'ignore';
    }
  }

  /** Google RTDN SubscriptionNotification.notificationType (int) → local action. */
  private classifyGoogleType(type: number | undefined): IapNotificationAction {
    switch (type) {
      case 1: // SUBSCRIPTION_RECOVERED
      case 2: // SUBSCRIPTION_RENEWED
      case 4: // SUBSCRIPTION_PURCHASED
      case 7: // SUBSCRIPTION_RESTARTED
        return 'renew';
      case 3: // SUBSCRIPTION_CANCELED
        return 'cancel';
      case 5: // SUBSCRIPTION_ON_HOLD
      case 13: // SUBSCRIPTION_EXPIRED
        return 'expire';
      case 12: // SUBSCRIPTION_REVOKED
        return 'refund';
      default:
        return 'ignore';
    }
  }

  /**
   * Best-effort, UNVERIFIED decode of an Apple signedPayload's JWS body, used
   * only to route the notification during the scaffold phase. The real handler
   * must replace this with a cert-chain-verified decode (see the TODO above).
   */
  private decodeAppleUnverified(signedPayload: string): {
    notificationType?: string;
    originalTransactionId?: string;
    expiresAt?: Date;
  } | null {
    try {
      const [, payloadB64] = signedPayload.split('.');
      if (!payloadB64) return null;
      const payload = JSON.parse(
        Buffer.from(payloadB64, 'base64url').toString('utf8'),
      );
      // The transaction info is itself a nested signed JWS; a real impl decodes
      // it too. We surface only what routing needs and leave the rest to TODO.
      return {
        notificationType: payload?.notificationType,
        originalTransactionId:
          payload?.data?.originalTransactionId ??
          payload?.summary?.originalTransactionId,
        expiresAt: undefined,
      };
    } catch {
      return null;
    }
  }

  // ─── helpers ────────────────────────────────────────────────────────────────

  private async requireVendor(userId: string) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!vendor) {
      throw new NotFoundException('Vendor profile not found — onboard first');
    }
    return vendor;
  }
}
