import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { BankController } from './bank.controller';
import { ChatOrdersController } from './chat-orders.controller';
import { ChatCardService } from './chat-card.service';
import { FulfilmentService } from './fulfilment.service';
import { InvoiceService } from './invoice.service';
import { OrderRequestService } from './order-request.service';
import { PaystackDirectPayService } from './paystack-directpay.service';
import { QuoteFlowService } from './quote-flow.service';
import { TodoService } from './todo.service';

/**
 * Chat-order domain: chat-centric quotes (versioned) → invoice + milestones,
 * with direct client→vendor Paystack payments (0% platform cut). Distinct from
 * the legacy escrow-based QuotesModule/PaymentsModule (superseded).
 */
@Module({
  imports: [NotificationsModule, ReviewsModule],
  controllers: [ChatOrdersController, BankController],
  providers: [
    ChatCardService,
    PaystackDirectPayService,
    InvoiceService,
    QuoteFlowService,
    OrderRequestService,
    TodoService,
    FulfilmentService,
  ],
  exports: [InvoiceService, QuoteFlowService, PaystackDirectPayService],
})
export class ChatOrdersModule {}
