import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  ClauseRepository,
  ClauseRequestRepository,
} from './configuration.repository';
import { Clause as ClauseModel } from 'src/modules/configuration/models/clause.model';
import { ClauseService } from './configuration.service';
import { ClauseController } from './configuration.controller';
import { ClauseRequest as ClauseRequestModel } from './models/clause-request.model';

@Module({
  imports: [SequelizeModule.forFeature([ClauseRequestModel, ClauseModel])],
  providers: [ClauseRequestRepository, ClauseRepository, ClauseService],
  controllers: [ClauseController],
})
export class ConfigurationModule {}
