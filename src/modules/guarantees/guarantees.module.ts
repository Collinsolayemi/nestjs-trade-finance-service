import { Logger, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RegulatoryFormModule } from '../regulatory-form/regulatory-form.module';
import { TradeProductFactoryModule } from 'src/services/trade-product-factory/trade-product-factory.module';
import { CamsModule } from 'src/services/cams/cams.module';
import { HelperModule } from 'src/helpers/helper.module';
import { TreasuryTradeServiceModule } from 'src/services/treasury-trade/treasury-trade.module';
import { ProductManagementModule } from 'src/services/product-management/product-management.module';
import { CustomerManagementModule } from 'src/services/customer-management/customer-management.module';
import { RulesConfigurationModule } from 'src/services/rules-configuration/rules-configuration.module';
import { GuaranteesRequest } from './models/guarantees-request.model';
import { Guarantees } from './models/guarantees.model';
import { GuaranteesAmendment } from './models/guarantess-amendment.model';
import { GuaranteesAdjustment } from './models/guarantees-adjustment.model';
import { GuaranteesReceiveAcknowledgement } from './models/guarantees-receive-acknowledgement.model';
import { GuaranteesReceiveClaim } from './models/guarantees-receive-claim.model';
import { GuaranteesDocumentsPresented } from './models/guarantees-documents-presented.model';
import { GuaranteesCancellation } from './models/gurantees-cancellation.model';
import { GuaranteesFreeFormat } from './models/guarantees-free-format.model';
import {
  GuaranteesAmendmentRepository,
  GuaranteesAdjustmentRepository,
  GuaranteesCancellationRepository,
  GuaranteesFreeFormatRepository,
  GuaranteesDocumentsPresentedRepository,
  GuaranteesReceiveAcknowledgementRepository,
  GuaranteesReceiveClaimRepository,
  GuaranteesRepository,
  GuaranteesRequestRepository,
} from './guarantees.repository';
import { GuaranteesController } from './guarantees.controller';
import { GuaranteesService } from './guarantees.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      GuaranteesRequest,
      Guarantees,
      GuaranteesAmendment,
      GuaranteesAdjustment,
      GuaranteesReceiveAcknowledgement,
      GuaranteesReceiveClaim,
      GuaranteesDocumentsPresented,
      GuaranteesCancellation,
      GuaranteesFreeFormat,
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
    GuaranteesRequestRepository,
    GuaranteesRepository,
    GuaranteesAmendmentRepository,
    GuaranteesAdjustmentRepository,
    GuaranteesReceiveAcknowledgementRepository,
    GuaranteesReceiveClaimRepository,
    GuaranteesDocumentsPresentedRepository,
    GuaranteesCancellationRepository,
    GuaranteesFreeFormatRepository,
    GuaranteesService,
  ],
  controllers: [GuaranteesController],
  exports: [],
})
export class GuaranteesModule {}
