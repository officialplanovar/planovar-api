import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';

/**
 * Global so any module can inject AuditService to record money- or
 * score-affecting writes without re-importing.
 */
@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
