import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Blocks in-platform transaction endpoints when the platform runs in
 * subscription-only mode — the default, per the 4 June 2026 MoM
 * ("subscriptions are the only means of payment; no transactions on the platform").
 *
 * Toggle with env `TRANSACTIONS_ENABLED=true|false` (default: false).
 * Throws 404 (not 403) so disabled money-flows are simply invisible to clients.
 *
 * Applied to the transactional surface (payouts, payment initiate/verify/escrow).
 * The underlying modules + Prisma models are intentionally left intact so the
 * hybrid path can be re-enabled by flipping the flag.
 */
@Injectable()
export class TransactionsEnabledGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(_context: ExecutionContext): boolean {
    const enabled =
      String(this.config.get('TRANSACTIONS_ENABLED') ?? 'false').toLowerCase() ===
      'true';
    if (!enabled) {
      throw new NotFoundException('In-platform transactions are disabled');
    }
    return true;
  }
}
