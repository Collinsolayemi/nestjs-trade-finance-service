import { Injectable } from '@nestjs/common';
import { CreateActivityLogDto } from './dto/create-log.dto';
import { ActivityLogRepository } from './activity-log.repository';

@Injectable()
export class ActivityLogService {
  constructor(private activityLogRepository: ActivityLogRepository) {}

  async create(data: CreateActivityLogDto) {
    return this.activityLogRepository.create(data);
  }

  async getLogsByRequestId(requestId: string) {
    return this.activityLogRepository.findAll({
      where: {
        requestId,
      },
    });
  }
}
