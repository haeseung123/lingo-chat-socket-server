import * as Joi from 'joi';

export const validationSchema = Joi.object({
	// SERVER
	SERVER_PORT: Joi.number().required(),

	// REDIS
	REDIS_HOST: Joi.string().required(),
	REDIS_PORT: Joi.number().required(),
	REDIS_INSIGHT_PORT: Joi.number().required(),
});
