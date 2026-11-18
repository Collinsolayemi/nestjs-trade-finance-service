import { Module } from '@nestjs/common';
import { CreditLineService } from './credit-line.service';
import { CreditLineController } from './credit-line.controller';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import {
  CreditLineRepository,
  CreditLineRequestRepository,
} from './credit-line.repository';
import { HelperModule } from 'src/helpers/helper.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { CreditLineRequest } from './models/credit-line-request.model';
import { CreditLine } from './models/credit-line.model';

@Module({
  imports: [
    SequelizeModule.forFeature([CreditLineRequest, CreditLine]),
    ActivityLogModule,
    HelperModule,
  ],
  controllers: [CreditLineController],
  providers: [
    CreditLineService,
    CreditLineRepository,
    CreditLineRequestRepository,
  ],
  exports: [CreditLineService],
})
export class CreditLineModule {}
