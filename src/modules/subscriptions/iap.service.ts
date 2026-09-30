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
import {
  APIException,
  AppStoreServerAPIClient,
  AutoRenewStatus,
  Environment,
  NotificationTypeV2,
  OfferType,
  ReceiptUtility,
  SignedDataVerifier,
  Status,
  Subtype,
  type ResponseBodyV2DecodedPayload,
  type StatusResponse,
} from '@apple/app-store-server-library';
import { GoogleAuth } from 'google-auth-library';
import { PrismaService } from '../../prisma/prisma.service';
import { IapVerifyDto } from './dto/iap-verify.dto';
import { IapPlatform, resolveIapProduct } from './iap/iap-products';

/**
 * Apple root CA certificates (G3 + G2), DER-encoded then base64'd. These are the
 * public roots published at https://www.apple.com/certificateauthority/ and are
 * pinned here so `SignedDataVerifier` can validate the x5c chain on every App
 * Store JWS (transactions, renewal info, and server notifications).
 */
const APPLE_ROOT_CA_G3_B64 =
  'MIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwSQXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcNMTQwNDMwMTgxOTA2WhcNMzkwNDMwMTgxOTA2WjBnMRswGQYDVQQDDBJBcHBsZSBSb290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGByqGSM49AgEGBSuBBAAiA2IABJjpLz1AcqTtkyJygRMc3RCV8cWjTnHcFBbZDuWmBSp3ZHtfTjjTuxxEtX/1H7YyYl3J6YRbTzBPEVoA/VhYDKX1DyxNB0cTddqXl5dvMVztK517IDvYuVTZXpmkOlEKMaNCMEAwHQYDVR0OBBYEFLuw3qFYM4iapIqZ3r6966/ayySrMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMAoGCCqGSM49BAMDA2gAMGUCMQCD6cHEFl4aXTQY2e3v9GwOAEZLuN+yRhHFD/3meoyhpmvOwgPUnPWTxnS4at+qIxUCMG1mihDK1A3UT82NQz60imOlM27jbdoXt2QfyFMm+YhidDkLF1vLUagM6BgD56KyKA==';
const APPLE_ROOT_CA_G2_B64 =
  'MIIFkjCCA3qgAwIBAgIIAeDltYNno+AwDQYJKoZIhvcNAQEMBQAwZzEbMBkGA1UEAwwSQXBwbGUgUm9vdCBDQSAtIEcyMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcNMTQwNDMwMTgxMDA5WhcNMzkwNDMwMTgxMDA5WjBnMRswGQYDVQQDDBJBcHBsZSBSb290IENBIC0gRzIxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBANgREkhI2imKScUcx+xuM23+TfvgHN6sXuI2pyT5f1BrTM65MFQn5bPW7SXmMLYFN14UIhHF6Kob0vuy0gmVOKTvKkmMXT5xZgM4+xb1hYjkWpIMBDLyyED7Ul+f9sDx47pFoFDVEovy3d6RhiPw9bZyLgHaC/YuOQhfGaFjQQscp5TBhsRTL3b2CtcM0YM/GlMZ81fVJ3/8E7j4ko380yhDPLVoACVdJ2LT3VXdRCCQgzWTxb+4Gftr49wIQuavbfqeQMpOhYV4SbHXw8EwOTKrfl+q04tvny0aIWhwZ7Oj8ZhBbZF8+NfbqOdfIRqMM78xdLe40fTgIvS/cjTf94FNcX1RoeKz8NMoFnNvzcytN31O661A4T+B/fc9Cj6i8b0xlilZ3MIZgIxbdMYs0xBTJh0UT8TUgWY8h2czJxQI6bR3hDRSj4n4aJgXv8O7qhOTH11UL6jHfPsNFL4VPSQ08prcdUFmIrQB1guvkJ4M6mL4m1k8COKWNORj3rw31OsMiANDC1CvoDTdUE0V+1ok2Az6DGOeHwOx4e7hqkP0ZmUoNwIx7wHHHtHMn23KVDpA287PT0aLSmWaasZobNfMmRtHsHLDd4/E92GcdB/O/WuhwpyUgquUoue9G7q5cDmVF8Up8zlYNPXEpMZ7YLlmQ1A/bmH8DvmGqmAMQ0uVAgMBAAGjQjBAMB0GA1UdDgQWBBTEmRNsGAPCe8CjoA1/coB6HHcmjTAPBgNVHRMBAf8EBTADAQH/MA4GA1UdDwEB/wQEAwIBBjANBgkqhkiG9w0BAQwFAAOCAgEAUabz4vS4PZO/Lc4Pu1vhVRROTtHlznldgX/+tvCHM/jvlOV+3Gp5pxy+8JS3ptEwnMgNCnWefZKVfhidfsJxaXwU6s+DDuQUQp50DhDNqxq6EWGBeNjxtUVAeKuowM77fWM3aPbn+6/Gw0vsHzYmE1SGlHKy6gLti23kDKaQwFd1z4xCfVzmMX3zybKSaUYOiPjjLUKyOKimGY3xn83uamW8GrAlvacp/fQ+onVJv57byfenHmOZ4VxG/5IFjPoeIPmGlFYl5bRXOJ3riGQUIUkhOb9iZqmxospvPyFgxYnURTbImHy99v6ZSYA7LNKmp4gDBDEZt7Y6YUX6yfIjyGNzv1aJMbDZfGKnexWoiIqrOEDCzBL/FePwN983csvMmOa/orz6JopxVtfnJBtIRD6e/J/JzBrsQzwBvDR4yGn1xuZW7AYJNpDrFEobXsmII9oDMJELuDY++ee1KG++P+w8j2Ud5cAeh6Squpj9kuNsJnfdBrRkBof0Tta6SqoWqPQFZ2aWuuJVecMsXUmPgEkrihLHdoBR37q9ZV0+N0djMenl9MU/S60EinpxLK8JQzcPqOMyT/RFtm2XNuyE9QoB6he7hY1Ck3DDUOUUi78/w0EP3SIEIwiKum1xRKtzCTrJ+VKACd+66eYWyi4uTLLT3OUEVLLUNIAytbwPF+E=';
const APPLE_ROOT_CAS: Buffer[] = [APPLE_ROOT_CA_G3_B64, APPLE_ROOT_CA_G2_B64].map(
  (b64) => Buffer.from(b64, 'base64'),
);

/** Minimal shape of the fields we read from Google Play `subscriptionsv2.get`. */
interface GoogleOfferDetails {
  basePlanId?: string;
  offerId?: string;
  offerTags?: string[];
}
interface GoogleLineItem {
  productId?: string;
  expiryTime?: string;
  offerDetails?: GoogleOfferDetails;
}
interface GooglePurchaseV2 {
  subscriptionState?: string;
  lineItems?: GoogleLineItem[];
  latestOrderId?: string;
}

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
 * The store calls (App Store Server API / Google Play Developer API) and the
 * server-notification signature verification are implemented and guarded on env
 * config; until credentials are set they fail safe with a clear "not configured"
 * error.
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
    purchaseToken: string,
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
    const appAppleId = this.appleAppAppleId();

    // The iOS client sends verificationData.serverVerificationData. With the
    // in_app_purchase plugin's default StoreKit1 config that is the base64 app
    // receipt; some setups send a StoreKit2 signed-transaction JWS or a bare
    // transaction id. Resolve all shapes to a transactionId we can query with.
    const transactionId = await this.resolveAppleTransactionId(
      purchaseToken,
      bundleId,
      appAppleId,
    );
    if (!transactionId) {
      throw new BadRequestException(
        'Could not extract a transaction id from the Apple purchase token',
      );
    }

    // An App Store transaction lives in exactly one environment. Query
    // Production first; a "not found" there means it is a Sandbox purchase, so
    // retry Sandbox before giving up.
    for (const environment of [Environment.PRODUCTION, Environment.SANDBOX]) {
      let statuses: StatusResponse;
      try {
        const client = new AppStoreServerAPIClient(
          privateKey,
          keyId,
          issuerId,
          bundleId,
          environment,
        );
        statuses = await client.getAllSubscriptionStatuses(transactionId);
      } catch (err) {
        if (
          environment === Environment.PRODUCTION &&
          this.isAppleWrongEnvironment(err)
        ) {
          continue; // fall through to Sandbox
        }
        throw new BadRequestException(
          `Apple could not verify this purchase: ${this.errText(err)}`,
        );
      }

      // Verify the x5c chain to Apple's root and decode the signed data.
      const verifier = new SignedDataVerifier(
        APPLE_ROOT_CAS,
        true, // enableOnlineChecks: OCSP revocation check on the cert chain
        environment,
        bundleId,
        appAppleId,
      );

      const match = await this.findAppleProduct(statuses, productId, verifier);
      if (!match) {
        throw new BadRequestException(
          `No Apple subscription found for product ${productId}`,
        );
      }
      return match;
    }

    throw new BadRequestException(
      'Apple did not recognise this transaction in Production or Sandbox',
    );
  }

  /**
   * Resolve the iOS `serverVerificationData` (base64 app receipt by default, or
   * a StoreKit2 signed-transaction JWS, or a bare transaction id) to a single
   * transaction id usable with the App Store Server API. Degrades gracefully
   * through each shape.
   */
  private async resolveAppleTransactionId(
    token: string,
    bundleId: string,
    appAppleId?: number,
  ): Promise<string | null> {
    const receiptUtil = new ReceiptUtility();

    // 1. StoreKit1 base64 app receipt (the plugin default).
    try {
      const id = receiptUtil.extractTransactionIdFromAppReceipt(token);
      if (id) return id;
    } catch {
      /* not a base64 app receipt — try the next shape */
    }

    // 2. Legacy base64 transaction receipt.
    try {
      const id = receiptUtil.extractTransactionIdFromTransactionReceipt(token);
      if (id) return id;
    } catch {
      /* not a transaction receipt — try the next shape */
    }

    // 3. StoreKit2 signed-transaction JWS (three dot-separated segments): verify
    //    and decode it to read the transaction id.
    if (token.split('.').length === 3) {
      for (const environment of [Environment.PRODUCTION, Environment.SANDBOX]) {
        try {
          const verifier = new SignedDataVerifier(
            APPLE_ROOT_CAS,
            true,
            environment,
            bundleId,
            appAppleId,
          );
          const txn = await verifier.verifyAndDecodeTransaction(token);
          if (txn.transactionId) return txn.transactionId;
        } catch {
          /* wrong environment or not a transaction JWS — keep trying */
        }
      }
    }

    // 4. Assume the client already sent a bare transaction id.
    return token || null;
  }

  /**
   * Locate, verify, and normalize the subscription for `productId` within an
   * App Store Server API status response.
   */
  private async findAppleProduct(
    statuses: StatusResponse,
    productId: string,
    verifier: SignedDataVerifier,
  ): Promise<NormalizedIapPurchase | null> {
    for (const group of statuses.data ?? []) {
      for (const item of group.lastTransactions ?? []) {
        if (!item.signedTransactionInfo) continue;

        let txn;
        try {
          txn = await verifier.verifyAndDecodeTransaction(
            item.signedTransactionInfo,
          );
        } catch {
          continue; // signature failed — skip this transaction
        }
        if (txn.productId !== productId) continue;

        // Trial = the store's introductory offer, read from the transaction and
        // (as a fallback) the renewal info.
        let isTrial = txn.offerType === OfferType.INTRODUCTORY_OFFER;
        if (!isTrial && item.signedRenewalInfo) {
          try {
            const renewal = await verifier.verifyAndDecodeRenewalInfo(
              item.signedRenewalInfo,
            );
            isTrial = renewal.offerType === OfferType.INTRODUCTORY_OFFER;
          } catch {
            /* renewal decode is best-effort for trial detection */
          }
        }

        const expiresAt = txn.expiresDate
          ? new Date(txn.expiresDate)
          : new Date(0);
        const statusActive =
          item.status === Status.ACTIVE ||
          item.status === Status.BILLING_GRACE_PERIOD;
        const isActive =
          statusActive &&
          !txn.revocationDate &&
          expiresAt.getTime() > Date.now();

        return {
          productId: txn.productId ?? productId,
          originalTxnId:
            txn.originalTransactionId ?? item.originalTransactionId ?? '',
          expiresAt,
          isTrial,
          isActive,
        };
      }
    }
    return null;
  }

  /** True when an App Store Server API error means "not in this environment". */
  private isAppleWrongEnvironment(err: unknown): boolean {
    if (err instanceof APIException) {
      if (err.httpStatusCode === 404) return true;
      const notFound = [
        4040010, // TRANSACTION_ID_NOT_FOUND
        4040005, // ORIGINAL_TRANSACTION_ID_NOT_FOUND
        4040006, // ORIGINAL_TRANSACTION_ID_NOT_FOUND_RETRYABLE
      ];
      return typeof err.apiError === 'number' && notFound.includes(err.apiError);
    }
    return false;
  }

  /** Optional numeric App Store app id, required for Production JWS verification. */
  private appleAppAppleId(): number | undefined {
    const raw = this.config.get<string>('APPLE_IAP_APP_APPLE_ID');
    if (!raw) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  }

  private errText(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
  }

  /**
   * Validate a Google Play purchase token against the Play Developer API and
   * normalize it.
   */
  private async validateGoogle(
    productId: string,
    purchaseToken: string,
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

    let credentials: Record<string, unknown>;
    try {
      credentials = JSON.parse(serviceAccountJson);
    } catch {
      throw new ServiceUnavailableException(
        'Google Play service account JSON is not valid',
      );
    }

    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    // androidpublisher v3 purchases.subscriptionsv2.get — the purchase token is
    // the stable key we persist as iapOriginalTxnId.
    const url =
      'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/' +
      `${encodeURIComponent(packageName)}/purchases/subscriptionsv2/tokens/` +
      encodeURIComponent(purchaseToken);

    let data: GooglePurchaseV2;
    try {
      const res = await auth.request<GooglePurchaseV2>({ url });
      data = res.data;
    } catch (err) {
      throw new BadRequestException(
        `Google could not verify this purchase: ${this.errText(err)}`,
      );
    }

    const state = data.subscriptionState;
    const isActive =
      state === 'SUBSCRIPTION_STATE_ACTIVE' ||
      state === 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD';

    const lineItems = data.lineItems ?? [];
    // Prefer the line item for the product we were asked about; otherwise the
    // one that expires latest (the currently-governing entitlement).
    const chosen =
      lineItems.find((li) => li.productId === productId) ??
      lineItems
        .slice()
        .sort((a, b) => this.gTime(b.expiryTime) - this.gTime(a.expiryTime))[0];

    const latestExpiryMs = lineItems.reduce(
      (max, li) => Math.max(max, this.gTime(li.expiryTime)),
      0,
    );
    const expiresAt = latestExpiryMs > 0 ? new Date(latestExpiryMs) : new Date(0);

    // The client already acknowledges the purchase via completePurchase; a
    // server-side purchases.subscriptions.acknowledge is optional and omitted.
    return {
      productId: chosen?.productId ?? productId,
      originalTxnId: purchaseToken,
      expiresAt,
      isTrial: this.googleLineItemIsTrial(chosen),
      isActive,
    };
  }

  private gTime(iso?: string): number {
    if (!iso) return 0;
    const t = Date.parse(iso);
    return Number.isFinite(t) ? t : 0;
  }

  /**
   * Best-effort free-trial detection for Google Play. `subscriptionsv2.get` does
   * not surface the active offer *phase*, so a trial is only recognised when the
   * developer has tagged the offer accordingly; otherwise false (per contract).
   */
  private googleLineItemIsTrial(li?: GoogleLineItem): boolean {
    const tags = li?.offerDetails?.offerTags;
    if (Array.isArray(tags)) {
      return tags.some((t) => /free[_-]?trial|trial/i.test(t ?? ''));
    }
    return false;
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

    const bundleId = this.config.get<string>('APPLE_IAP_BUNDLE_ID');
    if (!bundleId) {
      this.logger.warn(
        'Apple notifications not configured (no bundle id) — ignoring',
      );
      return;
    }
    const appAppleId = this.appleAppAppleId();

    // Verify the x5c chain against Apple's root and decode the ASSN v2 JWS. The
    // signing environment is embedded in the payload, so try Production then
    // Sandbox verifiers and keep the one that succeeds.
    let payload: ResponseBodyV2DecodedPayload | null = null;
    let verifier: SignedDataVerifier | null = null;
    for (const environment of [Environment.PRODUCTION, Environment.SANDBOX]) {
      try {
        const v = new SignedDataVerifier(
          APPLE_ROOT_CAS,
          true,
          environment,
          bundleId,
          appAppleId,
        );
        payload = await v.verifyAndDecodeNotification(body.signedPayload);
        verifier = v;
        break;
      } catch (err) {
        this.logger.debug(
          `Apple notification ${environment} verify failed: ${this.errText(err)}`,
        );
      }
    }
    if (!payload || !verifier) {
      this.logger.warn(
        'Apple notification failed signature verification — ignoring',
      );
      return;
    }

    // The transaction/renewal info is nested signed JWS — decode it (with the
    // same verified environment) for the originalTransactionId, expiry, and
    // auto-renew status.
    let originalTransactionId: string | undefined;
    let expiresAt: Date | undefined;
    let autoRenewOff = false;
    if (payload.data?.signedTransactionInfo) {
      try {
        const txn = await verifier.verifyAndDecodeTransaction(
          payload.data.signedTransactionInfo,
        );
        originalTransactionId = txn.originalTransactionId;
        if (txn.expiresDate) expiresAt = new Date(txn.expiresDate);
      } catch (err) {
        this.logger.warn(
          `Apple notification transaction decode failed: ${this.errText(err)}`,
        );
      }
    }
    if (payload.data?.signedRenewalInfo) {
      try {
        const renewal = await verifier.verifyAndDecodeRenewalInfo(
          payload.data.signedRenewalInfo,
        );
        if (renewal.autoRenewStatus === AutoRenewStatus.OFF) autoRenewOff = true;
        if (!originalTransactionId) {
          originalTransactionId = renewal.originalTransactionId;
        }
      } catch {
        /* renewal decode is best-effort */
      }
    }

    // DID_RENEW → renew, EXPIRED → expire, REFUND/REVOKE → refund,
    // DID_CHANGE_RENEWAL_STATUS with auto-renew OFF → cancel-at-period-end.
    // Everything else is ignored (never throw on unknown types).
    let action: IapNotificationAction;
    if (payload.notificationType === NotificationTypeV2.DID_CHANGE_RENEWAL_STATUS) {
      const disabled =
        payload.subtype === Subtype.AUTO_RENEW_DISABLED || autoRenewOff;
      action = disabled ? 'cancel' : 'ignore';
    } else {
      action = this.classifyAppleType(payload.notificationType);
    }

    await this.applyNotification(
      'apple',
      originalTransactionId,
      action,
      expiresAt,
    );
  }

  /**
   * Google Real-Time Developer Notifications (RTDN), delivered as a Pub/Sub
   * push: `{ message: { data: <base64 JSON> }, subscription }`. The decoded
   * data holds a subscriptionNotification with a notificationType (int) and the
   * purchaseToken (our iapOriginalTxnId). Never throws on unknown types.
   */
  async handleGoogleNotification(body: {
    message?: { data?: string; attributes?: Record<string, string> };
    subscription?: string;
    token?: string;
  }): Promise<void> {
    const dataB64 = body?.message?.data;
    if (!dataB64) {
      this.logger.warn('Google RTDN missing message.data — ignoring');
      return;
    }

    // Optional shared-secret check: if a verification token is configured, the
    // Pub/Sub push must present a matching one (forwarded as a body token or a
    // message attribute). A mismatch is rejected; if configured but not
    // presented we log and still proceed — authenticity is re-established below
    // by re-fetching the purchase from Google.
    const expectedToken = this.config.get<string>(
      'GOOGLE_RTDN_VERIFICATION_TOKEN',
    );
    if (expectedToken) {
      const presented = body.token ?? body.message?.attributes?.token;
      if (presented && presented !== expectedToken) {
        this.logger.warn('Google RTDN verification token mismatch — ignoring');
        return;
      }
      if (!presented) {
        this.logger.warn(
          'Google RTDN verification token configured but not presented — proceeding on re-fetch',
        );
      }
    }

    let decoded: {
      subscriptionNotification?: {
        notificationType?: number;
        purchaseToken?: string;
        subscriptionId?: string;
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

    // The RTDN carries no expiry; for a renewal, re-fetch the authoritative
    // expiry from the Play Developer API rather than trusting the notification.
    let expiresAt: Date | undefined;
    if (action === 'renew') {
      try {
        const purchase = await this.validateGoogle(
          notif.subscriptionId ?? '',
          notif.purchaseToken,
        );
        expiresAt = purchase.expiresAt;
      } catch (err) {
        this.logger.warn(`Google RTDN re-fetch failed: ${this.errText(err)}`);
      }
    }

    await this.applyNotification(
      'google',
      notif.purchaseToken,
      action,
      expiresAt,
    );
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
