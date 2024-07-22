import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { redisStorageService } from './redis-storage.service';
import redisConfiguration from '../configs/redis.configuration';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [redisConfiguration],
		}),
	],
	providers: [
		{
			provide: 'REDIS_CLIENT',
			useFactory: (configService: ConfigService) => {
				return new Redis({
					host: configService.getOrThrow('REDIS_HOST'),
					port: configService.getOrThrow('REDIS_PORT'),
				});
			},
			inject: [ConfigService],
		},
		redisStorageService,
	],
	exports: ['REDIS_CLIENT', redisStorageService],
})
export class RedisModule {}
