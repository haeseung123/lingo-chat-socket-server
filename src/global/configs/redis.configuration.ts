import { registerAs } from '@nestjs/config';

export default registerAs('redisConfiguration', () => ({
	redis: {
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT,
		db: process.env.REDIS_DB,
	},

	redisInsight: {
		port: process.env.REDIS_INSIGHT_PORT,
	},
}));
