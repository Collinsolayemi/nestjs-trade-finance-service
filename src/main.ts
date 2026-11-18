import {
  HttpAdapterHost,
  NestFactory,
  PartialGraphHost,
  Reflector,
} from '@nestjs/core';
import { AppModule } from './app.module';
import { CatchAllFilter } from './common/filters/exception.filter';
import { ValidationPipe } from '@nestjs/common';
import {
  ActivityLogInterceptor,
  RequestBodyAndResponseInterceptor,
  SuccessResponseInterceptor,
} from './common/interceptors';
import { ConfigService } from '@nestjs/config';
import { PermissionGuard } from './common/guards';
import { setupSwagger } from './config/swagger.config';
import { NodeEnvEnum, NonDevelopmentEnvironmentEnum } from './common/enums';
import { TRADE_API_ASCII } from './common/constants';
import helmet from 'helmet';
import * as fs from 'fs';
import { ActivityLogService } from './modules/activity-log/activity-log.service';
import { Sequelize } from 'sequelize-typescript';
import createDatabaseSequences from './common/utils/create-database-sequences.util';
import { createWinstonLogger } from './config/winston.config';
import { WinstonModule } from 'nest-winston';

async function bootstrap() {
  const winstonLogger = createWinstonLogger();

  const app = await NestFactory.create(AppModule, {
    snapshot: true,
    abortOnError: false,
    logger: WinstonModule.createLogger({
      instance: winstonLogger,
    }),
  });

  const httpAdapterHost = app.get(HttpAdapterHost);
  const configService = app.get(ConfigService);
  const activityLogService = app.get(ActivityLogService);
  const nodeEnv = configService.get<string>('nodeEnv')?.toLowerCase();

  app.use(helmet());
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const allowed = configService.getOrThrow<string[]>('cors.origin');

      if (allowed.length === 0) {
        return callback(null, true);
      }

      if (
        origin.startsWith('http://localhost') &&
        (nodeEnv.toLowerCase() === NodeEnvEnum.DEV.toLowerCase() ||
          nodeEnv.toLowerCase() === NodeEnvEnum.LOCAL.toLowerCase())
      ) {
        callback(null, true);
      } else if (allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  });

  app.setGlobalPrefix('v1');

  if (
    !Object.values(NonDevelopmentEnvironmentEnum).includes(
      nodeEnv as NonDevelopmentEnvironmentEnum,
    )
  ) {
    const sequelize = app.get(Sequelize);
    await createDatabaseSequences(sequelize);
    setupSwagger(app);
  }

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalGuards(app.get(PermissionGuard));
  app.useGlobalGuards(new PermissionGuard(app.get(Reflector)));
  app.useGlobalInterceptors(new SuccessResponseInterceptor());
  app.useGlobalInterceptors(
    new RequestBodyAndResponseInterceptor(
      WinstonModule.createLogger({
        instance: winstonLogger,
      }),
    ),
  );
  app.useGlobalInterceptors(new ActivityLogInterceptor(activityLogService));
  app.useGlobalFilters(
    new CatchAllFilter(
      httpAdapterHost,
      WinstonModule.createLogger({
        instance: winstonLogger,
      }),
    ),
  );

  const port = configService.get<number>('port') || 3000;
  await app.listen(port, () => {
    winstonLogger.info(TRADE_API_ASCII);
    winstonLogger.info(`🚀 Application is listening on port ${port}`);
  });
}

bootstrap().catch(() => {
  fs.writeFileSync('graph.json', PartialGraphHost.toString() ?? '');
  process.exit(1);
});
