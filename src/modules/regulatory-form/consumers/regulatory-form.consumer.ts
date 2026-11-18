import { Inject, Logger, LoggerService } from '@nestjs/common';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import {
  TRADE_API_REGULATORY_FORM_CHARGES_QUEUE_NAME,
  TRADE_API_REGULATORY_FORM_VALIDATION_QUEUE_NAME,
  TRADE_API_TRADE_GOV_FORM_M_QUEUE_NAME,
  TRADE_API_TRMS_FORM_A_QUEUE_NAME,
  TRADE_API_TRMS_FORM_NCX_QUEUE_NAME,
  TRADE_API_TRMS_FORM_NXP_QUEUE_NAME,
} from 'src/common/constants';
import {
  RegulatoryFormMValidationCheckEnum,
  RegulatoryFormTypeEnum,
} from 'src/common/enums';
import { RegulatoryFormService } from '../regulatory-form.service';
import {
  FormARepository,
  FormMRepository,
  FormNCXRepository,
  FormNXPRepository,
} from '../regulatory-form.repository';
import { AppRedisService } from 'src/services/redis/redis.service';
import { FormM } from '../models/form-m.model';
import { FormA } from '../models/form-a.model';
import { FormNCX } from '../models/form-ncx.model';
import { FormNXP } from '../models/form-nxp.model';
import { logProcessorJobFailure } from 'src/common/utils/processor-error-log-summary.util';

@Processor(TRADE_API_REGULATORY_FORM_VALIDATION_QUEUE_NAME, {
  concurrency: 3,
})
export class RegulatoryFormValidationConsumer extends WorkerHost {
  constructor(
    @Inject(Logger) private readonly loggerService: LoggerService,
    private readonly regulatoryFormService: RegulatoryFormService,
  ) {
    super();
  }

  async process(job: Job) {
    this.loggerService.debug(
      `Processing job ${job.id} of type ${job.name} of ${TRADE_API_REGULATORY_FORM_VALIDATION_QUEUE_NAME}`,
      RegulatoryFormValidationConsumer.name,
    );

    try {
      const { applicationNumber } = job.data;

      switch (job.name) {
        case RegulatoryFormMValidationCheckEnum.ACCOUNT_RESTRICTION:
          await this.regulatoryFormService.validateAccountRestriction(
            applicationNumber,
            job.data.regulatoryFormType,
          );
          break;
        case RegulatoryFormMValidationCheckEnum.CUSTOMER_ACCOUNT_VALIDATION:
          await this.regulatoryFormService.validateCustomerAccount(
            applicationNumber,
            job.data.regulatoryFormType,
          );
          break;
        case RegulatoryFormMValidationCheckEnum.BALANCE_ENQUIRY:
          await this.regulatoryFormService.validateBalanceEnquiry(
            applicationNumber,
            job.data.regulatoryFormType,
          );
          break;
        case RegulatoryFormMValidationCheckEnum.WATCHLIST:
          await this.regulatoryFormService.validateWatchlistStatus(
            applicationNumber,
            job.data.regulatoryFormType,
          );
          break;
      }
    } catch (error) {
      logProcessorJobFailure(
        this.loggerService,
        job,
        RegulatoryFormValidationConsumer.name,
        error,
      );
      throw error;
    }
  }
}

@Processor(TRADE_API_TRADE_GOV_FORM_M_QUEUE_NAME, {
  concurrency: 3,
})
export class TradeGovFormMConsumer extends WorkerHost {
  constructor(
    @Inject(Logger) private readonly loggerService: LoggerService,
    private readonly formMRepository: FormMRepository,
    private readonly appRedisService: AppRedisService,
    @InjectQueue(TRADE_API_REGULATORY_FORM_VALIDATION_QUEUE_NAME)
    private readonly formMValidationQueue: Queue,
  ) {
    super();
  }

  async process(job: Job) {
    this.loggerService.debug(
      `Processing job ${job.id} of type ${job.name} of ${TRADE_API_TRADE_GOV_FORM_M_QUEUE_NAME}`,
      TradeGovFormMConsumer.name,
    );

    try {
      const formMData: Partial<FormM> = job.data;

      const existingFormM = await this.formMRepository.findOne({
        where: { applicationNumber: formMData.applicationNumber },
        attributes: ['applicationNumber'],
      });

      if (!existingFormM) {
        await this.formMRepository.create(formMData);
      }

      await this.appRedisService.cacheCurrentDayRegulatoryForms(
        formMData.applicationNumber,
        RegulatoryFormTypeEnum.FORM_M,
      );

      await this.formMValidationQueue.add(
        RegulatoryFormMValidationCheckEnum.CUSTOMER_ACCOUNT_VALIDATION,
        {
          applicationNumber: formMData.applicationNumber,
          regulatoryFormType: RegulatoryFormTypeEnum.FORM_M,
        },
      );
    } catch (error) {
      logProcessorJobFailure(
        this.loggerService,
        job,
        TradeGovFormMConsumer.name,
        error,
      );
      throw error;
    }
  }
}

@Processor(TRADE_API_TRMS_FORM_NXP_QUEUE_NAME, {
  concurrency: 3,
})
export class TrmsFormNXPConsumer extends WorkerHost {
  constructor(
    @Inject(Logger) private readonly loggerService: LoggerService,
    private readonly formNXPRepository: FormNXPRepository,
    @InjectQueue(TRADE_API_REGULATORY_FORM_VALIDATION_QUEUE_NAME)
    private readonly formMValidationQueue: Queue,
  ) {
    super();
  }

  async process(job: Job) {
    this.loggerService.debug(
      `Processing job ${job.id} of type ${job.name} of ${TRADE_API_TRMS_FORM_NXP_QUEUE_NAME}`,
      TrmsFormNXPConsumer.name,
    );

    try {
      const formNXPData: Partial<FormNXP> = job.data;

      const existingFormNXP = await this.formNXPRepository.findOne({
        where: { applicationNumber: formNXPData.applicationNumber },
        attributes: ['applicationNumber'],
      });

      if (!existingFormNXP) {
        await this.formNXPRepository.create(formNXPData);

        await this.formMValidationQueue.add(
          RegulatoryFormMValidationCheckEnum.CUSTOMER_ACCOUNT_VALIDATION,
          {
            applicationNumber: formNXPData.applicationNumber,
            regulatoryFormType: RegulatoryFormTypeEnum.FORM_NXP,
          },
        );
      }
    } catch (error) {
      logProcessorJobFailure(
        this.loggerService,
        job,
        TrmsFormNXPConsumer.name,
        error,
      );
      throw error;
    }
  }
}

@Processor(TRADE_API_TRMS_FORM_NCX_QUEUE_NAME, {
  concurrency: 3,
})
export class TrmsFormNCXConsumer extends WorkerHost {
  constructor(
    @Inject(Logger) private readonly loggerService: LoggerService,
    private readonly formNCXRepository: FormNCXRepository,
    @InjectQueue(TRADE_API_REGULATORY_FORM_VALIDATION_QUEUE_NAME)
    private readonly formMValidationQueue: Queue,
  ) {
    super();
  }

  async process(job: Job) {
    this.loggerService.debug(
      `Processing job ${job.id} of type ${job.name} of ${TRADE_API_TRMS_FORM_NCX_QUEUE_NAME}`,
      TrmsFormNCXConsumer.name,
    );

    try {
      const formNCXData: Partial<FormNCX> = job.data;

      const existingFormNCX = await this.formNCXRepository.findOne({
        where: { applicationNumber: formNCXData.applicationNumber },
        attributes: ['applicationNumber'],
      });

      if (!existingFormNCX) {
        await this.formNCXRepository.create(formNCXData);

        await this.formMValidationQueue.add(
          RegulatoryFormMValidationCheckEnum.CUSTOMER_ACCOUNT_VALIDATION,
          {
            applicationNumber: formNCXData.applicationNumber,
            regulatoryFormType: RegulatoryFormTypeEnum.FORM_NCX,
          },
        );
      }
    } catch (error) {
      logProcessorJobFailure(
        this.loggerService,
        job,
        TrmsFormNCXConsumer.name,
        error,
      );
      throw error;
    }
  }
}

@Processor(TRADE_API_TRMS_FORM_A_QUEUE_NAME, {
  concurrency: 3,
})
export class TrmsFormAConsumer extends WorkerHost {
  constructor(
    @Inject(Logger) private readonly loggerService: LoggerService,
    private readonly formARepository: FormARepository,
    @InjectQueue(TRADE_API_REGULATORY_FORM_VALIDATION_QUEUE_NAME)
    private readonly formMValidationQueue: Queue,
  ) {
    super();
  }

  async process(job: Job) {
    this.loggerService.debug(
      `Processing job ${job.id} of type ${job.name} of ${TRADE_API_TRMS_FORM_A_QUEUE_NAME}`,
      TrmsFormAConsumer.name,
    );

    try {
      const formAData: Partial<FormA> = job.data;

      const existingFormA = await this.formARepository.findOne({
        where: { applicationNumber: formAData.applicationNumber },
        attributes: ['applicationNumber'],
      });

      if (!existingFormA) {
        await this.formARepository.create(formAData);

        await this.formMValidationQueue.add(
          RegulatoryFormMValidationCheckEnum.CUSTOMER_ACCOUNT_VALIDATION,
          {
            applicationNumber: formAData.applicationNumber,
            regulatoryFormType: RegulatoryFormTypeEnum.FORM_A,
          },
        );
      }
    } catch (error) {
      logProcessorJobFailure(
        this.loggerService,
        job,
        TrmsFormAConsumer.name,
        error,
      );
      throw error;
    }
  }
}

@Processor(TRADE_API_REGULATORY_FORM_CHARGES_QUEUE_NAME, {
  concurrency: 3,
})
export class RegulatoryFormChargesConsumer extends WorkerHost {
  constructor(
    @Inject(Logger) private readonly loggerService: LoggerService,
    private readonly regulatoryFormService: RegulatoryFormService,
  ) {
    super();
  }

  async process(job: Job) {
    this.loggerService.debug(
      `Processing job ${job.id} of type ${job.name} of ${TRADE_API_REGULATORY_FORM_CHARGES_QUEUE_NAME}`,
      RegulatoryFormChargesConsumer.name,
    );

    try {
      const { applicationNumber } = job.data;

      await this.regulatoryFormService.processRegulatoryFormCharge(
        applicationNumber,
        job.data.regulatoryFormType,
      );
    } catch (error) {
      logProcessorJobFailure(
        this.loggerService,
        job,
        RegulatoryFormChargesConsumer.name,
        error,
      );
      throw error;
    }
  }
}
