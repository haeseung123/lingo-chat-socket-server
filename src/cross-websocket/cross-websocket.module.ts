import { Module } from '@nestjs/common';
import { CrossWebsocketGateway } from './cross-websocket.gateway';

@Module({
  providers: [CrossWebsocketGateway]
})
export class CrossWebsocketModule {}
