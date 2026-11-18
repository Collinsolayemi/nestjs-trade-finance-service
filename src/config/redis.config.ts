import type { Redis } from 'ioredis';
import { createWinstonLogger } from './winston.config';

export interface RedisConfigInput {
  url: string;
}

export interface GetRedisModuleOptionsParams {
  redisConfig: RedisConfigInput;
  namespace: string;
}

export default function getRedisModuleOptions({
  redisConfig,
  namespace,
}: GetRedisModuleOptionsParams) {
  const winstonLogger = createWinstonLogger();

  return {
    readyLog: true,
    errorLog: true,
    config: [
      {
        namespace,
        url: redisConfig.url,
        onClientCreated(client: Redis) {
          client.on('error', (err) => {
            winstonLogger.debug('Error Creating Trade API Redis Client', err);
          });
          client.on('ready', () => {
            winstonLogger.debug('Trade API Redis Client Successfully Created');
          });
        },
      },
    ],
  };
}
