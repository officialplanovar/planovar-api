import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { SessionAuthGuard } from '../../common/guards/session-auth.guard';
import { FulfilmentService } from './fulfilment.service';
import { InvoiceService } from './invoice.service';
import { OrderRequestService } from './order-request.service';
import { QuoteFlowService } from './quote-flow.service';
import { TodoService } from './todo.service';
import { CreateOrderRequestDto } from './dto/create-order-request.dto';
import { CreateTodoDto } from './dto/create-todo.dto';
import { PostUpdateDto, SubmitReviewDto } from './dto/fulfilment.dto';
import { ReviseQuoteDto } from './dto/revise-quote.dto';
import { SendQuoteDto } from './dto/send-quote.dto';

const uid = (req: Request) => (req as any).user.id as string;

@ApiTags('Chat Orders')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard)
@Controller('chat-orders')
export class ChatOrdersController {
  constructor(
    @Inject(QuoteFlowService) private readonly quotes: QuoteFlowService,
    @Inject(InvoiceService) private readonly invoices: InvoiceService,
    @Inject(OrderRequestService) private readonly orders: OrderRequestService,
    @Inject(TodoService) private readonly todos: TodoService,
    @Inject(FulfilmentService) private readonly fulfilment: FulfilmentService,
  ) {}

  // ── Quotes (vendor sends/revises; client accepts/declines) ────────────────

  @Post('quotes')
  @ApiOperation({ summary: 'Vendor sends a quote into the DM chat (version 1)' })
  sendQuote(@Req() req: Request, @Body() dto: SendQuoteDto) {
    return this.quotes.sendQuote(uid(req), dto);
  }

  @Post('quotes/:id/revise')
  @ApiOperation({ summary: 'Vendor revises the active quote (new version, supersedes old)' })
  @ApiParam({ name: 'id', description: 'Current quote UUID' })
  revise(@Req() req: Request, @Param('id') id: string, @Body() dto: ReviseQuoteDto) {
    return this.quotes.reviseQuote(uid(req), id, dto);
  }

  @Post('quotes/:id/accept')
  @ApiOperation({ summary: 'Client accepts a quote → invoice + booking created' })
  @ApiParam({ name: 'id', description: 'Quote UUID' })
  accept(@Req() req: Request, @Param('id') id: string) {
    return this.quotes.acceptQuote(uid(req), id);
  }

  @Post('quotes/:id/decline')
  @ApiOperation({ summary: 'Client declines a quote (conversation stays open)' })
  @ApiParam({ name: 'id', description: 'Quote UUID' })
  decline(@Req() req: Request, @Param('id') id: string) {
    return this.quotes.declineQuote(uid(req), id);
  }

  // ── Milestone payments (direct client→vendor via Paystack) ────────────────

  @Post('milestones/:id/pay')
  @ApiOperation({ summary: 'Client starts paying a milestone — returns a Paystack checkout URL' })
  @ApiParam({ name: 'id', description: 'PaymentMilestone UUID' })
  payMilestone(@Req() req: Request, @Param('id') id: string) {
    return this.invoices.payMilestone(uid(req), id);
  }

  @Post('payments/:reference/verify')
  @ApiOperation({ summary: 'Confirm a milestone payment by Paystack reference (idempotent)' })
  @ApiParam({ name: 'reference', description: 'Paystack transaction reference' })
  verify(@Param('reference') reference: string) {
    return this.invoices.confirmByReference(reference);
  }

  // ── Direct orders (product / rental) ──────────────────────────────────────

  @Post('orders')
  @ApiOperation({ summary: 'Client requests a product/rental (no quote) — posts an ORDER_REQUEST' })
  createOrder(@Req() req: Request, @Body() dto: CreateOrderRequestDto) {
    return this.orders.createOrderRequest(uid(req), dto);
  }

  @Post('orders/:bookingId/accept')
  @ApiOperation({ summary: 'Vendor accepts an order → confirms booking + creates a payable invoice' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID' })
  acceptOrder(@Req() req: Request, @Param('bookingId') bookingId: string) {
    return this.orders.respondToOrder(uid(req), bookingId, true);
  }

  @Post('orders/:bookingId/decline')
  @ApiOperation({ summary: 'Vendor declines an order → cancels the booking' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID' })
  declineOrder(@Req() req: Request, @Param('bookingId') bookingId: string) {
    return this.orders.respondToOrder(uid(req), bookingId, false);
  }

  // ── Group-chat to-dos ─────────────────────────────────────────────────────

  @Post('todos')
  @ApiOperation({ summary: 'Create a to-do in an event group chat (with assignees)' })
  createTodo(@Req() req: Request, @Body() dto: CreateTodoDto) {
    return this.todos.createTodo(uid(req), dto);
  }

  @Post('todos/:id/toggle')
  @ApiOperation({ summary: 'Tick/untick your own task on a to-do' })
  @ApiParam({ name: 'id', description: 'Todo UUID' })
  toggleTodo(@Req() req: Request, @Param('id') id: string) {
    return this.todos.toggleMyTask(uid(req), id);
  }

  @Get('conversations/:id/todos')
  @ApiOperation({ summary: 'List to-dos for a group conversation' })
  @ApiParam({ name: 'id', description: 'Conversation UUID' })
  listTodos(@Req() req: Request, @Param('id') id: string) {
    return this.todos.listForConversation(uid(req), id);
  }

  @Delete('todos/:id')
  @ApiOperation({ summary: 'Delete a to-do (creator only)' })
  @ApiParam({ name: 'id', description: 'Todo UUID' })
  deleteTodo(@Req() req: Request, @Param('id') id: string) {
    return this.todos.deleteTodo(uid(req), id);
  }

  // ── Fulfilment → completion → review ──────────────────────────────────────

  @Post('bookings/:id/update')
  @ApiOperation({ summary: 'Vendor posts a progress update (TIMELINE_UPDATE card)' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  postUpdate(@Req() req: Request, @Param('id') id: string, @Body() dto: PostUpdateDto) {
    return this.fulfilment.postUpdate(uid(req), id, dto.message);
  }

  @Post('bookings/:id/deliver')
  @ApiOperation({ summary: 'Vendor marks delivered → booking COMPLETED + review request' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  markDelivered(@Req() req: Request, @Param('id') id: string) {
    return this.fulfilment.markDelivered(uid(req), id);
  }

  @Post('bookings/:id/return')
  @ApiOperation({ summary: 'Vendor confirms a rental return → completes + refunds deposit' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  confirmReturn(@Req() req: Request, @Param('id') id: string) {
    return this.fulfilment.confirmReturn(uid(req), id);
  }

  @Post('bookings/:id/review')
  @ApiOperation({ summary: 'Client reviews a completed booking (REVIEW_SUBMITTED card)' })
  @ApiParam({ name: 'id', description: 'Booking UUID' })
  submitReview(@Req() req: Request, @Param('id') id: string, @Body() dto: SubmitReviewDto) {
    return this.fulfilment.submitReview(uid(req), id, dto);
  }
}
