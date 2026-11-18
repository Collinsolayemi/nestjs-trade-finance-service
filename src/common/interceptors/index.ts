import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  LoggerService,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpDataModificationMethod } from '../enums';
import { ActivityLogService } from 'src/modules/activity-log/activity-log.service';

@Injectable()
export class SuccessResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        const httpResponse = context.switchToHttp().getResponse();

        const statusCode =
          response?.statusCode && Number.isInteger(response.statusCode)
            ? response.statusCode
            : httpResponse.statusCode;

        const message =
          response?.message && typeof response.message === 'string'
            ? response.message
            : 'Operation successful';

        const responseData =
          response?.data !== undefined ? response.data : response;

        return {
          statusCode,
          success: true,
          message,
          data: responseData,
        };
      }),
    );
  }
}

@Injectable()
export class RequestBodyAndResponseInterceptor implements NestInterceptor {
  constructor(@Inject(Logger) private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    if (Object.values(HttpDataModificationMethod).includes(method)) {
      this.loggerService.debug(
        `[${method}] ${url} - Request Body: \n${JSON.stringify(request.body, null, 2)}`,
        RequestBodyAndResponseInterceptor.name,
      );
    }

    return next.handle();
  }
}

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(private readonly activityLogService: ActivityLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap((response) => {
        if (response?.requestId) {
          this.activityLogService.create({
            requestId: response?.requestId,
            description: response?.message,
          });
        }
      }),
    );
  }
}
