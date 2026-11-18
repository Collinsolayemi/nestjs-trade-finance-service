import * as winston from 'winston';
import * as moment from 'moment-timezone';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import * as util from 'util';
import configuration from './index';

export function createWinstonLogger(): winston.Logger {
  const config = configuration();
  const elasticSearch = config.elasticSearch;

  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.colorize({ all: true }),
        winston.format.metadata({
          fillExcept: ['timestamp', 'level', 'message', 'label'],
        }),
        winston.format.printf(({ timestamp, level, message, metadata }) => {
          const utcTimeStamp = moment(timestamp as string)
            .utc()
            .format();

          const metaString = Object.keys(metadata).length
            ? `\n${util.inspect(metadata, { colors: true, depth: 5 })}`
            : '';

          return `${utcTimeStamp} [${level}]: ${message} ${metaString}`;
        }),
      ),
    }),

    new ElasticsearchTransport({
      level: 'silly',
      clientOpts: {
        node: elasticSearch.host,
        auth: {
          username: elasticSearch.username,
          password: elasticSearch.password,
        },
      },
      indexPrefix: elasticSearch.indexName,
      indexSuffixPattern: elasticSearch.indexSuffixPattern,
      bufferLimit: 500,
      flushInterval: 3000,
      buffering: true,
    }),
  ];

  return winston.createLogger({
    level: 'silly',
    transports,
  });
}
