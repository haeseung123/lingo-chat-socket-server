import { Module } from '@nestjs/common';
import { UsersGateway } from './users.gateway';
import { RedisModule } from 'src/global/redis/redis.module';

@Module({
	imports: [RedisModule],
	providers: [UsersGateway],
})
export class UsersModule {}
