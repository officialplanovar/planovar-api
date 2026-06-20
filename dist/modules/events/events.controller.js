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
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const session_auth_guard_1 = require("../../common/guards/session-auth.guard");
const create_event_dto_1 = require("./dto/create-event.dto");
const update_event_dto_1 = require("./dto/update-event.dto");
const events_service_1 = require("./events.service");
let EventsController = class EventsController {
    eventsService;
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    create(req, dto) {
        return this.eventsService.create(req.user.id, dto);
    }
    findAll(req) {
        return this.eventsService.findAll(req.user.id);
    }
    findOne(req, id) {
        return this.eventsService.findOne(id, req.user.id);
    }
    update(req, id, dto) {
        return this.eventsService.update(id, req.user.id, dto);
    }
    cancel(req, id) {
        return this.eventsService.cancel(id, req.user.id);
    }
    addVendor(req, id, vendorId) {
        return this.eventsService.addVendor(id, req.user.id, vendorId);
    }
    removeVendor(req, id, vendorId) {
        return this.eventsService.removeVendor(id, req.user.id, vendorId);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new event (status starts as DRAFT)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_event_dto_1.CreateEventDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "List the current client's events" }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get event details including vendors and bookings' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update event details' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_event_dto_1.UpdateEventDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel an event' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/vendors'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a vendor to an event' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event UUID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['vendorId'],
            properties: {
                vendorId: { type: 'string', format: 'uuid' },
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('vendorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "addVendor", null);
__decorate([
    (0, common_1.Delete)(':id/vendors/:vendorId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a vendor from an event' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Event UUID' }),
    (0, swagger_1.ApiParam)({ name: 'vendorId', description: 'Vendor profile UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('vendorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "removeVendor", null);
exports.EventsController = EventsController = __decorate([
    (0, swagger_1.ApiTags)('Events'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, common_1.Controller)('events'),
    __param(0, (0, common_1.Inject)(events_service_1.EventsService)),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map