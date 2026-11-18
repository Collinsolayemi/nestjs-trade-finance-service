import { Inject, Logger, LoggerService } from '@nestjs/common';
import {
  BillsForCollectionRepository,
  BillsForCollectionRequestRepository,
} from '../bills-for-collection.repository';
import { HelperService } from 'src/helpers/helper.service';
import { logProcessorJobFailure } from 'src/common/utils/processor-error-log-summary.util';
import { Job } from 'bullmq';
import { TRADE_API_BILLS_FOR_COLLECTION_SWIFT_MESSAGE_QUEUE_NAME } from 'src/common/constants';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import * as os from 'os';
import { SwiftMessageJobActionEnum } from 'src/common/enums';
import { BillsForCollection } from '../models/bills-for-collection.model';
import { BillsForCollectionReceiveAcknowledgement } from '../models/bills-for-collection-receive-akcnowledgement.model';
import { BillsForCollectionAcceptance } from '../models/bills-for-collection-acceptance.model';
import { BillsForCollectionNonAcceptanceOrNonPayment } from '../models/bills-for-collection-non-acceptance-or-non-payment.model';

const billsForCollectionSwiftMessageConcurrency = os.cpus().length;

@Processor(TRADE_API_BILLS_FOR_COLLECTION_SWIFT_MESSAGE_QUEUE_NAME, {
  concurrency: billsForCollectionSwiftMessageConcurrency,
})
export class BillsForCollectionSwiftMessageConsumer extends WorkerHost {
  constructor(
    @Inject(Logger) private readonly loggerService: LoggerService,
    private readonly helperService: HelperService,
    private readonly billsForCollectionRequestRepository: BillsForCollectionRequestRepository,
    private readonly billsForCollectionRepository: BillsForCollectionRepository,
  ) {
    super();
  }

  async process(job: Job) {
    try {
      this.loggerService.debug(
        `Processing job ${job.id} of type ${job.name} of ${TRADE_API_BILLS_FOR_COLLECTION_SWIFT_MESSAGE_QUEUE_NAME}`,
        BillsForCollectionSwiftMessageConsumer.name,
      );
      switch (job.name) {
        case SwiftMessageJobActionEnum.GENERATE_MT_400_AND_UPLOAD:
          await this.generateMt400AndUpload();
          break;
        case SwiftMessageJobActionEnum.GENERATE_MT_410_AND_UPLOAD:
          await this.generateMt410AndUpload(job.data);
          break;
        case SwiftMessageJobActionEnum.GENERATE_MT_412_AND_UPLOAD:
          await this.generateMt412AndUpload(job.data);
          break;
        case SwiftMessageJobActionEnum.GENERATE_MT_416_AND_UPLOAD:
          await this.generateMt416AndUpload();
          break;
        case SwiftMessageJobActionEnum.GENERATE_MT_420_AND_UPLOAD:
          await this.generateMt420AndUpload(job.data);
          break;
        case SwiftMessageJobActionEnum.GENERATE_MT_422_AND_UPLOAD:
          await this.generateMt422AndUpload(job.data);
          break;
        case SwiftMessageJobActionEnum.GENERATE_MT_430_AND_UPLOAD:
          await this.generateMt430AndUpload();
          break;
        case SwiftMessageJobActionEnum.GENERATE_MT_754_AND_UPLOAD:
          await this.generateMt754AndUpload();
          break;
        case SwiftMessageJobActionEnum.GENERATE_MT_756_AND_UPLOAD:
          await this.generateMt756AndUpload();
          break;
        case SwiftMessageJobActionEnum.GENERATE_MT_202_AND_UPLOAD:
          await this.generateMt202AndUpload();
          break;
        default:
          this.loggerService.warn(
            `No handler for job type ${job.name} of ${TRADE_API_BILLS_FOR_COLLECTION_SWIFT_MESSAGE_QUEUE_NAME}`,
          );
      }
    } catch (error) {
      logProcessorJobFailure(
        this.loggerService,
        job,
        BillsForCollectionSwiftMessageConsumer.name,
        error,
      );
    }
  }

  private async generateMt400AndUpload() {}

  private async generateMt410AndUpload(_data: {
    billsForCollection: BillsForCollection;
    requestId: string;
    billsForCollectionReceiveAcknowledgement?: BillsForCollectionReceiveAcknowledgement;
  }) {
    void _data;
  }

  private async generateMt412AndUpload(_data: {
    billsForCollection: BillsForCollection;
    requestId: string;
    billsForCollectionAcceptance?: BillsForCollectionAcceptance;
  }) {
    void _data;
  }

  private async generateMt416AndUpload() {}

  private async generateMt420AndUpload(_data: {
    requestId: string;
    billsForCollectionAcceptance?: BillsForCollectionAcceptance;
    billsForCollectionNonAcceptanceOrNonPayment?: BillsForCollectionNonAcceptanceOrNonPayment;
    billsForCollection: BillsForCollection;
  }) {
    void _data;
  }

  private async generateMt422AndUpload(_data: {
    requestId: string;
    billsForCollectionAcceptance?: BillsForCollectionAcceptance;
    billsForCollectionNonAcceptanceOrNonPayment?: BillsForCollectionNonAcceptanceOrNonPayment;
    billsForCollection?: BillsForCollection;
  }) {
    void _data;
  }

  private async generateMt430AndUpload() {}

  private async generateMt754AndUpload() {}

  private async generateMt756AndUpload() {}

  private async generateMt202AndUpload() {}
}
