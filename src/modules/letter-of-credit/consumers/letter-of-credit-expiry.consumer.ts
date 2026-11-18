import { Inject, Logger, LoggerService } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { LETTER_OF_CREDIT_EXPIRY_QUEUE_NAME } from 'src/common/constants';
import { LetterOfCreditRepository } from '../letter-of-credit.repository';
import { Job } from 'bullmq';
import {
  LetterOfCreditActionTypeEnum,
  LetterOfCreditStateEnum,
} from 'src/common/enums';

@Processor(LETTER_OF_CREDIT_EXPIRY_QUEUE_NAME, {
  concurrency: 3,
})
export class LetterOfCrediExpiryConsumer extends WorkerHost {
  constructor(
    @Inject(Logger) private readonly loggerService: LoggerService,
    private readonly letterOfCreditRepository: LetterOfCreditRepository,
  ) {
    super();
  }

  async process(job: Job) {
    this.loggerService.debug(
      `Processing job ${job.id} of type ${job.name} of ${LETTER_OF_CREDIT_EXPIRY_QUEUE_NAME}`,
      LetterOfCrediExpiryConsumer.name,
    );

    const { lcReferenceNumber } = job.data;

    await this.letterOfCreditRepository.update(
      {
        status: LetterOfCreditActionTypeEnum.EXPIRY,
        state: LetterOfCreditStateEnum.INACTIVE,
      },
      { where: { referenceNumber: lcReferenceNumber } },
    );

    this.loggerService.debug(
      `Completed job ${job.id} of type ${job.name} of ${LETTER_OF_CREDIT_EXPIRY_QUEUE_NAME}`,
      LetterOfCrediExpiryConsumer.name,
    );
  }
}
