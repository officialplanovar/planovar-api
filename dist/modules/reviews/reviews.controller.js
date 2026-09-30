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
exports.ReviewsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const session_auth_guard_1 = require("../../common/guards/session-auth.guard");
const create_review_dto_1 = require("./dto/create-review.dto");
const review_response_dto_1 = require("./dto/review-response.dto");
const reviews_service_1 = require("./reviews.service");
let ReviewsController = class ReviewsController {
    reviewsService;
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    create(req, dto) {
        return this.reviewsService.create(req.user.id, dto);
    }
    findMyReviews(req, take, skip) {
        return this.reviewsService.findMyReviews(req.user.id, take ? parseInt(take, 10) : 20, skip ? parseInt(skip, 10) : 0);
    }
    findAllForVendor(vendorId, take, skip) {
        return this.reviewsService.findAllForVendor(vendorId, take ? parseInt(take, 10) : 20, skip ? parseInt(skip, 10) : 0);
    }
    findOne(id) {
        return this.reviewsService.findOne(id);
    }
    respond(req, id, dto) {
        return this.reviewsService.respond(id, req.user.id, dto);
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a review for a completed booking (client)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_review_dto_1.CreateReviewDto]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'List reviews submitted by the current user' }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: 'number' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: 'number' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('take')),
    __param(2, (0, common_1.Query)('skip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "findMyReviews", null);
__decorate([
    (0, common_1.Get)('vendor/:vendorId'),
    (0, swagger_1.ApiOperation)({ summary: 'List reviews for a vendor (public)' }),
    (0, swagger_1.ApiParam)({ name: 'vendorId', description: 'Vendor profile UUID' }),
    (0, swagger_1.ApiQuery)({ name: 'take', required: false, type: 'number' }),
    (0, swagger_1.ApiQuery)({ name: 'skip', required: false, type: 'number' }),
    __param(0, (0, common_1.Param)('vendorId')),
    __param(1, (0, common_1.Query)('take')),
    __param(2, (0, common_1.Query)('skip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "findAllForVendor", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single review by ID (public)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Review UUID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/respond'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Vendor responds to a review' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Review UUID' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, review_response_dto_1.ReviewResponseDto]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "respond", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, swagger_1.ApiTags)('reviews'),
    (0, common_1.Controller)('reviews'),
    __param(0, (0, common_1.Inject)(reviews_service_1.ReviewsService)),
    __metadata("design:paramtypes", [reviews_service_1.ReviewsService])
], ReviewsController);
//# sourceMappingURL=reviews.controller.js.map