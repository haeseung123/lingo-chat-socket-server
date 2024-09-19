import { Module } from '@nestjs/common';
import { CrossWebsocketGateway } from './cross-websocket.gateway';
import { RedisModule } from 'src/global/redis/redis.module';
import { UsersModule } from 'src/users/users.module';

@Module({
	imports: [RedisModule, UsersModule],
	providers: [CrossWebsocketGateway],
})
export class CrossWebsocketModule {}
