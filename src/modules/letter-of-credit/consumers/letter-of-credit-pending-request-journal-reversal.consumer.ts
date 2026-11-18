import { Inject, Logger, LoggerService } from '@nestjs/common';
import { Job } from 'bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { LETTER_OF_CREDIT_PENDING_REQUEST_JOURNAL_REVERSAL_QUEUE_NAME } from 'src/common/constants';
import { ApprovalStatusEnum } from 'src/common/enums';
import { LetterOfCreditRequestRepository } from '../letter-of-credit.repository';
import { CamsService } from 'src/services/cams/cams.service';
import { AuthService } from 'src/services/auth/auth.service';

export interface LetterOfCreditPendingRequestJournalReversalJobData {
  requestId: string;
  transactionId: string;
}

@Processor(LETTER_OF_CREDIT_PENDING_REQUEST_JOURNAL_REVERSAL_QUEUE_NAME, {
  concurrency: 3,
})
export class LetterOfCreditPendingRequestJournalReversalConsumer extends WorkerHost {
  constructor(
    @Inject(Logger) private readonly loggerService: LoggerService,
    private readonly letterOfCreditRequestRepository: LetterOfCreditRequestRepository,
    private readonly camsService: CamsService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  async process(job: Job<LetterOfCreditPendingRequestJournalReversalJobData>) {
    const { requestId, transactionId } = job.data ?? {};

    if (!requestId || !transactionId) {
      this.loggerService.warn(
        `Job ${job.id} missing requestId or transactionId; skipping.`,
        LetterOfCreditPendingRequestJournalReversalConsumer.name,
      );
      return;
    }

    this.loggerService.debug(
      `Processing job ${job.id} for requestId=${requestId}, transactionId=${transactionId} on ${LETTER_OF_CREDIT_PENDING_REQUEST_JOURNAL_REVERSAL_QUEUE_NAME}`,
      LetterOfCreditPendingRequestJournalReversalConsumer.name,
    );

    const request = await this.letterOfCreditRequestRepository.findOne({
      where: { requestId },
    });

    if (!request) {
      this.loggerService.warn(
        `Letter of Credit request ${requestId} not found; skipping journal reversal.`,
        LetterOfCreditPendingRequestJournalReversalConsumer.name,
      );
      return;
    }

    if (request.approvalStatus !== ApprovalStatusEnum.PENDING) {
      this.loggerService.debug(
        `Request ${requestId} approval status is ${request.approvalStatus}; skipping journal reversal.`,
        LetterOfCreditPendingRequestJournalReversalConsumer.name,
      );
      return;
    }

    const token = await this.authService.getSystemUserToken();

    await this.camsService.reverseJournalPosting(
      {
        transactionId,
        modifiedBy: request.initiatorId,
      },
      token,
    );

    this.loggerService.debug(
      `Reversed journal transaction ${transactionId} for pending request ${requestId}.`,
      LetterOfCreditPendingRequestJournalReversalConsumer.name,
    );
  }
}
