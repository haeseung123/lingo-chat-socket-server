import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class redisStorageService {
	constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

	async get(key: string) {
		return this.redisClient.get(key);
	}

	async set(key: string, value: string) {
		await this.redisClient.set(key, value);
	}

	async del(key: string) {
		await this.redisClient.del(key);
	}
}
