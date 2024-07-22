import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import redisConfiguration from './global/configs/redis.configuration';
import { validationSchema } from './global/configs/validation.schema';
import { CacheModule } from './cache/cache.module';
import { RedisModule } from './global/redis/redis.module';
import { redisStorageService } from './global/redis/redis-storage.service';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			cache: true,
			load: [redisConfiguration],
			envFilePath: `.development.env`,
			validationSchema,
		}),
		UsersModule,
		RedisModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
