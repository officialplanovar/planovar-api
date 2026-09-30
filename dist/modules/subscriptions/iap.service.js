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
var IapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IapService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const app_store_server_library_1 = require("@apple/app-store-server-library");
const google_auth_library_1 = require("google-auth-library");
const prisma_service_1 = require("../../prisma/prisma.service");
const iap_products_1 = require("./iap/iap-products");
const APPLE_ROOT_CA_G3_B64 = 'MIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwSQXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcNMTQwNDMwMTgxOTA2WhcNMzkwNDMwMTgxOTA2WjBnMRswGQYDVQQDDBJBcHBsZSBSb290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGByqGSM49AgEGBSuBBAAiA2IABJjpLz1AcqTtkyJygRMc3RCV8cWjTnHcFBbZDuWmBSp3ZHtfTjjTuxxEtX/1H7YyYl3J6YRbTzBPEVoA/VhYDKX1DyxNB0cTddqXl5dvMVztK517IDvYuVTZXpmkOlEKMaNCMEAwHQYDVR0OBBYEFLuw3qFYM4iapIqZ3r6966/ayySrMA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMAoGCCqGSM49BAMDA2gAMGUCMQCD6cHEFl4aXTQY2e3v9GwOAEZLuN+yRhHFD/3meoyhpmvOwgPUnPWTxnS4at+qIxUCMG1mihDK1A3UT82NQz60imOlM27jbdoXt2QfyFMm+YhidDkLF1vLUagM6BgD56KyKA==';
const APPLE_ROOT_CA_G2_B64 = 'MIIFkjCCA3qgAwIBAgIIAeDltYNno+AwDQYJKoZIhvcNAQEMBQAwZzEbMBkGA1UEAwwSQXBwbGUgUm9vdCBDQSAtIEcyMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcNMTQwNDMwMTgxMDA5WhcNMzkwNDMwMTgxMDA5WjBnMRswGQYDVQQDDBJBcHBsZSBSb290IENBIC0gRzIxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBANgREkhI2imKScUcx+xuM23+TfvgHN6sXuI2pyT5f1BrTM65MFQn5bPW7SXmMLYFN14UIhHF6Kob0vuy0gmVOKTvKkmMXT5xZgM4+xb1hYjkWpIMBDLyyED7Ul+f9sDx47pFoFDVEovy3d6RhiPw9bZyLgHaC/YuOQhfGaFjQQscp5TBhsRTL3b2CtcM0YM/GlMZ81fVJ3/8E7j4ko380yhDPLVoACVdJ2LT3VXdRCCQgzWTxb+4Gftr49wIQuavbfqeQMpOhYV4SbHXw8EwOTKrfl+q04tvny0aIWhwZ7Oj8ZhBbZF8+NfbqOdfIRqMM78xdLe40fTgIvS/cjTf94FNcX1RoeKz8NMoFnNvzcytN31O661A4T+B/fc9Cj6i8b0xlilZ3MIZgIxbdMYs0xBTJh0UT8TUgWY8h2czJxQI6bR3hDRSj4n4aJgXv8O7qhOTH11UL6jHfPsNFL4VPSQ08prcdUFmIrQB1guvkJ4M6mL4m1k8COKWNORj3rw31OsMiANDC1CvoDTdUE0V+1ok2Az6DGOeHwOx4e7hqkP0ZmUoNwIx7wHHHtHMn23KVDpA287PT0aLSmWaasZobNfMmRtHsHLDd4/E92GcdB/O/WuhwpyUgquUoue9G7q5cDmVF8Up8zlYNPXEpMZ7YLlmQ1A/bmH8DvmGqmAMQ0uVAgMBAAGjQjBAMB0GA1UdDgQWBBTEmRNsGAPCe8CjoA1/coB6HHcmjTAPBgNVHRMBAf8EBTADAQH/MA4GA1UdDwEB/wQEAwIBBjANBgkqhkiG9w0BAQwFAAOCAgEAUabz4vS4PZO/Lc4Pu1vhVRROTtHlznldgX/+tvCHM/jvlOV+3Gp5pxy+8JS3ptEwnMgNCnWefZKVfhidfsJxaXwU6s+DDuQUQp50DhDNqxq6EWGBeNjxtUVAeKuowM77fWM3aPbn+6/Gw0vsHzYmE1SGlHKy6gLti23kDKaQwFd1z4xCfVzmMX3zybKSaUYOiPjjLUKyOKimGY3xn83uamW8GrAlvacp/fQ+onVJv57byfenHmOZ4VxG/5IFjPoeIPmGlFYl5bRXOJ3riGQUIUkhOb9iZqmxospvPyFgxYnURTbImHy99v6ZSYA7LNKmp4gDBDEZt7Y6YUX6yfIjyGNzv1aJMbDZfGKnexWoiIqrOEDCzBL/FePwN983csvMmOa/orz6JopxVtfnJBtIRD6e/J/JzBrsQzwBvDR4yGn1xuZW7AYJNpDrFEobXsmII9oDMJELuDY++ee1KG++P+w8j2Ud5cAeh6Squpj9kuNsJnfdBrRkBof0Tta6SqoWqPQFZ2aWuuJVecMsXUmPgEkrihLHdoBR37q9ZV0+N0djMenl9MU/S60EinpxLK8JQzcPqOMyT/RFtm2XNuyE9QoB6he7hY1Ck3DDUOUUi78/w0EP3SIEIwiKum1xRKtzCTrJ+VKACd+66eYWyi4uTLLT3OUEVLLUNIAytbwPF+E=';
const APPLE_ROOT_CAS = [APPLE_ROOT_CA_G3_B64, APPLE_ROOT_CA_G2_B64].map((b64) => Buffer.from(b64, 'base64'));
let IapService = IapService_1 = class IapService {
    prisma;
    config;
    logger = new common_1.Logger(IapService_1.name);
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async verify(userId, dto) {
        const mapping = (0, iap_products_1.resolveIapProduct)(dto.productId);
        if (!mapping) {
            throw new common_1.BadRequestException(`Unknown IAP product: ${dto.productId}`);
        }
        const vendor = await this.requireVendor(userId);
        const purchase = dto.platform === 'apple'
            ? await this.validateApple(dto.productId, dto.purchaseToken)
            : await this.validateGoogle(dto.productId, dto.purchaseToken);
        if (!purchase.isActive) {
            throw new common_1.BadRequestException('Store reports this purchase is not active (expired, refunded, or revoked)');
        }
        const plan = await this.prisma.subscriptionPlan.findUnique({
            where: { tier: mapping.tier },
            select: { id: true, tier: true },
        });
        if (!plan) {
            throw new common_1.NotFoundException(`${mapping.tier} plan is not configured`);
        }
        const status = purchase.isTrial
            ? client_1.SubscriptionStatus.TRIALING
            : client_1.SubscriptionStatus.ACTIVE;
        const now = new Date();
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
            this.prisma.vendorSubscription.updateMany({
                where: {
                    vendorId: vendor.id,
                    status: {
                        in: [client_1.SubscriptionStatus.ACTIVE, client_1.SubscriptionStatus.TRIALING],
                    },
                    ...(subId ? { id: { not: subId } } : {}),
                    iapOriginalTxnId: { not: purchase.originalTxnId },
                },
                data: {
                    status: client_1.SubscriptionStatus.CANCELLED,
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
            status: status === client_1.SubscriptionStatus.TRIALING ? 'trialing' : 'active',
            tier: plan.tier,
            expiresAt: purchase.expiresAt,
        };
    }
    async validateApple(productId, purchaseToken) {
        const issuerId = this.config.get('APPLE_IAP_ISSUER_ID');
        const keyId = this.config.get('APPLE_IAP_KEY_ID');
        const privateKey = this.config.get('APPLE_IAP_PRIVATE_KEY');
        const bundleId = this.config.get('APPLE_IAP_BUNDLE_ID');
        if (!issuerId || !keyId || !privateKey || !bundleId) {
            throw new common_1.ServiceUnavailableException('In-app purchases are not configured yet');
        }
        const appAppleId = this.appleAppAppleId();
        const transactionId = await this.resolveAppleTransactionId(purchaseToken, bundleId, appAppleId);
        if (!transactionId) {
            throw new common_1.BadRequestException('Could not extract a transaction id from the Apple purchase token');
        }
        for (const environment of [app_store_server_library_1.Environment.PRODUCTION, app_store_server_library_1.Environment.SANDBOX]) {
            let statuses;
            try {
                const client = new app_store_server_library_1.AppStoreServerAPIClient(privateKey, keyId, issuerId, bundleId, environment);
                statuses = await client.getAllSubscriptionStatuses(transactionId);
            }
            catch (err) {
                if (environment === app_store_server_library_1.Environment.PRODUCTION &&
                    this.isAppleWrongEnvironment(err)) {
                    continue;
                }
                throw new common_1.BadRequestException(`Apple could not verify this purchase: ${this.errText(err)}`);
            }
            const verifier = new app_store_server_library_1.SignedDataVerifier(APPLE_ROOT_CAS, true, environment, bundleId, appAppleId);
            const match = await this.findAppleProduct(statuses, productId, verifier);
            if (!match) {
                throw new common_1.BadRequestException(`No Apple subscription found for product ${productId}`);
            }
            return match;
        }
        throw new common_1.BadRequestException('Apple did not recognise this transaction in Production or Sandbox');
    }
    async resolveAppleTransactionId(token, bundleId, appAppleId) {
        const receiptUtil = new app_store_server_library_1.ReceiptUtility();
        try {
            const id = receiptUtil.extractTransactionIdFromAppReceipt(token);
            if (id)
                return id;
        }
        catch {
        }
        try {
            const id = receiptUtil.extractTransactionIdFromTransactionReceipt(token);
            if (id)
                return id;
        }
        catch {
        }
        if (token.split('.').length === 3) {
            for (const environment of [app_store_server_library_1.Environment.PRODUCTION, app_store_server_library_1.Environment.SANDBOX]) {
                try {
                    const verifier = new app_store_server_library_1.SignedDataVerifier(APPLE_ROOT_CAS, true, environment, bundleId, appAppleId);
                    const txn = await verifier.verifyAndDecodeTransaction(token);
                    if (txn.transactionId)
                        return txn.transactionId;
                }
                catch {
                }
            }
        }
        return token || null;
    }
    async findAppleProduct(statuses, productId, verifier) {
        for (const group of statuses.data ?? []) {
            for (const item of group.lastTransactions ?? []) {
                if (!item.signedTransactionInfo)
                    continue;
                let txn;
                try {
                    txn = await verifier.verifyAndDecodeTransaction(item.signedTransactionInfo);
                }
                catch {
                    continue;
                }
                if (txn.productId !== productId)
                    continue;
                let isTrial = txn.offerType === app_store_server_library_1.OfferType.INTRODUCTORY_OFFER;
                if (!isTrial && item.signedRenewalInfo) {
                    try {
                        const renewal = await verifier.verifyAndDecodeRenewalInfo(item.signedRenewalInfo);
                        isTrial = renewal.offerType === app_store_server_library_1.OfferType.INTRODUCTORY_OFFER;
                    }
                    catch {
                    }
                }
                const expiresAt = txn.expiresDate
                    ? new Date(txn.expiresDate)
                    : new Date(0);
                const statusActive = item.status === app_store_server_library_1.Status.ACTIVE ||
                    item.status === app_store_server_library_1.Status.BILLING_GRACE_PERIOD;
                const isActive = statusActive &&
                    !txn.revocationDate &&
                    expiresAt.getTime() > Date.now();
                return {
                    productId: txn.productId ?? productId,
                    originalTxnId: txn.originalTransactionId ?? item.originalTransactionId ?? '',
                    expiresAt,
                    isTrial,
                    isActive,
                };
            }
        }
        return null;
    }
    isAppleWrongEnvironment(err) {
        if (err instanceof app_store_server_library_1.APIException) {
            if (err.httpStatusCode === 404)
                return true;
            const notFound = [
                4040010,
                4040005,
                4040006,
            ];
            return typeof err.apiError === 'number' && notFound.includes(err.apiError);
        }
        return false;
    }
    appleAppAppleId() {
        const raw = this.config.get('APPLE_IAP_APP_APPLE_ID');
        if (!raw)
            return undefined;
        const n = Number(raw);
        return Number.isFinite(n) ? n : undefined;
    }
    errText(err) {
        return err instanceof Error ? err.message : String(err);
    }
    async validateGoogle(productId, purchaseToken) {
        const packageName = this.config.get('GOOGLE_PLAY_PACKAGE_NAME');
        const serviceAccountJson = this.config.get('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON');
        if (!packageName || !serviceAccountJson) {
            throw new common_1.ServiceUnavailableException('In-app purchases are not configured yet');
        }
        let credentials;
        try {
            credentials = JSON.parse(serviceAccountJson);
        }
        catch {
            throw new common_1.ServiceUnavailableException('Google Play service account JSON is not valid');
        }
        const auth = new google_auth_library_1.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/androidpublisher'],
        });
        const url = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/' +
            `${encodeURIComponent(packageName)}/purchases/subscriptionsv2/tokens/` +
            encodeURIComponent(purchaseToken);
        let data;
        try {
            const res = await auth.request({ url });
            data = res.data;
        }
        catch (err) {
            throw new common_1.BadRequestException(`Google could not verify this purchase: ${this.errText(err)}`);
        }
        const state = data.subscriptionState;
        const isActive = state === 'SUBSCRIPTION_STATE_ACTIVE' ||
            state === 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD';
        const lineItems = data.lineItems ?? [];
        const chosen = lineItems.find((li) => li.productId === productId) ??
            lineItems
                .slice()
                .sort((a, b) => this.gTime(b.expiryTime) - this.gTime(a.expiryTime))[0];
        const latestExpiryMs = lineItems.reduce((max, li) => Math.max(max, this.gTime(li.expiryTime)), 0);
        const expiresAt = latestExpiryMs > 0 ? new Date(latestExpiryMs) : new Date(0);
        return {
            productId: chosen?.productId ?? productId,
            originalTxnId: purchaseToken,
            expiresAt,
            isTrial: this.googleLineItemIsTrial(chosen),
            isActive,
        };
    }
    gTime(iso) {
        if (!iso)
            return 0;
        const t = Date.parse(iso);
        return Number.isFinite(t) ? t : 0;
    }
    googleLineItemIsTrial(li) {
        const tags = li?.offerDetails?.offerTags;
        if (Array.isArray(tags)) {
            return tags.some((t) => /free[_-]?trial|trial/i.test(t ?? ''));
        }
        return false;
    }
    async handleAppleNotification(body) {
        if (!body?.signedPayload) {
            this.logger.warn('Apple notification missing signedPayload — ignoring');
            return;
        }
        const bundleId = this.config.get('APPLE_IAP_BUNDLE_ID');
        if (!bundleId) {
            this.logger.warn('Apple notifications not configured (no bundle id) — ignoring');
            return;
        }
        const appAppleId = this.appleAppAppleId();
        let payload = null;
        let verifier = null;
        for (const environment of [app_store_server_library_1.Environment.PRODUCTION, app_store_server_library_1.Environment.SANDBOX]) {
            try {
                const v = new app_store_server_library_1.SignedDataVerifier(APPLE_ROOT_CAS, true, environment, bundleId, appAppleId);
                payload = await v.verifyAndDecodeNotification(body.signedPayload);
                verifier = v;
                break;
            }
            catch (err) {
                this.logger.debug(`Apple notification ${environment} verify failed: ${this.errText(err)}`);
            }
        }
        if (!payload || !verifier) {
            this.logger.warn('Apple notification failed signature verification — ignoring');
            return;
        }
        let originalTransactionId;
        let expiresAt;
        let autoRenewOff = false;
        if (payload.data?.signedTransactionInfo) {
            try {
                const txn = await verifier.verifyAndDecodeTransaction(payload.data.signedTransactionInfo);
                originalTransactionId = txn.originalTransactionId;
                if (txn.expiresDate)
                    expiresAt = new Date(txn.expiresDate);
            }
            catch (err) {
                this.logger.warn(`Apple notification transaction decode failed: ${this.errText(err)}`);
            }
        }
        if (payload.data?.signedRenewalInfo) {
            try {
                const renewal = await verifier.verifyAndDecodeRenewalInfo(payload.data.signedRenewalInfo);
                if (renewal.autoRenewStatus === app_store_server_library_1.AutoRenewStatus.OFF)
                    autoRenewOff = true;
                if (!originalTransactionId) {
                    originalTransactionId = renewal.originalTransactionId;
                }
            }
            catch {
            }
        }
        let action;
        if (payload.notificationType === app_store_server_library_1.NotificationTypeV2.DID_CHANGE_RENEWAL_STATUS) {
            const disabled = payload.subtype === app_store_server_library_1.Subtype.AUTO_RENEW_DISABLED || autoRenewOff;
            action = disabled ? 'cancel' : 'ignore';
        }
        else {
            action = this.classifyAppleType(payload.notificationType);
        }
        await this.applyNotification('apple', originalTransactionId, action, expiresAt);
    }
    async handleGoogleNotification(body) {
        const dataB64 = body?.message?.data;
        if (!dataB64) {
            this.logger.warn('Google RTDN missing message.data — ignoring');
            return;
        }
        const expectedToken = this.config.get('GOOGLE_RTDN_VERIFICATION_TOKEN');
        if (expectedToken) {
            const presented = body.token ?? body.message?.attributes?.token;
            if (presented && presented !== expectedToken) {
                this.logger.warn('Google RTDN verification token mismatch — ignoring');
                return;
            }
            if (!presented) {
                this.logger.warn('Google RTDN verification token configured but not presented — proceeding on re-fetch');
            }
        }
        let decoded;
        try {
            decoded = JSON.parse(Buffer.from(dataB64, 'base64').toString('utf8'));
        }
        catch (err) {
            this.logger.warn(`Google RTDN payload not decodable: ${String(err)}`);
            return;
        }
        const notif = decoded.subscriptionNotification;
        if (!notif?.purchaseToken) {
            this.logger.log('Google RTDN with no subscriptionNotification — ignoring');
            return;
        }
        const action = this.classifyGoogleType(notif.notificationType);
        let expiresAt;
        if (action === 'renew') {
            try {
                const purchase = await this.validateGoogle(notif.subscriptionId ?? '', notif.purchaseToken);
                expiresAt = purchase.expiresAt;
            }
            catch (err) {
                this.logger.warn(`Google RTDN re-fetch failed: ${this.errText(err)}`);
            }
        }
        await this.applyNotification('google', notif.purchaseToken, action, expiresAt);
    }
    async applyNotification(platform, originalTxnId, action, expiresAt) {
        if (action === 'ignore' || !originalTxnId)
            return;
        const sub = await this.prisma.vendorSubscription.findFirst({
            where: { iapOriginalTxnId: originalTxnId },
            select: { id: true, vendorId: true },
        });
        if (!sub) {
            this.logger.warn(`${platform} notification for unknown txn ${originalTxnId} — ignoring`);
            return;
        }
        const now = new Date();
        if (action === 'renew') {
            await this.prisma.vendorSubscription.update({
                where: { id: sub.id },
                data: {
                    status: client_1.SubscriptionStatus.ACTIVE,
                    currentPeriodStart: now,
                    ...(expiresAt ? { currentPeriodEnd: expiresAt } : {}),
                    cancelAtPeriodEnd: false,
                },
            });
            return;
        }
        if (action === 'cancel') {
            await this.prisma.vendorSubscription.update({
                where: { id: sub.id },
                data: { cancelAtPeriodEnd: true },
            });
            return;
        }
        await this.prisma.$transaction([
            this.prisma.vendorSubscription.update({
                where: { id: sub.id },
                data: { status: client_1.SubscriptionStatus.EXPIRED, cancelledAt: now },
            }),
            this.prisma.vendorProfile.update({
                where: { id: sub.vendorId },
                data: { subscriptionTier: client_1.SubscriptionTier.BASIC },
            }),
        ]);
    }
    classifyAppleType(type) {
        switch (type) {
            case 'SUBSCRIBED':
            case 'DID_RENEW':
            case 'OFFER_REDEEMED':
                return 'renew';
            case 'DID_CHANGE_RENEWAL_STATUS':
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
    classifyGoogleType(type) {
        switch (type) {
            case 1:
            case 2:
            case 4:
            case 7:
                return 'renew';
            case 3:
                return 'cancel';
            case 5:
            case 13:
                return 'expire';
            case 12:
                return 'refund';
            default:
                return 'ignore';
        }
    }
    async requireVendor(userId) {
        const vendor = await this.prisma.vendorProfile.findUnique({
            where: { userId },
            select: { id: true },
        });
        if (!vendor) {
            throw new common_1.NotFoundException('Vendor profile not found — onboard first');
        }
        return vendor;
    }
};
exports.IapService = IapService;
exports.IapService = IapService = IapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(config_1.ConfigService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], IapService);
//# sourceMappingURL=iap.service.js.map