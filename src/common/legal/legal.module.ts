import { Module } from '@nestjs/common';
import { LegalController } from './legal.controller';

/** Public legal/compliance HTML pages (account deletion, etc.). */
@Module({ controllers: [LegalController] })
export class LegalModule {}
