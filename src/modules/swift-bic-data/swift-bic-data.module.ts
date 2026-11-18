import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SwiftBic as SwiftBicModel } from './models/swift-bic-data.model';
import { SwiftBicRepository } from './swift-bic-data.repository';
import { SwiftBicService } from './swift-bic-data.service';
import { SwiftBicController } from './swift-bic-data.controller';

@Module({
  imports: [SequelizeModule.forFeature([SwiftBicModel])],
  providers: [SwiftBicRepository, SwiftBicService],
  controllers: [SwiftBicController],
})
export class SwiftBicModule {}
