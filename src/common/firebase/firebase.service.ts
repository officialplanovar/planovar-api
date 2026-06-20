import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import type { Message, MulticastMessage } from 'firebase-admin/messaging';
import { PrismaService } from '../../prisma/prisma.service';

export interface PushPayload {
  title: string;
  body: string;
  /** Deep-link data forwarded to the Flutter app */
  data?: Record<string, string>;
  /** Badge count for iOS */
  badge?: number;
}

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: admin.app.App | null = null;

  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    const projectId    = this.config.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail  = this.config.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey   = this.config.get<string>('FIREBASE_PRIVATE_KEY');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn(
        'Firebase credentials not set — push notifications will be skipped. ' +
        'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in .env',
      );
      return;
    }

    // Avoid re-initialising if the default app already exists (hot-reload safety)
    if (!admin.apps.length) {
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          // .env stores \n as literal \\n — convert back
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } else {
      this.app = admin.app();
    }

    this.logger.log('Firebase Admin initialised');
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  /**
   * Send a push notification to all devices registered to a user.
   * Silently skips if Firebase is unconfigured or the user has no tokens.
   * Automatically removes stale/invalid tokens from the DB.
   */
  async pushToUser(userId: string, payload: PushPayload): Promise<void> {
    if (!this.app) return;

    const tokens = await this.prisma.devicePushToken.findMany({
      where: { userId },
      select: { id: true, token: true, platform: true },
    });

    if (!tokens.length) return;

    await this.sendMulticast(
      tokens.map((t) => t.token),
      payload,
    );
  }

  /**
   * Send a push notification to multiple users at once.
   * Useful for group-chat notifications (all participants except sender).
   */
  async pushToUsers(userIds: string[], payload: PushPayload): Promise<void> {
    if (!this.app || !userIds.length) return;

    const tokens = await this.prisma.devicePushToken.findMany({
      where: { userId: { in: userIds } },
      select: { id: true, token: true },
    });

    if (!tokens.length) return;

    await this.sendMulticast(
      tokens.map((t) => t.token),
      payload,
    );
  }

  /**
   * Register or update a device push token for the current user.
   * Called on every app launch from the Flutter client.
   */
  async registerToken(
    userId: string,
    token: string,
    platform: 'IOS' | 'ANDROID' | 'WEB',
  ): Promise<void> {
    await this.prisma.devicePushToken.upsert({
      where: { token },
      create: { userId, token, platform },
      update: { userId, platform }, // re-associate if device switches accounts
    });
  }

  /**
   * Remove a device token (called on logout).
   */
  async removeToken(token: string): Promise<void> {
    await this.prisma.devicePushToken.deleteMany({ where: { token } });
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  private async sendMulticast(tokens: string[], payload: PushPayload): Promise<void> {
    if (!this.app || !tokens.length) return;

    // FCM multicast: max 500 tokens per call
    const chunks = this.chunk(tokens, 500);

    for (const chunk of chunks) {
      const message: MulticastMessage = {
        tokens: chunk,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data
          ? Object.fromEntries(
              Object.entries(payload.data).map(([k, v]) => [k, String(v)]),
            )
          : undefined,
        android: {
          priority: 'high',
          notification: { sound: 'default' },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: payload.badge,
            },
          },
        },
      };

      try {
        const response = await admin.messaging().sendEachForMulticast(message);

        // Clean up tokens that FCM reports as invalid
        const staleTokens: string[] = [];
        response.responses.forEach((resp, i) => {
          if (!resp.success) {
            const code = resp.error?.code;
            if (
              code === 'messaging/registration-token-not-registered' ||
              code === 'messaging/invalid-registration-token'
            ) {
              staleTokens.push(chunk[i]);
            }
          }
        });

        if (staleTokens.length) {
          await this.prisma.devicePushToken.deleteMany({
            where: { token: { in: staleTokens } },
          });
          this.logger.debug(`Removed ${staleTokens.length} stale FCM tokens`);
        }
      } catch (err) {
        this.logger.error('FCM multicast failed', err);
      }
    }
  }

  private chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }
}
