import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { TRADE_API_NAME_SPACE } from 'src/common/constants';
import * as moment from 'moment-timezone';
import {
  IANATimeZoneDatabaseEnum,
  RegulatoryFormTypeEnum,
} from 'src/common/enums';

@Injectable()
export class AppRedisService {
  private readonly tradeApiRedis: Redis | null;

  constructor(
    @Inject(Logger) private readonly loggerService: LoggerService,
    private readonly redisService: RedisService,
  ) {
    this.tradeApiRedis = this.redisService.getOrThrow(TRADE_API_NAME_SPACE);
  }

  async cacheCurrentDayRegulatoryForms(
    applicationNumber: string,
    regulatoryFormType: RegulatoryFormTypeEnum,
  ) {
    const currentDay = moment()
      .tz(IANATimeZoneDatabaseEnum.LAGOS)
      .startOf('day')
      .format('YYYY-MM-DD');
    const cacheKey = `${regulatoryFormType}-${currentDay}`;
    try {
      await this.tradeApiRedis?.sadd(cacheKey, applicationNumber);

      this.loggerService.log(
        `Added application number ${applicationNumber} to Redis set for ${cacheKey}`,
        AppRedisService.name,
      );
    } catch (error) {
      this.loggerService.error(
        `Failed to cache application number ${applicationNumber} for ${cacheKey}: ${error.message}`,
        AppRedisService.name,
      );
      throw error;
    }
  }

  async checkCurrentDayRegulatoryFormApplicationNumber(
    applicationNumber: string,
    regulatoryFormType: RegulatoryFormTypeEnum,
  ): Promise<boolean> {
    const currentDay = moment()
      .tz(IANATimeZoneDatabaseEnum.LAGOS)
      .startOf('day')
      .format('YYYY-MM-DD');
    const cacheKey = `${regulatoryFormType}-${currentDay}`;
    try {
      const isMember = await this.tradeApiRedis?.sismember(
        cacheKey,
        applicationNumber,
      );
      return isMember === 1; // Redis returns 1 if member, 0 if not
    } catch (error) {
      this.loggerService.error(
        `Failed to check application number ${applicationNumber} for ${cacheKey}: ${error.message}`,
        AppRedisService.name,
      );
      throw error;
    }
  }

  async set(key: string, value: any, ttl?: number) {
    if (ttl) {
      return this.tradeApiRedis.set(key, value, 'EX', ttl);
    }
    return this.tradeApiRedis.set(key, value);
  }

  async get(key: string) {
    return this.tradeApiRedis.get(key);
  }
}
