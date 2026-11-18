import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  LoggerService,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AxiosError } from 'axios';
import { HandledException } from '../types';
import { ErrorResponse } from '../interfaces/error-response.interface';

@Catch()
export class CatchAllFilter implements ExceptionFilter {
  private readonly loggerContext = CatchAllFilter.name;

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(Logger) private readonly loggerService: LoggerService,
  ) {}

  catch(exception: HandledException, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const requestUrl = httpAdapter.getRequestUrl(request);
    const path = `${request.method} ${requestUrl}`;

    if (this.isRoutingError(exception)) {
      httpAdapter.reply(
        response,
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Route ${path} does not exist ¯\\_(ツ)_/¯`,
        },
        HttpStatus.NOT_FOUND,
      );
      return;
    }

    const httpStatus = this.getHttpStatus(exception);
    const errorMessage = this.getErrorMessage(exception);
    const name = this.getErrorName(exception);

    const responseBody: ErrorResponse = {
      statusCode: httpStatus,
      message: errorMessage,
      timestamp: new Date().toISOString(),
      path: `${request.method} - ${requestUrl}`,
      name,
    };

    if (exception instanceof AxiosError) {
      this.loggerService.warn(
        `Upstream failure [${httpStatus}] ${path} → ${exception.config?.method?.toUpperCase()} - ${errorMessage}`,
        this.loggerContext,
      );
    } else {
      this.loggerService.error(
        `Exception [${httpStatus}] ${path} - ${name}: ${errorMessage}`,
        exception?.stack,
        this.loggerContext,
      );
    }

    httpAdapter.reply(response, responseBody, httpStatus);
  }

  private isRoutingError(exception: HandledException): boolean {
    if (!(exception instanceof NotFoundException)) return false;
    const exceptionResponse = exception.getResponse() as any;
    const message = exceptionResponse?.message || exception.message;
    return (
      typeof message === 'string' &&
      (message.startsWith('Cannot ') ||
        message.includes('Cannot find') ||
        (message === 'Not Found' && !exceptionResponse?.error))
    );
  }

  private getHttpStatus(exception: HandledException): number {
    if (exception instanceof HttpException) return exception.getStatus();
    if (exception instanceof AxiosError) {
      if (!exception.response) return HttpStatus.BAD_GATEWAY;
      const status = exception.response.status;
      return status >= 500 && status < 600
        ? HttpStatus.SERVICE_UNAVAILABLE
        : status;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorMessage(exception: HandledException): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return typeof response === 'string'
        ? response
        : Array.isArray(response['message'])
          ? response['message'].join(', ')
          : response['message'] || exception.message;
    }
    if (exception instanceof AxiosError) {
      const { config, response, code, message } = exception;
      const method = config?.method?.toUpperCase() || 'UNKNOWN';
      const status = response?.status || code || 'no response';
      const downstream =
        response?.data?.message || response?.data?.error || message;
      const downstreamStr =
        typeof downstream === 'string'
          ? downstream
          : JSON.stringify(downstream);
      return `Upstream request failed: ${method} [${status}] - ${downstreamStr}`;
    }
    return exception.message || 'InternalServerErrorException';
  }

  private getErrorName(exception: HandledException): string {
    if (exception instanceof HttpException) return exception.name;
    if (exception instanceof AxiosError) return 'AxiosError';
    return exception.name || 'Internal Server Error';
  }
}
