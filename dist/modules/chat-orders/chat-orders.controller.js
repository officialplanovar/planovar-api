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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatOrdersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const session_auth_guard_1 = require("../../common/guards/session-auth.guard");
const fulfilment_service_1 = require("./fulfilment.service");
const invoice_service_1 = require("./invoice.service");
const order_request_service_1 = require("./order-request.service");
const quote_flow_service_1 = require("./quote-flow.service");
const todo_service_1 = require("./todo.service");
const create_order_request_dto_1 = require("./dto/create-order-request.dto");
const create_todo_dto_1 = require("./dto/create-todo.dto");
const fulfilment_dto_1 = require("./dto/fulfilment.dto");
const revise_quote_dto_1 = require("./dto/revise-quote.dto");
const send_quote_dto_1 = require("./dto/send-quote.dto");
const uid = (req) => req.user.id;
let ChatOrdersController = class ChatOrdersController {
    quotes;
    invoices;
    orders;
    todos;
    fulfilment;
    constructor(quotes, invoices, orders, todos, fulfilment) {
        this.quotes = quotes;
        this.invoices = invoices;
        this.orders = orders;
        this.todos = todos;
        this.fulfilment = fulfilment;
    }
    sendQuote(req, dto) {
        return this.quotes.sendQuote(uid(req), dto);
    }
    revise(req, id, dto) {
        return this.quotes.reviseQuote(uid(req), id, dto);
    }
    accept(req, id) {
        return this.quotes.acceptQuote(uid(req), id);
    }
    decline(req, id) {
        return this.quotes.declineQuote(uid(req), id);
    }
    payMilestone(req, id) {
        return this.invoices.payMilestone(uid(req), id);
    }
    verify(reference) {
        return this.invoices.confirmByReference(reference);
    }
    createOrder(req, dto) {
        return this.orders.createOrderRequest(uid(req), dto);
    }
    acceptOrder(req, bookingId) {
        return this.orders.respondToOrder(uid(req), bookingId, true);
    }
    declineOrder(req, bookingId) {
        return this.orders.respondToOrder(uid(req), bookingId, false);
    }
    createTodo(req, dto) {
        return this.todos.createTodo(uid(req), dto);
    }
    toggleTodo(req, id) {
        return this.todos.toggleMyTask(uid(req), id);
    }
    listTodos(req, id) {
        return this.todos.listForConversation(uid(req), id);
    }
    deleteTodo(req, id) {
        return this.todos.deleteTodo(uid(req), id);
    }
    postUpdate(req, id, dto) {
        return this.fulfilment.postUpdate(uid(req), id, dto.message);
    }
    markDelivered(req, id) {
        return this.fulfilment.markDelivered(uid(req), id);
    }
    confirmReturn(req, id) {
        return this.fulfilment.confirmReturn(uid(req), id);
    }
    submitReview(req, id, dto) {
        return this.fulfilment.submitReview(uid(req), id, dto);
    }
};
exports.ChatOrdersController = ChatOrdersController;
__decorate([
    (0, common_1.Post)('quotes'),
    (0, swagger_1.ApiOperation)({ summary: 'Vendor sends a quote into the DM chat (version 1)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, send_quote_dto_1.SendQuoteDto]),
    __metadata("design:returntype", void 0)
], ChatOrdersController.prototype, "sendQuote", null);
__decorate([
    (0, common_1.Post)('quotes/:id/revise'),
    (0, swagger_1.ApiOperation)({ summary: 'Vendor revises the active quote (new version, supersedes old)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Current quote UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, revise_quote_dto_1.ReviseQuoteDto]),
    __metadata("design:returntype", void 0)
], ChatOrdersController.prototype, "revise", null);
__decorate([
    (0, common_1.Post)('quotes/:id/accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Client accepts a quote → invoice + booking created' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Quote UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChatOrdersController.prototype, "accept", null);
__decorate([
    (0, common_1.Post)('quotes/:id/decline'),
    (0, swagger_1.ApiOperation)({ summary: 'Client declines a quote (conversation stays open)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Quote UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChatOrdersController.prototype, "decline", null);
__decorate([
    (0, common_1.Post)('milestones/:id/pay'),
    (0, swagger_1.ApiOperation)({ summary: 'Client starts paying a milestone — returns a Paystack checkout URL' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'PaymentMilestone UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChatOrdersController.prototype, "payMilestone", null);
__decorate([
    (0, common_1.Post)('payments/:reference/verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm a milestone payment by Paystack reference (idempotent)' }),
    (0, swagger_1.ApiParam)({ name: 'reference', description: 'Paystack transaction reference' }),
    __param(0, (0, common_1.Param)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChatOrdersController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)('orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Client requests a product/rental (no quote) — posts an ORDER_REQUEST' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_order_request_dto_1.CreateOrderRequestDto]),
    __metadata("design:returntype", void 0)
], ChatOrdersController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Post)('orders/:bookingId/accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Vendor accepts an order → confirms booking + creates a payable invoice' }),
    (0, swagger_1.ApiParam)({ name: 'bookingId', description: 'Booking UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChatOrdersController.prototype, "acceptOrder", null);
__decorate([
    (0, common_1.Post)('orders/:bookingId/decline'),
    (0, swagger_1.ApiOperation)({ summary: 'Vendor declines an order → cancels the booking' }),
    (0, swagger_1.ApiParam)({ name: 'bookingId', description: 'Booking UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChatOrdersController.prototype, "declineOrder", null);
__decorate([
    (0, common_1.Post)('todos'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a to-do in an event group chat (with assignees)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_todo_dto_1.CreateTodoDto]),
    __metadata("design:returntype", void 0)
], ChatOrdersController.prototype, "createTodo", null);
__decorate([
    (0, common_1.Post)('todos/:id/toggle'),
    (0, swagger_1.ApiOperation)({ summary: 'Tick/untick your own task on a to-do' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Todo UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChatOrdersController.prototype, "toggleTodo", null);
__decorate([
    (0, common_1.Get)('conversations/:id/todos'),
    (0, swagger_1.ApiOperation)({ summary: 'List to-dos for a group conversation' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Conversation UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChatOrdersController.prototype, "listTodos", null);
__decorate([
    (0, common_1.Delete)('todos/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a to-do (creator only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Todo UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChatOrdersController.prototype, "deleteTodo", null);
__decorate([
    (0, common_1.Post)('bookings/:id/update'),
    (0, swagger_1.ApiOperation)({ summary: 'Vendor posts a progress update (TIMELINE_UPDATE card)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, fulfilment_dto_1.PostUpdateDto]),
    __metadata("design:returntype", void 0)
], ChatOrdersController.prototype, "postUpdate", null);
__decorate([
    (0, common_1.Post)('bookings/:id/deliver'),
    (0, swagger_1.ApiOperation)({ summary: 'Vendor marks delivered → booking COMPLETED + review request' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChatOrdersController.prototype, "markDelivered", null);
__decorate([
    (0, common_1.Post)('bookings/:id/return'),
    (0, swagger_1.ApiOperation)({ summary: 'Vendor confirms a rental return → completes + refunds deposit' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChatOrdersController.prototype, "confirmReturn", null);
__decorate([
    (0, common_1.Post)('bookings/:id/review'),
    (0, swagger_1.ApiOperation)({ summary: 'Client reviews a completed booking (REVIEW_SUBMITTED card)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, fulfilment_dto_1.SubmitReviewDto]),
    __metadata("design:returntype", void 0)
], ChatOrdersController.prototype, "submitReview", null);
exports.ChatOrdersController = ChatOrdersController = __decorate([
    (0, swagger_1.ApiTags)('Chat Orders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, common_1.Controller)('chat-orders'),
    __param(0, (0, common_1.Inject)(quote_flow_service_1.QuoteFlowService)),
    __param(1, (0, common_1.Inject)(invoice_service_1.InvoiceService)),
    __param(2, (0, common_1.Inject)(order_request_service_1.OrderRequestService)),
    __param(3, (0, common_1.Inject)(todo_service_1.TodoService)),
    __param(4, (0, common_1.Inject)(fulfilment_service_1.FulfilmentService)),
    __metadata("design:paramtypes", [quote_flow_service_1.QuoteFlowService,
        invoice_service_1.InvoiceService,
        order_request_service_1.OrderRequestService,
        todo_service_1.TodoService,
        fulfilment_service_1.FulfilmentService])
], ChatOrdersController);
//# sourceMappingURL=chat-orders.controller.js.map