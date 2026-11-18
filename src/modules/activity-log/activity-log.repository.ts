import { InjectModel } from '@nestjs/sequelize';
import { TradeActivityLog } from './models/activity-logs.model';
import { Injectable } from '@nestjs/common';
import { FindOptions } from 'sequelize';

@Injectable()
export class ActivityLogRepository {
  constructor(
    @InjectModel(TradeActivityLog)
    private readonly model,
  ) {}

  async create(body: Partial<TradeActivityLog>): Promise<TradeActivityLog> {
    return this.model.create(body);
  }
  async findAll(
    options: FindOptions<TradeActivityLog>,
  ): Promise<TradeActivityLog[]> {
    return this.model.findAll(options);
  }
}
