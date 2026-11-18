import { Dialect } from 'sequelize';
import * as moment from 'moment-timezone';
import { IANATimeZoneDatabaseEnum } from 'src/common/enums';
import { createWinstonLogger } from './winston.config';

export interface SequelizeDbConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  dialect: string;
  ssl: boolean;
  synchronize: boolean;
  min: number;
  max: number;
  idle: number;
  evict: number;
}

export default function getSequelizeConfig(db: SequelizeDbConfig) {
  const sslEnabled = db.ssl;
  const winstonLogger = createWinstonLogger();

  return {
    dialect: db.dialect as Dialect,
    host: db.host,
    port: db.port,
    username: db.username,
    password: db.password,
    database: db.database,
    autoLoadModels: true,
    synchronize: db.synchronize,
    sync: { alter: db.synchronize },
    timezone: IANATimeZoneDatabaseEnum.LAGOS,
    dialectOptions: sslEnabled
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : undefined,
    define: {
      timestamps: true,
      paranoid: true,
      getterMethods: {
        createdAt() {
          const value = this.getDataValue('createdAt');
          return value
            ? moment(value).tz(IANATimeZoneDatabaseEnum.LAGOS).format()
            : null;
        },
        updatedAt() {
          const value = this.getDataValue('updatedAt');
          return value
            ? moment(value).tz(IANATimeZoneDatabaseEnum.LAGOS).format()
            : null;
        },
        deletedAt() {
          const value = this.getDataValue('deletedAt');
          return value
            ? moment(value).tz(IANATimeZoneDatabaseEnum.LAGOS).format()
            : null;
        },
      },
    },
    pool: {
      min: db.min,
      max: db.max,
      idle: db.idle,
      evict: db.evict,
    },
    logging: (msg: string) => winstonLogger.debug(msg),
    benchmark: true,
  };
}
