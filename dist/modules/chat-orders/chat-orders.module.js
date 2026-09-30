"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatOrdersModule = void 0;
const common_1 = require("@nestjs/common");
const notifications_module_1 = require("../notifications/notifications.module");
const reviews_module_1 = require("../reviews/reviews.module");
const chat_orders_controller_1 = require("./chat-orders.controller");
const chat_card_service_1 = require("./chat-card.service");
const fulfilment_service_1 = require("./fulfilment.service");
const invoice_service_1 = require("./invoice.service");
const order_request_service_1 = require("./order-request.service");
const quote_flow_service_1 = require("./quote-flow.service");
const todo_service_1 = require("./todo.service");
let ChatOrdersModule = class ChatOrdersModule {
};
exports.ChatOrdersModule = ChatOrdersModule;
exports.ChatOrdersModule = ChatOrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [notifications_module_1.NotificationsModule, reviews_module_1.ReviewsModule],
        controllers: [chat_orders_controller_1.ChatOrdersController],
        providers: [
            chat_card_service_1.ChatCardService,
            invoice_service_1.InvoiceService,
            quote_flow_service_1.QuoteFlowService,
            order_request_service_1.OrderRequestService,
            todo_service_1.TodoService,
            fulfilment_service_1.FulfilmentService,
        ],
        exports: [invoice_service_1.InvoiceService, quote_flow_service_1.QuoteFlowService],
    })
], ChatOrdersModule);
//# sourceMappingURL=chat-orders.module.js.map