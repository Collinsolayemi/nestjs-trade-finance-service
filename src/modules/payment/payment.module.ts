import { Logger, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { HelperModule } from 'src/helpers/helper.module';
import { RegulatoryFormModule } from '../regulatory-form/regulatory-form.module';
import { CamsModule } from 'src/services/cams/cams.module';
import { TradeProductFactoryModule } from 'src/services/trade-product-factory/trade-product-factory.module';
import { TreasuryTradeServiceModule } from 'src/services/treasury-trade/treasury-trade.module';
import { ProductManagementModule } from 'src/services/product-management/product-management.module';
import { CustomerManagementModule } from 'src/services/customer-management/customer-management.module';
import { RulesConfigurationModule } from 'src/services/rules-configuration/rules-configuration.module';
import {
  InwardBankPaymentRepository,
  InwardCustomerPaymentRepository,
  PaymentRequestRepository,
  PaymentTemplateRepository,
} from './payment.repository';
import { InwardBankPayment } from './models/inward-bank-payment.model';
import { InwardCustomerPayment } from './models/inward-customer-payment.model';
import { PaymentRequest } from './models/payment-request.model';
import { PaymentTemplate } from './models/payment-template.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PaymentRequest,
      InwardBankPayment,
      InwardCustomerPayment,
      PaymentTemplate,
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
  controllers: [PaymentController],
  providers: [
    Logger,
    PaymentRequestRepository,
    InwardBankPaymentRepository,
    InwardCustomerPaymentRepository,
    PaymentTemplateRepository,
    PaymentService,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
