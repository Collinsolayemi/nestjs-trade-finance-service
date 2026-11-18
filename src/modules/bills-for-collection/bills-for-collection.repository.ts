import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BillsForCollection } from './models/bills-for-collection.model';
import {
  CreationAttributes,
  CreateOptions,
  ModelScopeOptions,
  FindOptions,
  UpdateOptions,
  QueryTypes,
  Transaction,
} from 'sequelize';
import { BillsForCollectionRequest } from './models/bills-for-collection-request.model';
import { BillsForCollectionAmendment } from './models/bills-for-collection-amendment.model';
import { BillsForCollectionAdjustment } from './models/bills-for-collection-adjustment.model';
import { BillsForCollectionNonAcceptanceOrNonPayment } from './models/bills-for-collection-non-acceptance-or-non-payment.model';
import { BillsForCollectionPayment } from './models/bills-for-collection-payment.model';
import { BillsForCollectionReceiveAcknowledgement } from './models/bills-for-collection-receive-akcnowledgement.model';
import { BillsForCollectionAcceptance } from './models/bills-for-collection-acceptance.model';
import { BillsForCollectionFreeFormatMessage } from './models/bills-for-collection-free-format-message.model';
import { BillsForCollectionClosure } from './models/bills-for-collection-closure.model';

@Injectable()
export class BillsForCollectionRequestRepository {
  constructor(
    @InjectModel(BillsForCollectionRequest)
    private readonly billsForCollectionRequestModel: typeof BillsForCollectionRequest,
  ) {}

  scope(
    scope: string | string[] | ModelScopeOptions | null,
  ): BillsForCollectionRequestRepository {
    const scopedModel = this.billsForCollectionRequestModel.scope(scope);
    const scopedRepository = Object.create(this);
    scopedRepository.billsForCollectionRequestModel = scopedModel;
    return scopedRepository;
  }

  async create(
    body: CreationAttributes<BillsForCollectionRequest>,
    options?: CreateOptions<BillsForCollectionRequest>,
  ): Promise<BillsForCollectionRequest> {
    return this.billsForCollectionRequestModel.create(body, options);
  }

  async findOne(
    options: FindOptions<BillsForCollectionRequest>,
  ): Promise<BillsForCollectionRequest> {
    return this.billsForCollectionRequestModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<BillsForCollectionRequest>,
  ): Promise<BillsForCollectionRequest> {
    return this.billsForCollectionRequestModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<BillsForCollectionRequest>,
  ): Promise<BillsForCollectionRequest[]> {
    return this.billsForCollectionRequestModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<BillsForCollectionRequest>,
  ): Promise<{ rows: BillsForCollectionRequest[]; count: number }> {
    return this.billsForCollectionRequestModel.findAndCountAll(options);
  }

  async update(
    body: Partial<BillsForCollectionRequest>,
    options?: UpdateOptions<BillsForCollectionRequest>,
  ): Promise<[number, BillsForCollectionRequest[]] | [number]> {
    return this.billsForCollectionRequestModel.update(body, options);
  }

  async delete(
    options: FindOptions<BillsForCollectionRequest>,
  ): Promise<number> {
    return this.billsForCollectionRequestModel.destroy(options);
  }
}

@Injectable()
export class BillsForCollectionRepository {
  constructor(
    @InjectModel(BillsForCollection)
    private readonly billsForCollectionModel: typeof BillsForCollection,
  ) {}

  async create(
    body: CreationAttributes<BillsForCollection>,
    options?: CreateOptions<BillsForCollection>,
  ): Promise<BillsForCollection> {
    return this.billsForCollectionModel.create(body, options);
  }

  async findOne(
    options: FindOptions<BillsForCollection>,
  ): Promise<BillsForCollection> {
    return this.billsForCollectionModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<BillsForCollection>,
  ): Promise<BillsForCollection> {
    return this.billsForCollectionModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<BillsForCollection>,
  ): Promise<BillsForCollection[]> {
    return this.billsForCollectionModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<BillsForCollection>,
  ): Promise<{ rows: BillsForCollection[]; count: number }> {
    return this.billsForCollectionModel.findAndCountAll(options);
  }

  async update(
    body: Partial<BillsForCollection>,
    options?: UpdateOptions<BillsForCollection>,
  ): Promise<[number, BillsForCollection[]] | [number]> {
    return this.billsForCollectionModel.update(body, options);
  }

  async delete(options: FindOptions<BillsForCollection>): Promise<number> {
    return this.billsForCollectionModel.destroy(options);
  }

  async appendSwiftMessage(
    id: string,
    message: Record<string, unknown>,
    options?: { transaction?: Transaction },
  ): Promise<void> {
    await this.billsForCollectionModel.sequelize.query(
      `UPDATE bills_for_collections
       SET swift_messages = COALESCE(swift_messages, '[]'::jsonb) || :message::jsonb
       WHERE id = :id`,
      {
        replacements: {
          id,
          message: JSON.stringify(message),
        },
        type: QueryTypes.UPDATE,
        transaction: options?.transaction,
      },
    );
  }

  async appendChargesAndTaxesTransaction(
    referenceNumber: string,
    entry: { billsForCollectionActionType: string; transactionId: string },
    options?: { transaction?: Transaction },
  ): Promise<void> {
    await this.billsForCollectionModel.sequelize.query(
      `UPDATE bills_for_collections
     SET "chargesAndTaxesTransactionArray" = 
         COALESCE("chargesAndTaxesTransactionArray", '[]'::jsonb) || :entry::jsonb
     WHERE "referenceNumber" = :referenceNumber`,
      {
        replacements: {
          referenceNumber,
          entry: JSON.stringify([entry]),
        },
        type: QueryTypes.UPDATE,
        transaction: options?.transaction,
      },
    );
  }

  async appendPostingEntryTransaction(
    referenceNumber: string,
    entry: {
      billsForCollectionActionType: string;
      transactionId: string;
      isReversed: boolean;
      transactionReversalId: string;
    },
    options?: { transaction?: Transaction },
  ): Promise<void> {
    await this.billsForCollectionModel.sequelize.query(
      `UPDATE bills_for_collections
     SET "postingEntryTransactionArray" = 
         COALESCE("postingEntryTransactionArray", '[]'::jsonb) || :entry::jsonb
     WHERE "referenceNumber" = :referenceNumber`,
      {
        replacements: {
          referenceNumber,
          entry: JSON.stringify([entry]),
        },
        type: QueryTypes.UPDATE,
        transaction: options?.transaction,
      },
    );
  }
}

@Injectable()
export class BillsForCollectionAmendmentRepository {
  constructor(
    @InjectModel(BillsForCollectionAmendment)
    private readonly billsForCollectionAmendmentModel: typeof BillsForCollectionAmendment,
  ) {}

  async create(
    body: CreationAttributes<BillsForCollectionAmendment>,
    options?: CreateOptions<BillsForCollectionAmendment>,
  ): Promise<BillsForCollectionAmendment> {
    return this.billsForCollectionAmendmentModel.create(body, options);
  }

  async findOne(
    options: FindOptions<BillsForCollectionAmendment>,
  ): Promise<BillsForCollectionAmendment> {
    return this.billsForCollectionAmendmentModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<BillsForCollectionAmendment>,
  ): Promise<BillsForCollectionAmendment> {
    return this.billsForCollectionAmendmentModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<BillsForCollectionAmendment>,
  ): Promise<BillsForCollectionAmendment[]> {
    return this.billsForCollectionAmendmentModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<BillsForCollectionAmendment>,
  ): Promise<{ rows: BillsForCollectionAmendment[]; count: number }> {
    return this.billsForCollectionAmendmentModel.findAndCountAll(options);
  }

  async update(
    body: Partial<BillsForCollectionAmendment>,
    options?: UpdateOptions<BillsForCollectionAmendment>,
  ): Promise<[number, BillsForCollectionAmendment[]] | [number]> {
    return this.billsForCollectionAmendmentModel.update(body, options);
  }

  async delete(
    options: FindOptions<BillsForCollectionAmendment>,
  ): Promise<number> {
    return this.billsForCollectionAmendmentModel.destroy(options);
  }
}

@Injectable()
export class BillsForCollectionAdjustmentRepository {
  constructor(
    @InjectModel(BillsForCollectionAdjustment)
    private readonly billsForCollectionAdjustmentModel: typeof BillsForCollectionAdjustment,
  ) {}

  async create(
    body: CreationAttributes<BillsForCollectionAdjustment>,
    options?: CreateOptions<BillsForCollectionAdjustment>,
  ): Promise<BillsForCollectionAdjustment> {
    return this.billsForCollectionAdjustmentModel.create(body, options);
  }

  async findOne(
    options: FindOptions<BillsForCollectionAdjustment>,
  ): Promise<BillsForCollectionAdjustment> {
    return this.billsForCollectionAdjustmentModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<BillsForCollectionAdjustment>,
  ): Promise<BillsForCollectionAdjustment> {
    return this.billsForCollectionAdjustmentModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<BillsForCollectionAdjustment>,
  ): Promise<BillsForCollectionAdjustment[]> {
    return this.billsForCollectionAdjustmentModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<BillsForCollectionAdjustment>,
  ): Promise<{ rows: BillsForCollectionAdjustment[]; count: number }> {
    return this.billsForCollectionAdjustmentModel.findAndCountAll(options);
  }

  async update(
    body: Partial<BillsForCollectionAdjustment>,
    options?: UpdateOptions<BillsForCollectionAdjustment>,
  ): Promise<[number, BillsForCollectionAdjustment[]] | [number]> {
    return this.billsForCollectionAdjustmentModel.update(body, options);
  }

  async delete(
    options: FindOptions<BillsForCollectionAdjustment>,
  ): Promise<number> {
    return this.billsForCollectionAdjustmentModel.destroy(options);
  }
}

@Injectable()
export class BillsForCollectionNonAcceptanceOrNonPaymentRepository {
  constructor(
    @InjectModel(BillsForCollectionNonAcceptanceOrNonPayment)
    private readonly billsForCollectionNonAcceptanceOrNonPaymentModel: typeof BillsForCollectionNonAcceptanceOrNonPayment,
  ) {}

  async create(
    body: CreationAttributes<BillsForCollectionNonAcceptanceOrNonPayment>,
    options?: CreateOptions<BillsForCollectionNonAcceptanceOrNonPayment>,
  ): Promise<BillsForCollectionNonAcceptanceOrNonPayment> {
    return this.billsForCollectionNonAcceptanceOrNonPaymentModel.create(
      body,
      options,
    );
  }

  async findOne(
    options: FindOptions<BillsForCollectionNonAcceptanceOrNonPayment>,
  ): Promise<BillsForCollectionNonAcceptanceOrNonPayment> {
    return this.billsForCollectionNonAcceptanceOrNonPaymentModel.findOne(
      options,
    );
  }

  async findByPk(
    id: string,
    options: FindOptions<BillsForCollectionNonAcceptanceOrNonPayment>,
  ): Promise<BillsForCollectionNonAcceptanceOrNonPayment> {
    return this.billsForCollectionNonAcceptanceOrNonPaymentModel.findByPk(
      id,
      options,
    );
  }

  async findAll(
    options: FindOptions<BillsForCollectionNonAcceptanceOrNonPayment>,
  ): Promise<BillsForCollectionNonAcceptanceOrNonPayment[]> {
    return this.billsForCollectionNonAcceptanceOrNonPaymentModel.findAll(
      options,
    );
  }

  async findAndCountAll(
    options: FindOptions<BillsForCollectionNonAcceptanceOrNonPayment>,
  ): Promise<{
    rows: BillsForCollectionNonAcceptanceOrNonPayment[];
    count: number;
  }> {
    return this.billsForCollectionNonAcceptanceOrNonPaymentModel.findAndCountAll(
      options,
    );
  }

  async update(
    body: Partial<BillsForCollectionNonAcceptanceOrNonPayment>,
    options?: UpdateOptions<BillsForCollectionNonAcceptanceOrNonPayment>,
  ): Promise<
    [number, BillsForCollectionNonAcceptanceOrNonPayment[]] | [number]
  > {
    return this.billsForCollectionNonAcceptanceOrNonPaymentModel.update(
      body,
      options,
    );
  }

  async delete(
    options: FindOptions<BillsForCollectionNonAcceptanceOrNonPayment>,
  ): Promise<number> {
    return this.billsForCollectionNonAcceptanceOrNonPaymentModel.destroy(
      options,
    );
  }
}

@Injectable()
export class BillsForCollectionPaymentRepository {
  constructor(
    @InjectModel(BillsForCollectionPayment)
    private readonly billsForCollectionPaymentModel: typeof BillsForCollectionPayment,
  ) {}

  async create(
    body: CreationAttributes<BillsForCollectionPayment>,
    options?: CreateOptions<BillsForCollectionPayment>,
  ): Promise<BillsForCollectionPayment> {
    return this.billsForCollectionPaymentModel.create(body, options);
  }

  async findOne(
    options: FindOptions<BillsForCollectionPayment>,
  ): Promise<BillsForCollectionPayment> {
    return this.billsForCollectionPaymentModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<BillsForCollectionPayment>,
  ): Promise<BillsForCollectionPayment> {
    return this.billsForCollectionPaymentModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<BillsForCollectionPayment>,
  ): Promise<BillsForCollectionPayment[]> {
    return this.billsForCollectionPaymentModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<BillsForCollectionPayment>,
  ): Promise<{ rows: BillsForCollectionPayment[]; count: number }> {
    return this.billsForCollectionPaymentModel.findAndCountAll(options);
  }

  async update(
    body: Partial<BillsForCollectionPayment>,
    options?: UpdateOptions<BillsForCollectionPayment>,
  ): Promise<[number, BillsForCollectionPayment[]] | [number]> {
    return this.billsForCollectionPaymentModel.update(body, options);
  }

  async delete(
    options: FindOptions<BillsForCollectionPayment>,
  ): Promise<number> {
    return this.billsForCollectionPaymentModel.destroy(options);
  }
}

@Injectable()
export class BillsForCollectionReceiveAcknowledgementRepository {
  constructor(
    @InjectModel(BillsForCollectionReceiveAcknowledgement)
    private readonly billsForCollectionReceiveAcknowledgementModel: typeof BillsForCollectionReceiveAcknowledgement,
  ) {}

  async create(
    body: CreationAttributes<BillsForCollectionReceiveAcknowledgement>,
    options?: CreateOptions<BillsForCollectionReceiveAcknowledgement>,
  ): Promise<BillsForCollectionReceiveAcknowledgement> {
    return this.billsForCollectionReceiveAcknowledgementModel.create(
      body,
      options,
    );
  }

  async findOne(
    options: FindOptions<BillsForCollectionReceiveAcknowledgement>,
  ): Promise<BillsForCollectionReceiveAcknowledgement> {
    return this.billsForCollectionReceiveAcknowledgementModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<BillsForCollectionReceiveAcknowledgement>,
  ): Promise<BillsForCollectionReceiveAcknowledgement> {
    return this.billsForCollectionReceiveAcknowledgementModel.findByPk(
      id,
      options,
    );
  }

  async findAll(
    options: FindOptions<BillsForCollectionReceiveAcknowledgement>,
  ): Promise<BillsForCollectionReceiveAcknowledgement[]> {
    return this.billsForCollectionReceiveAcknowledgementModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<BillsForCollectionReceiveAcknowledgement>,
  ): Promise<{
    rows: BillsForCollectionReceiveAcknowledgement[];
    count: number;
  }> {
    return this.billsForCollectionReceiveAcknowledgementModel.findAndCountAll(
      options,
    );
  }

  async update(
    body: Partial<BillsForCollectionReceiveAcknowledgement>,
    options?: UpdateOptions<BillsForCollectionReceiveAcknowledgement>,
  ): Promise<[number, BillsForCollectionReceiveAcknowledgement[]] | [number]> {
    return this.billsForCollectionReceiveAcknowledgementModel.update(
      body,
      options,
    );
  }

  async delete(
    options: FindOptions<BillsForCollectionReceiveAcknowledgement>,
  ): Promise<number> {
    return this.billsForCollectionReceiveAcknowledgementModel.destroy(options);
  }
}

@Injectable()
export class BillsForCollectionAcceptanceRepository {
  constructor(
    @InjectModel(BillsForCollectionAcceptance)
    private readonly billsForCollectionAcceptanceModel: typeof BillsForCollectionAcceptance,
  ) {}

  async create(
    body: CreationAttributes<BillsForCollectionAcceptance>,
    options?: CreateOptions<BillsForCollectionAcceptance>,
  ): Promise<BillsForCollectionAcceptance> {
    return this.billsForCollectionAcceptanceModel.create(body, options);
  }

  async findOne(
    options: FindOptions<BillsForCollectionAcceptance>,
  ): Promise<BillsForCollectionAcceptance> {
    return this.billsForCollectionAcceptanceModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<BillsForCollectionAcceptance>,
  ): Promise<BillsForCollectionAcceptance> {
    return this.billsForCollectionAcceptanceModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<BillsForCollectionAcceptance>,
  ): Promise<BillsForCollectionAcceptance[]> {
    return this.billsForCollectionAcceptanceModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<BillsForCollectionAcceptance>,
  ): Promise<{ rows: BillsForCollectionAcceptance[]; count: number }> {
    return this.billsForCollectionAcceptanceModel.findAndCountAll(options);
  }

  async update(
    body: Partial<BillsForCollectionAcceptance>,
    options?: UpdateOptions<BillsForCollectionAcceptance>,
  ): Promise<[number, BillsForCollectionAcceptance[]] | [number]> {
    return this.billsForCollectionAcceptanceModel.update(body, options);
  }

  async delete(
    options: FindOptions<BillsForCollectionAcceptance>,
  ): Promise<number> {
    return this.billsForCollectionAcceptanceModel.destroy(options);
  }
}

@Injectable()
export class BillsForCollectionFreeFormatRepository {
  constructor(
    @InjectModel(BillsForCollectionFreeFormatMessage)
    private readonly billsForCollectionFreeFormatModel: typeof BillsForCollectionFreeFormatMessage,
  ) {}

  async create(
    body: CreationAttributes<BillsForCollectionFreeFormatMessage>,
    options?: CreateOptions<BillsForCollectionFreeFormatMessage>,
  ): Promise<BillsForCollectionFreeFormatMessage> {
    return this.billsForCollectionFreeFormatModel.create(body, options);
  }

  async findOne(
    options: FindOptions<BillsForCollectionFreeFormatMessage>,
  ): Promise<BillsForCollectionFreeFormatMessage> {
    return this.billsForCollectionFreeFormatModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<BillsForCollectionFreeFormatMessage>,
  ): Promise<BillsForCollectionFreeFormatMessage> {
    return this.billsForCollectionFreeFormatModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<BillsForCollectionFreeFormatMessage>,
  ): Promise<BillsForCollectionFreeFormatMessage[]> {
    return this.billsForCollectionFreeFormatModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<BillsForCollectionFreeFormatMessage>,
  ): Promise<{ rows: BillsForCollectionFreeFormatMessage[]; count: number }> {
    return this.billsForCollectionFreeFormatModel.findAndCountAll(options);
  }

  async update(
    body: Partial<BillsForCollectionFreeFormatMessage>,
    options?: UpdateOptions<BillsForCollectionFreeFormatMessage>,
  ): Promise<[number, BillsForCollectionFreeFormatMessage[]] | [number]> {
    return this.billsForCollectionFreeFormatModel.update(body, options);
  }

  async delete(
    options: FindOptions<BillsForCollectionFreeFormatMessage>,
  ): Promise<number> {
    return this.billsForCollectionFreeFormatModel.destroy(options);
  }
}

export class BillsForCollectionClosureRepository {
  constructor(
    @InjectModel(BillsForCollectionClosure)
    private readonly billsForCollectionClosureModel: typeof BillsForCollectionClosure,
  ) {}

  async create(
    body: CreationAttributes<BillsForCollectionClosure>,
    options?: CreateOptions<BillsForCollectionClosure>,
  ): Promise<BillsForCollectionClosure> {
    return this.billsForCollectionClosureModel.create(body, options);
  }

  async findOne(
    options: FindOptions<BillsForCollectionClosure>,
  ): Promise<BillsForCollectionClosure> {
    return this.billsForCollectionClosureModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<BillsForCollectionClosure>,
  ): Promise<BillsForCollectionClosure> {
    return this.billsForCollectionClosureModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<BillsForCollectionClosure>,
  ): Promise<BillsForCollectionClosure[]> {
    return this.billsForCollectionClosureModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<BillsForCollectionClosure>,
  ): Promise<{ rows: BillsForCollectionClosure[]; count: number }> {
    return this.billsForCollectionClosureModel.findAndCountAll(options);
  }

  async update(
    body: Partial<BillsForCollectionClosure>,
    options?: UpdateOptions<BillsForCollectionClosure>,
  ): Promise<[number, BillsForCollectionClosure[]] | [number]> {
    return this.billsForCollectionClosureModel.update(body, options);
  }

  async delete(
    options: FindOptions<BillsForCollectionClosure>,
  ): Promise<number> {
    return this.billsForCollectionClosureModel.destroy(options);
  }
}
