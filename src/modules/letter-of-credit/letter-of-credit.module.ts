import { Logger, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LetterOfCreditRequest as LetterOfCreditRequestmodel } from './models/letter-of-credit-request.model';
import { LetterOfCredit as LetterOfCreditModel } from './models/letter-of-credit.model';
import { LetterOfCreditCancellation as LetterOfCreditCancellationModel } from './models/letter-of-credit-cancellation.model';
import {
  LetterOfCreditAssignmentOfProceedRepository,
  LetterOfCreditAdjustmentRepository,
  LetterOfCreditAmendmentRepository,
  LetterOfCreditCancellationRepository,
  LetterOfCreditDocumentLodgementRepository,
  LetterOfCreditFreeFormatMessageRepository,
  LetterOfCreditPaymentRepository,
  LetterOfCreditRepository,
  LetterOfCreditRequestRepository,
  LetterOfCreditTemplateRepository,
} from './letter-of-credit.repository';
import { LetterOfCreditService } from './letter-of-credit.service';
import { LetterOfCreditController } from './letter-of-credit.controller';
import {
  LETTER_OF_CREDIT_EXPIRY_QUEUE_NAME,
  LETTER_OF_CREDIT_PENDING_REQUEST_JOURNAL_REVERSAL_QUEUE_NAME,
  TRADE_API_LETTER_OF_CREDIT_SWIFT_MESSAGE_QUEUE_NAME,
} from 'src/common/constants';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { LetterOfCrediSwiftMessageConsumer } from './consumers/letter-of-credit-swift-message.consumer';
import { LetterOfCreditPendingRequestJournalReversalConsumer } from './consumers/letter-of-credit-pending-request-journal-reversal.consumer';
import { LetterOfCreditDocumentLodgement as LetterOfCreditDocumentLodgementModel } from './models/letter-of-credit-document-lodgement.model';
import { RegulatoryFormModule } from '../regulatory-form/regulatory-form.module';
import { LetterOfCreditAmendment as LetterOfCreditAmendmentModel } from './models/letter-of-credit-amendment.model';
import { CamsModule } from 'src/services/cams/cams.module';
import { HelperModule } from 'src/helpers/helper.module';
import { TradeProductFactoryModule } from 'src/services/trade-product-factory/trade-product-factory.module';
import { CreditLineModule } from '../credit-line/credit-line.module';
import { LetterOfCreditAdjustment as LetterOfCreditAdjustmentModel } from './models/letter-of-credit-adjustment.model';
import { LetterOfCreditFreeFormatMessage as LetterOfCreditFreeFormatMessageModel } from './models/letter-of-credit-free-format-message.model';
import { LetterOfCreditTemplate as LetterOfCreditTemplateModel } from './models/letter-of-credit-template.model';
import { TreasuryTradeServiceModule } from 'src/services/treasury-trade/treasury-trade.module';
import { LetterOfCreditPayment as LetterOfCreditPaymentModel } from './models/letter-of-credit-payment.model';
import { LetterOfCreditAssignmentOfProceed as LetterOfCreditAssignmentOfProceedModel } from './models/letter-of-credit-assignment-of-proceed.model';
import { ProductManagementModule } from 'src/services/product-management/product-management.module';
import { CustomerManagementModule } from 'src/services/customer-management/customer-management.module';
import { RulesConfigurationModule } from 'src/services/rules-configuration/rules-configuration.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      LetterOfCreditRequestmodel,
      LetterOfCreditModel,
      LetterOfCreditAmendmentModel,
      LetterOfCreditAdjustmentModel,
      LetterOfCreditCancellationModel,
      LetterOfCreditFreeFormatMessageModel,
      LetterOfCreditTemplateModel,
      LetterOfCreditPaymentModel,
      LetterOfCreditDocumentLodgementModel,
      LetterOfCreditAssignmentOfProceedModel,
    ]),
    BullModule.registerQueue({
      name: TRADE_API_LETTER_OF_CREDIT_SWIFT_MESSAGE_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
      },
    }),
    BullBoardModule.forFeature({
      name: TRADE_API_LETTER_OF_CREDIT_SWIFT_MESSAGE_QUEUE_NAME,
      adapter: BullMQAdapter,
    }),
    BullModule.registerQueue({
      name: LETTER_OF_CREDIT_EXPIRY_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
      },
    }),
    BullBoardModule.forFeature({
      name: LETTER_OF_CREDIT_EXPIRY_QUEUE_NAME,
      adapter: BullMQAdapter,
    }),
    BullModule.registerQueue({
      name: LETTER_OF_CREDIT_PENDING_REQUEST_JOURNAL_REVERSAL_QUEUE_NAME,
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
      },
    }),
    BullBoardModule.forFeature({
      name: LETTER_OF_CREDIT_PENDING_REQUEST_JOURNAL_REVERSAL_QUEUE_NAME,
      adapter: BullMQAdapter,
    }),
    RegulatoryFormModule,
    TradeProductFactoryModule,
    CreditLineModule,
    CamsModule,
    HelperModule,
    TreasuryTradeServiceModule,
    ProductManagementModule,
    CustomerManagementModule,
    RulesConfigurationModule,
  ],
  providers: [
    Logger,
    LetterOfCreditRepository,
    LetterOfCreditRequestRepository,
    LetterOfCreditAmendmentRepository,
    LetterOfCreditAdjustmentRepository,
    LetterOfCreditCancellationRepository,
    LetterOfCreditFreeFormatMessageRepository,
    LetterOfCreditTemplateRepository,
    LetterOfCreditPaymentRepository,
    LetterOfCreditDocumentLodgementRepository,
    LetterOfCreditAssignmentOfProceedRepository,
    LetterOfCreditService,
    LetterOfCrediSwiftMessageConsumer,
    LetterOfCreditPendingRequestJournalReversalConsumer,
  ],
  controllers: [LetterOfCreditController],
  exports: [],
})
export class LetterOfCreditModule {}
