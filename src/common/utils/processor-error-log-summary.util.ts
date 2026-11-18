import type { LoggerService } from '@nestjs/common';
import type { Job } from 'bullmq';
import { AxiosError } from 'axios';

export function logProcessorJobFailure(
  logger: LoggerService,
  job: Pick<Job, 'id' | 'name'>,
  consumerName: string,
  error: unknown,
): void {
  if (error instanceof AxiosError) {
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = error.config?.url || 'unknown';
    const reason = error.code || error.message;
    logger.error(
      `Job ${job.id} [${job.name}] failed: ${method} ${url} [${reason}]`,
      undefined,
      consumerName,
    );
    return;
  }
  const msg = error instanceof Error ? error.message : String(error);
  logger.error(
    `Job ${job.id} [${job.name}] failed: ${msg}`,
    error instanceof Error ? error.stack : undefined,
    consumerName,
  );
}
