import { Global, Module } from '@nestjs/common';
import { ChatRealtimeService } from './chat-realtime.service';

/** Global so both the MessagingGateway and the chat-order services can share
 *  the single socket Server instance without module-graph wiring. */
@Global()
@Module({
  providers: [ChatRealtimeService],
  exports: [ChatRealtimeService],
})
export class ChatRealtimeModule {}
