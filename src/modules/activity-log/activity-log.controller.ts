import {
  Controller,
  Get,
  Param,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('activity-logs')
@ApiBearerAuth()
@Controller('activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get(':id')
  async find(@Param('id', new ParseUUIDPipe()) id: string) {
    const data = await this.activityLogService.getLogsByRequestId(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Activity logs retrieved successfully',
      data,
    };
  }
}
