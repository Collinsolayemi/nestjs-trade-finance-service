import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import getSequelizeConfig from './config/sequelize.config';
import { AuthModule } from './services/auth/auth.module';
import { MorganMiddleware } from './middlewares/morgan.middleware';
import { AuthenticateRequestMiddleware } from './middlewares/authenticate-request.middleware';
import { ConfigurationModule } from './modules/configuration/configuration.module';
import { LetterOfCreditModule } from './modules/letter-of-credit/letter-of-credit.module';
import { DocumentManagementModule } from './services/document-management/document-management.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { ExpressAdapter } from '@bull-board/express';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { LOCAL_ENVIRONMENT, TRADE_API_NAME_SPACE } from './common/constants';
import getRedisModuleOptions from './config/redis.config';
import * as basicAuth from 'express-basic-auth';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { RegulatoryFormModule } from './modules/regulatory-form/regulatory-form.module';
import { CreditLineModule } from './modules/credit-line/credit-line.module';
import { ActivityLogModule } from './modules/activity-log/activity-log.module';
import { PermissionGuard } from './common/guards';
import { HttpClientModule } from './services/http-client/http-client.module';
import { SwiftBicModule } from './modules/swift-bic-data/swift-bic-data.module';
import { TreasuryTradeServiceModule } from './services/treasury-trade/treasury-trade.module';
import { ConcessionGroupModule } from './services/concession-group/concession-group.module';
import { BillsForCollectionModule } from './modules/bills-for-collection/bills-for-collection.module';
import { GuaranteesModule } from './modules/guarantees/guarantees.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [
    DevtoolsModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('nodeEnv');
        return {
          http: nodeEnv.toLowerCase() === LOCAL_ENVIRONMENT.toLowerCase(),
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true,
    }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getSequelizeConfig(configService.get('db')),
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getRedisModuleOptions({
          redisConfig: configService.get('redisConfig'),
          namespace: TRADE_API_NAME_SPACE,
        }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redisConfig.host'),
          port: configService.get<number>('redisConfig.port'),
        },
      }),
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    AuthModule,
    ConfigurationModule,
    RegulatoryFormModule,
    LetterOfCreditModule,
    DocumentManagementModule,
    CreditLineModule,
    ActivityLogModule,
    HttpClientModule,
    SwiftBicModule,
    TreasuryTradeServiceModule,
    ConcessionGroupModule,
    BillsForCollectionModule,
    GuaranteesModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [Logger, AppService, PermissionGuard],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        basicAuth({
          users: {
            [this.configService.get<string>('redisConfig.queueUsername')]:
              this.configService.get<string>('redisConfig.queuePassword'),
          },
          challenge: true,
          unauthorizedResponse: 'Unauthorized',
        }),
      )
      .forRoutes({ path: 'queues', method: RequestMethod.ALL });

    consumer.apply(MorganMiddleware).forRoutes('*');

    consumer
      .apply(AuthenticateRequestMiddleware)
      .exclude(
        { path: 'swagger', method: RequestMethod.ALL },
        { path: 'swagger/(.*)', method: RequestMethod.ALL },
        { path: 'queues', method: RequestMethod.ALL },
        { path: 'queues/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
