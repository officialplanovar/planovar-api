import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { OAuthRelayController } from './oauth-relay.controller';

@Module({
  controllers: [AuthController, OAuthRelayController],
})
export class AuthModule {}
