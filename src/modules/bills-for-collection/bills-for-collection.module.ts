import { Logger, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BillsForCollection } from './models/bills-for-collection.model';
import { BillsForCollectionRequest } from './models/bills-for-collection-request.model';
import { BillsForCollectionAdjustment } from './models/bills-for-collection-adjustment.model';
import { BillsForCollectionAmendment } from './models/bills-for-collection-amendment.model';
import { BillsForCollectionNonAcceptanceOrNonPayment } from './models/bills-for-collection-non-acceptance-or-non-payment.model';
import { BillsForCollectionPayment } from './models/bills-for-collection-payment.model';
import { BillsForCollectionReceiveAcknowledgement } from './models/bills-for-collection-receive-akcnowledgement.model';
import { BillsForCollectionAcceptance } from './models/bills-for-collection-acceptance.model';
import { RegulatoryFormModule } from '../regulatory-form/regulatory-form.module';
import { TradeProductFactoryModule } from 'src/services/trade-product-factory/trade-product-factory.module';
import { CamsModule } from 'src/services/cams/cams.module';
import { HelperModule } from 'src/helpers/helper.module';
import { TreasuryTradeServiceModule } from 'src/services/treasury-trade/treasury-trade.module';
import { ProductManagementModule } from 'src/services/product-management/product-management.module';
import { CustomerManagementModule } from 'src/services/customer-management/customer-management.module';
import { RulesConfigurationModule } from 'src/services/rules-configuration/rules-configuration.module';
import {
  BillsForCollectionAdjustmentRepository,
  BillsForCollectionAmendmentRepository,
  BillsForCollectionNonAcceptanceOrNonPaymentRepository,
  BillsForCollectionPaymentRepository,
  BillsForCollectionRepository,
  BillsForCollectionRequestRepository,
  BillsForCollectionReceiveAcknowledgementRepository,
  BillsForCollectionAcceptanceRepository,
  BillsForCollectionFreeFormatRepository,
  BillsForCollectionClosureRepository,
} from './bills-for-collection.repository';
import { BillsForCollectionController } from './bills-for-collection.controller';
import { BillsForCollectionService } from './bills-for-collection.service';
import { BillsForCollectionFreeFormatMessage } from './models/bills-for-collection-free-format-message.model';
import { BillsForCollectionClosure } from './models/bills-for-collection-closure.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      BillsForCollectionRequest,
      BillsForCollection,
      BillsForCollectionAdjustment,
      BillsForCollectionAmendment,
      BillsForCollectionNonAcceptanceOrNonPayment,
      BillsForCollectionPayment,
      BillsForCollectionReceiveAcknowledgement,
      BillsForCollectionAcceptance,
      BillsForCollectionFreeFormatMessage,
      BillsForCollectionClosure,
    ]),
    RegulatoryFormModule,
    TradeProductFactoryModule,
    CamsModule,
    HelperModule,
    TreasuryTradeServiceModule,
    ProductManagementModule,
    CustomerManagementModule,
    RulesConfigurationModule,
  ],
  providers: [
    Logger,
    BillsForCollectionRepository,
    BillsForCollectionRequestRepository,
    BillsForCollectionAmendmentRepository,
    BillsForCollectionAdjustmentRepository,
    BillsForCollectionNonAcceptanceOrNonPaymentRepository,
    BillsForCollectionPaymentRepository,
    BillsForCollectionReceiveAcknowledgementRepository,
    BillsForCollectionAcceptanceRepository,
    BillsForCollectionFreeFormatRepository,
    BillsForCollectionClosureRepository,
    BillsForCollectionService,
  ],
  controllers: [BillsForCollectionController],
  exports: [],
})
export class BillsForCollectionModule {}
