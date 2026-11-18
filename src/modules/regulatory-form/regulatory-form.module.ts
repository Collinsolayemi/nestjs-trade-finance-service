import { Global, Logger, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FormM as FormMModel } from './models/form-m.model';
import {
  RegulatoryFormChargesAndTaxesRepository,
  FormARepository,
  FormMRepository,
  FormNXPRepository,
  FormNCXRepository,
} from './regulatory-form.repository';
import { RegulatoryFormService } from './regulatory-form.service';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import {
  TRADE_API_REGULATORY_FORM_CHARGES_QUEUE_NAME,
  TRADE_API_REGULATORY_FORM_VALIDATION_QUEUE_NAME,
  TRADE_API_TRADE_GOV_FORM_M_QUEUE_NAME,
  TRADE_API_TRMS_FORM_A_QUEUE_NAME,
  TRADE_API_TRMS_FORM_NCX_QUEUE_NAME,
  TRADE_API_TRMS_FORM_NXP_QUEUE_NAME,
} from 'src/common/constants';
import { RegulatoryFormController } from './regulatory-form.controller';
import {
  RegulatoryFormChargesConsumer,
  RegulatoryFormValidationConsumer,
  TradeGovFormMConsumer,
  TrmsFormAConsumer,
  TrmsFormNCXConsumer,
  TrmsFormNXPConsumer,
} from './consumers/regulatory-form.consumer';
import { ScheduleModule } from '@nestjs/schedule';
import { StpException as StpExceptionModel } from './models/stp-exception.model';
import { StpExceptionRepository } from './stp-exception.repository';
import { CustomerManagementModule } from 'src/services/customer-management/customer-management.module';
import { CamsModule } from 'src/services/cams/cams.module';
import { StpExceptionRequest as StpExceptionResolveRequestModel } from './models/stp-exception-request.model';
import { StpExceptionRequestRepository } from './stp-exception-request.repository';
import { StpExceptionController } from './stp-exception.controller';
import { StpExceptionRequestController } from './stp-exception-request.controller';
import { ComplianceModule } from 'src/services/compliance/compliance.module';
import { OnePlugModule } from 'src/services/one-plug/one-plug.module';
import { RegulatoryFormChargesAndTaxes as FormMChargesAndTaxesModel } from './models/regulatory-form-charges-and-taxes.model';
import { ProductManagementModule } from 'src/services/product-management/product-management.module';
import { TRMSModule } from 'src/services/trms/trms.module';
import { FormNXP as FormNXPModel } from './models/form-nxp.model';
import { FormNCX as FormNCXModel } from './models/form-ncx.model';
import { FormA as FormAModel } from './models/form-a.model';

@Global()
@Module({
  imports: [
    SequelizeModule.forFeature([
      FormMModel,
      FormNXPModel,
      FormNCXModel,
      FormAModel,
      FormMChargesAndTaxesModel,
      StpExceptionModel,
      StpExceptionResolveRequestModel,
    ]),
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: TRADE_API_REGULATORY_FORM_VALIDATION_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 1,
        backoff: { type: 'exponential', delay: 2000 },
      },
    }),
    BullBoardModule.forFeature({
      name: TRADE_API_REGULATORY_FORM_VALIDATION_QUEUE_NAME,
      adapter: BullMQAdapter,
    }),
    BullModule.registerQueue({
      name: TRADE_API_TRADE_GOV_FORM_M_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 1,
        backoff: { type: 'exponential', delay: 2000 },
      },
    }),
    BullBoardModule.forFeature({
      name: TRADE_API_TRADE_GOV_FORM_M_QUEUE_NAME,
      adapter: BullMQAdapter,
    }),
    BullModule.registerQueue({
      name: TRADE_API_TRMS_FORM_NXP_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 1,
        backoff: { type: 'exponential', delay: 2000 },
      },
    }),
    BullBoardModule.forFeature({
      name: TRADE_API_TRMS_FORM_NXP_QUEUE_NAME,
      adapter: BullMQAdapter,
    }),
    BullModule.registerQueue({
      name: TRADE_API_TRMS_FORM_NCX_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 1,
        backoff: { type: 'exponential', delay: 2000 },
      },
    }),
    BullBoardModule.forFeature({
      name: TRADE_API_TRMS_FORM_NCX_QUEUE_NAME,
      adapter: BullMQAdapter,
    }),
    BullModule.registerQueue({
      name: TRADE_API_TRMS_FORM_A_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 1,
        backoff: { type: 'exponential', delay: 2000 },
      },
    }),
    BullBoardModule.forFeature({
      name: TRADE_API_TRMS_FORM_A_QUEUE_NAME,
      adapter: BullMQAdapter,
    }),
    BullModule.registerQueue({
      name: TRADE_API_REGULATORY_FORM_CHARGES_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 1,
        backoff: { type: 'exponential', delay: 2000 },
      },
    }),
    BullBoardModule.forFeature({
      name: TRADE_API_REGULATORY_FORM_CHARGES_QUEUE_NAME,
      adapter: BullMQAdapter,
    }),
    CustomerManagementModule,
    CamsModule,
    ComplianceModule,
    OnePlugModule,
    TRMSModule,
    ProductManagementModule,
  ],
  providers: [
    Logger,
    RegulatoryFormValidationConsumer,
    FormMRepository,
    FormNXPRepository,
    FormNCXRepository,
    FormARepository,
    RegulatoryFormChargesAndTaxesRepository,
    RegulatoryFormService,
    StpExceptionRepository,
    StpExceptionRequestRepository,
    TradeGovFormMConsumer,
    RegulatoryFormChargesConsumer,
    TrmsFormAConsumer,
    TrmsFormNCXConsumer,
    TrmsFormNXPConsumer,
  ],
  controllers: [
    RegulatoryFormController,
    StpExceptionController,
    StpExceptionRequestController,
  ],
  exports: [FormMRepository, RegulatoryFormService],
})
export class RegulatoryFormModule {}
