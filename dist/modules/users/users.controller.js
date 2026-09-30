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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const session_auth_guard_1 = require("../../common/guards/session-auth.guard");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const set_preferences_dto_1 = require("./dto/set-preferences.dto");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    getMe(req) {
        return this.usersService.getMe(req.user.id);
    }
    updateMe(req, dto) {
        return this.usersService.updateMe(req.user.id, dto);
    }
    setPreferences(req, dto) {
        return this.usersService.setPreferences(req.user.id, dto);
    }
    deleteMe(req) {
        return this.usersService.deleteMe(req.user.id);
    }
    deactivateMe(req) {
        return this.usersService.deactivateMe(req.user.id);
    }
    updateNotificationPrefs(req, body) {
        return this.usersService.updateNotificationPrefs(req.user.id, body);
    }
    registerDeviceToken(req, body) {
        return this.usersService.registerDeviceToken(req.user.id, body.token, body.platform);
    }
    removeDeviceToken(req, token) {
        return this.usersService.removeDeviceToken(req.user.id, token);
    }
    listFavourites(req) {
        return this.usersService.listFavourites(req.user.id);
    }
    listVendorFavourites(req) {
        return this.usersService.listVendorFavourites(req.user.id);
    }
    addVendorFavourite(req, vendorId) {
        return this.usersService.addVendorFavourite(req.user.id, vendorId);
    }
    removeVendorFavourite(req, vendorId) {
        return this.usersService.removeVendorFavourite(req.user.id, vendorId);
    }
    addFavourite(req, listingId) {
        return this.usersService.addFavourite(req.user.id, listingId);
    }
    removeFavourite(req, listingId) {
        return this.usersService.removeFavourite(req.user.id, listingId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the current user profile with location and preferences' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Update name, phone, or preferred location' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Post)('me/preferences'),
    (0, swagger_1.ApiOperation)({
        summary: 'Set event category preferences (replaces all existing preferences)',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, set_preferences_dto_1.SetPreferencesDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "setPreferences", null);
__decorate([
    (0, common_1.Delete)('me'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete the signed-in account (anonymizes PII, revokes sessions)',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deleteMe", null);
__decorate([
    (0, common_1.Post)('me/deactivate'),
    (0, swagger_1.ApiOperation)({
        summary: 'Deactivate (reversible pause) the signed-in account + sign out',
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deactivateMe", null);
__decorate([
    (0, common_1.Patch)('me/notification-prefs'),
    (0, swagger_1.ApiOperation)({ summary: 'Replace the signed-in user notification preferences' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateNotificationPrefs", null);
__decorate([
    (0, common_1.Post)('me/device-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a device push token (FCM or APNs)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "registerDeviceToken", null);
__decorate([
    (0, common_1.Delete)('me/device-token/:token'),
    (0, swagger_1.ApiOperation)({ summary: 'Deregister a device push token' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "removeDeviceToken", null);
__decorate([
    (0, common_1.Get)('me/favourites'),
    (0, swagger_1.ApiOperation)({ summary: 'List all favourited listings' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "listFavourites", null);
__decorate([
    (0, common_1.Get)('me/favourites/vendors'),
    (0, swagger_1.ApiOperation)({ summary: 'List all favourited vendors' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "listVendorFavourites", null);
__decorate([
    (0, common_1.Post)('me/favourites/vendors/:vendorId'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a vendor to favourites' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('vendorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "addVendorFavourite", null);
__decorate([
    (0, common_1.Delete)('me/favourites/vendors/:vendorId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a vendor from favourites' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('vendorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "removeVendorFavourite", null);
__decorate([
    (0, common_1.Post)('me/favourites/:listingId'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a listing to favourites' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('listingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "addFavourite", null);
__decorate([
    (0, common_1.Delete)('me/favourites/:listingId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a listing from favourites' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('listingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "removeFavourite", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, common_1.Controller)('users'),
    __param(0, (0, common_1.Inject)(users_service_1.UsersService)),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map