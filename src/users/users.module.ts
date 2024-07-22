import { Module } from '@nestjs/common';
import { UsersGateway } from './users.gateway';
import { RedisModule } from 'src/global/redis/redis.module';
import { redisStorageService } from 'src/global/redis/redis-storage.service';
// import { CacheService } from 'src/cache/cache.service';

@Module({
	imports: [RedisModule],
	providers: [UsersGateway],
})
export class UsersModule {}
