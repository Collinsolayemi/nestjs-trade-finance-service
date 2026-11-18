import { Module } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogController } from './activity-log.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ActivityLogRepository } from './activity-log.repository';
import { TradeActivityLog } from './models/activity-logs.model';

@Module({
  imports: [SequelizeModule.forFeature([TradeActivityLog])],
  controllers: [ActivityLogController],
  providers: [ActivityLogService, ActivityLogRepository],
  exports: [ActivityLogService],
})
export class ActivityLogModule {}
