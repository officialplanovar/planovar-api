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
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const session_auth_guard_1 = require("../../common/guards/session-auth.guard");
const create_booking_dto_1 = require("./dto/create-booking.dto");
const bookings_service_1 = require("./bookings.service");
let BookingsController = class BookingsController {
    bookingsService;
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
    }
    create(req, dto) {
        return this.bookingsService.create(req.user.id, dto);
    }
    findAll(req, status, take, skip) {
        let parsedStatus;
        if (status) {
            const upper = status.toUpperCase();
            if (!(upper in client_1.BookingStatus)) {
                throw new common_1.BadRequestException(`Invalid status "${status}" — use ${Object.keys(client_1.BookingStatus).join(' | ')}`);
            }
            parsedStatus = upper;
        }
        return this.bookingsService.findAll(req.user.id, req.user.role, parsedStatus, take ? parseInt(take, 10) : 20, skip ? parseInt(skip, 10) : 0);
    }
    inboxSummary(req) {
        return this.bookingsService.inboxSummary(req.user.id);
    }
    findOne(req, id) {
        return this.bookingsService.findOne(id, req.user.id);
    }
    confirm(req, id) {
        return this.bookingsService.confirm(id, req.user.id);
    }
    reject(req, id, reason) {
        return this.bookingsService.reject(id, req.user.id, reason);
    }
    cancel(req, id) {
        return this.bookingsService.cancel(id, req.user.id);
    }
    complete(req, id) {
        return this.bookingsService.complete(id, req.user.id);
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a booking request (client)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_booking_dto_1.CreateBookingDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List bookings — auto-detects vendor or client role' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: client_1.BookingStatus }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: 'number' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: 'number' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('take')),
    __param(3, (0, common_1.Query)('skip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('inbox/summary'),
    (0, swagger_1.ApiOperation)({ summary: 'Vendor inbox: booking counts per status (PENDING = action needed)' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "inboxSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get booking details with quotes' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Vendor confirms a pending booking' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "confirm", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Vendor rejects a pending booking' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking UUID' }),
    (0, swagger_1.ApiBody)({
        required: false,
        schema: {
            type: 'object',
            properties: {
                reason: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Client cancels a booking (PENDING or CONFIRMED)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Vendor marks a confirmed booking as complete' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Booking UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "complete", null);
exports.BookingsController = BookingsController = __decorate([
    (0, swagger_1.ApiTags)('Bookings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, common_1.Controller)('bookings'),
    __param(0, (0, common_1.Inject)(bookings_service_1.BookingsService)),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map