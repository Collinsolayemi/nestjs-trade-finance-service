import { Cron } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';

export function SafeCron(cronExpression: string): MethodDecorator {
  return function (target, propertyKey, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const logger = new Logger(target.constructor.name);

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        const stack = error instanceof Error ? error.stack : undefined;
        logger.error(`${String(propertyKey)} failed: ${msg}`, stack);
      }
    };

    Cron(cronExpression)(target, propertyKey, descriptor);
    return descriptor;
  };
}
