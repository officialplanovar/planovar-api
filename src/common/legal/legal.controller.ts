import { Controller, Get, Header } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiExcludeController } from '@nestjs/swagger';
import { accountDeletionPage } from './account-deletion.page';

/**
 * Public, unauthenticated legal/compliance pages served as HTML.
 *
 * Reachable without a token (no SessionAuthGuard) and throttle-exempt so store
 * reviewers and users can always open them. Currently: the account & data
 * deletion page required by Google Play / Apple.
 */
@ApiExcludeController()
@Controller()
export class LegalController {
  @Get('account-deletion')
  @SkipThrottle()
  @Header('Content-Type', 'text/html; charset=utf-8')
  accountDeletion(): string {
    return accountDeletionPage();
  }
}
