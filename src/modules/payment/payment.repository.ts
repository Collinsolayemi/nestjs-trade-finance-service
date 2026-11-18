import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreationAttributes,
  CreateOptions,
  FindOptions,
  ModelScopeOptions,
  UpdateOptions,
} from 'sequelize';
import { InwardBankPayment } from './models/inward-bank-payment.model';
import { InwardCustomerPayment } from './models/inward-customer-payment.model';
import { PaymentRequest } from './models/payment-request.model';
import { PaymentTemplate } from './models/payment-template.model';

@Injectable()
export class PaymentRequestRepository {
  constructor(
    @InjectModel(PaymentRequest)
    private readonly paymentRequestModel: typeof PaymentRequest,
  ) {}

  scope(
    scope: string | string[] | ModelScopeOptions | null,
  ): PaymentRequestRepository {
    const scopedModel = this.paymentRequestModel.scope(scope);
    const scopedRepository = Object.create(this);
    scopedRepository.paymentRequestModel = scopedModel;
    return scopedRepository;
  }

  async create(
    body: CreationAttributes<PaymentRequest>,
    options?: CreateOptions<PaymentRequest>,
  ): Promise<PaymentRequest> {
    return this.paymentRequestModel.create(body, options);
  }

  async findOne(options: FindOptions<PaymentRequest>): Promise<PaymentRequest> {
    return this.paymentRequestModel.findOne(options);
  }

  async findByPk(
    id: string,
    options?: FindOptions<PaymentRequest>,
  ): Promise<PaymentRequest> {
    return this.paymentRequestModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<PaymentRequest>,
  ): Promise<PaymentRequest[]> {
    return this.paymentRequestModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<PaymentRequest>,
  ): Promise<{ rows: PaymentRequest[]; count: number }> {
    return this.paymentRequestModel.findAndCountAll(options);
  }

  async update(
    body: Partial<PaymentRequest>,
    options?: UpdateOptions<PaymentRequest>,
  ): Promise<[number, PaymentRequest[]] | [number]> {
    return this.paymentRequestModel.update(body, options);
  }

  async delete(options: FindOptions<PaymentRequest>): Promise<number> {
    return this.paymentRequestModel.destroy(options);
  }
}

@Injectable()
export class InwardBankPaymentRepository {
  constructor(
    @InjectModel(InwardBankPayment)
    private readonly inwardBankPaymentModel: typeof InwardBankPayment,
  ) {}

  async create(
    body: CreationAttributes<InwardBankPayment>,
    options?: CreateOptions<InwardBankPayment>,
  ): Promise<InwardBankPayment> {
    return this.inwardBankPaymentModel.create(body, options);
  }

  async findOne(
    options: FindOptions<InwardBankPayment>,
  ): Promise<InwardBankPayment> {
    return this.inwardBankPaymentModel.findOne(options);
  }

  async findByPk(
    id: string,
    options?: FindOptions<InwardBankPayment>,
  ): Promise<InwardBankPayment> {
    return this.inwardBankPaymentModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<InwardBankPayment>,
  ): Promise<InwardBankPayment[]> {
    return this.inwardBankPaymentModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<InwardBankPayment>,
  ): Promise<{ rows: InwardBankPayment[]; count: number }> {
    return this.inwardBankPaymentModel.findAndCountAll(options);
  }

  async update(
    body: Partial<InwardBankPayment>,
    options?: UpdateOptions<InwardBankPayment>,
  ): Promise<[number, InwardBankPayment[]] | [number]> {
    return this.inwardBankPaymentModel.update(body, options);
  }

  async delete(options: FindOptions<InwardBankPayment>): Promise<number> {
    return this.inwardBankPaymentModel.destroy(options);
  }
}

@Injectable()
export class InwardCustomerPaymentRepository {
  constructor(
    @InjectModel(InwardCustomerPayment)
    private readonly inwardCustomerPaymentModel: typeof InwardCustomerPayment,
  ) {}

  async create(
    body: CreationAttributes<InwardCustomerPayment>,
    options?: CreateOptions<InwardCustomerPayment>,
  ): Promise<InwardCustomerPayment> {
    return this.inwardCustomerPaymentModel.create(body, options);
  }

  async findOne(
    options: FindOptions<InwardCustomerPayment>,
  ): Promise<InwardCustomerPayment> {
    return this.inwardCustomerPaymentModel.findOne(options);
  }

  async findByPk(
    id: string,
    options?: FindOptions<InwardCustomerPayment>,
  ): Promise<InwardCustomerPayment> {
    return this.inwardCustomerPaymentModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<InwardCustomerPayment>,
  ): Promise<InwardCustomerPayment[]> {
    return this.inwardCustomerPaymentModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<InwardCustomerPayment>,
  ): Promise<{ rows: InwardCustomerPayment[]; count: number }> {
    return this.inwardCustomerPaymentModel.findAndCountAll(options);
  }

  async update(
    body: Partial<InwardCustomerPayment>,
    options?: UpdateOptions<InwardCustomerPayment>,
  ): Promise<[number, InwardCustomerPayment[]] | [number]> {
    return this.inwardCustomerPaymentModel.update(body, options);
  }

  async delete(options: FindOptions<InwardCustomerPayment>): Promise<number> {
    return this.inwardCustomerPaymentModel.destroy(options);
  }
}

@Injectable()
export class PaymentTemplateRepository {
  constructor(
    @InjectModel(PaymentTemplate)
    private readonly paymentTemplateModel: typeof PaymentTemplate,
  ) {}

  async create(
    body: CreationAttributes<PaymentTemplate>,
    options?: CreateOptions<PaymentTemplate>,
  ): Promise<PaymentTemplate> {
    return this.paymentTemplateModel.create(body, options);
  }

  async findOne(
    options: FindOptions<PaymentTemplate>,
  ): Promise<PaymentTemplate> {
    return this.paymentTemplateModel.findOne(options);
  }

  async findAll(
    options: FindOptions<PaymentTemplate>,
  ): Promise<PaymentTemplate[]> {
    return this.paymentTemplateModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<PaymentTemplate>,
  ): Promise<{ rows: PaymentTemplate[]; count: number }> {
    return this.paymentTemplateModel.findAndCountAll(options);
  }

  async update(
    body: Partial<PaymentTemplate>,
    options?: UpdateOptions<PaymentTemplate>,
  ): Promise<[number, PaymentTemplate[]] | [number]> {
    return this.paymentTemplateModel.update(body, options);
  }

  async delete(options: FindOptions<PaymentTemplate>): Promise<number> {
    return this.paymentTemplateModel.destroy(options);
  }
}
