import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global() // Inject RedisService anywhere without re-importing RedisModule
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
