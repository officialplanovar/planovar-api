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
exports.ListingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const session_auth_guard_1 = require("../../common/guards/session-auth.guard");
const create_listing_dto_1 = require("./dto/create-listing.dto");
const update_listing_dto_1 = require("./dto/update-listing.dto");
const listings_service_1 = require("./listings.service");
class AddMediaDto {
    url;
    publicId;
    type;
    sortOrder;
}
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', description: 'Public URL of the media file' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddMediaDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string', description: 'Cloud storage public ID for deletion' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddMediaDto.prototype, "publicId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.MediaType, enumName: 'MediaType', description: 'Media type: IMAGE | VIDEO | AUDIO' }),
    (0, class_validator_1.IsEnum)(client_1.MediaType),
    __metadata("design:type", String)
], AddMediaDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'number', description: 'Display sort order' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AddMediaDto.prototype, "sortOrder", void 0);
let ListingsController = class ListingsController {
    listingsService;
    constructor(listingsService) {
        this.listingsService = listingsService;
    }
    create(req, dto) {
        return this.listingsService.create(req.user.id, dto);
    }
    findAll(req) {
        return this.listingsService.findAllForUser(req.user.id);
    }
    findOne(id) {
        return this.listingsService.findOne(id);
    }
    update(id, req, dto) {
        return this.listingsService.update(id, req.user.id, dto);
    }
    remove(id, req) {
        return this.listingsService.remove(id, req.user.id);
    }
    addMedia(id, req, body) {
        return this.listingsService.addMedia(id, req.user.id, {
            url: body.url,
            publicId: body.publicId,
            type: body.type,
            sortOrder: body.sortOrder,
        });
    }
    removeMedia(mediaId, req) {
        return this.listingsService.removeMedia(mediaId, req.user.id);
    }
};
exports.ListingsController = ListingsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new listing' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_listing_dto_1.CreateListingDto]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "List the current vendor's listings" }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single listing (public)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Listing UUID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a listing' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Listing UUID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_listing_dto_1.UpdateListingDto]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete a listing (sets isActive=false)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Listing UUID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/media'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add a media item to a listing' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Listing UUID' }),
    (0, swagger_1.ApiBody)({ type: AddMediaDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, AddMediaDto]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "addMedia", null);
__decorate([
    (0, common_1.Delete)(':id/media/:mediaId'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a media item from a listing — returns publicId for cloud cleanup' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Listing UUID' }),
    (0, swagger_1.ApiParam)({ name: 'mediaId', description: 'ListingMedia UUID' }),
    __param(0, (0, common_1.Param)('mediaId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ListingsController.prototype, "removeMedia", null);
exports.ListingsController = ListingsController = __decorate([
    (0, swagger_1.ApiTags)('Listings'),
    (0, common_1.Controller)('listings'),
    __param(0, (0, common_1.Inject)(listings_service_1.ListingsService)),
    __metadata("design:paramtypes", [listings_service_1.ListingsService])
], ListingsController);
//# sourceMappingURL=listings.controller.js.map