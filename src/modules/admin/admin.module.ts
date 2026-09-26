import { Module } from '@nestjs/common';
import { AdminCategoriesController } from './admin-categories.controller';
import { AdminVendorsController } from './admin-vendors.controller';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminSubscriptionsController } from './admin-subscriptions.controller';
import { AdminAuditController } from './admin-audit.controller';
import { AdminSettingsController } from './admin-settings.controller';
import { AdminTeamController } from './admin-team.controller';
import { AdminPlansController } from './admin-plans.controller';
import { AdminService } from './admin.service';
import { CategoriesModule } from '../categories/categories.module';
import { VendorsModule } from '../vendors/vendors.module';

@Module({
  imports: [CategoriesModule, VendorsModule],
  controllers: [
    AdminCategoriesController,
    AdminVendorsController,
    AdminDashboardController,
    AdminUsersController,
    AdminSubscriptionsController,
    AdminAuditController,
    AdminSettingsController,
    AdminTeamController,
    AdminPlansController,
  ],
  providers: [AdminService],
})
export class AdminModule {}
