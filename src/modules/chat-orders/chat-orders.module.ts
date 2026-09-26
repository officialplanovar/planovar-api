import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { ChatOrdersController } from './chat-orders.controller';
import { ChatCardService } from './chat-card.service';
import { FulfilmentService } from './fulfilment.service';
import { InvoiceService } from './invoice.service';
import { OrderRequestService } from './order-request.service';
import { QuoteFlowService } from './quote-flow.service';
import { TodoService } from './todo.service';

/**
 * Chat-order domain: chat-centric quotes (versioned) → display-only invoice +
 * booking. Payment happens off-platform between client and vendor — the platform
 * only bills vendors for their subscription (see SubscriptionsModule).
 */
@Module({
  imports: [NotificationsModule, ReviewsModule],
  controllers: [ChatOrdersController],
  providers: [
    ChatCardService,
    InvoiceService,
    QuoteFlowService,
    OrderRequestService,
    TodoService,
    FulfilmentService,
  ],
  exports: [InvoiceService, QuoteFlowService],
})
export class ChatOrdersModule {}
