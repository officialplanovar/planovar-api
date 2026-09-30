import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsWebhookController } from './subscriptions-webhook.controller';
import { IapController } from './iap.controller';
import { SubscriptionsService } from './subscriptions.service';
import { IapService } from './iap.service';

@Module({
  controllers: [
    SubscriptionsController,
    SubscriptionsWebhookController,
    IapController,
  ],
  providers: [SubscriptionsService, IapService],
  exports: [SubscriptionsService, IapService],
})
export class SubscriptionsModule {}
