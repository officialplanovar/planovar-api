import { Global, Module } from '@nestjs/common';
import { TypesenseProvider } from './typesense.provider';
import { TypesenseSyncService } from './typesense-sync.service';

@Global()
@Module({
  providers: [TypesenseProvider, TypesenseSyncService],
  exports: [TypesenseProvider, TypesenseSyncService],
})
export class TypesenseModule {}
