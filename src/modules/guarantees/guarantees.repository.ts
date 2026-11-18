import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreationAttributes,
  CreateOptions,
  FindOptions,
  ModelScopeOptions,
  UpdateOptions,
  Transaction,
  QueryTypes,
} from 'sequelize';
import { GuaranteesRequest } from './models/guarantees-request.model';
import { Guarantees } from './models/guarantees.model';
import { GuaranteesAmendment } from './models/guarantess-amendment.model';
import { GuaranteesAdjustment } from './models/guarantees-adjustment.model';
import { GuaranteesReceiveAcknowledgement } from './models/guarantees-receive-acknowledgement.model';
import { GuaranteesReceiveClaim } from './models/guarantees-receive-claim.model';
import { GuaranteesDocumentsPresented } from './models/guarantees-documents-presented.model';
import { GuaranteesCancellation } from './models/gurantees-cancellation.model';
import { GuaranteesFreeFormat } from './models/guarantees-free-format.model';

@Injectable()
export class GuaranteesRequestRepository {
  constructor(
    @InjectModel(GuaranteesRequest)
    private readonly guaranteesRequestModel: typeof GuaranteesRequest,
  ) {}

  scope(
    scope: string | string[] | ModelScopeOptions | null,
  ): GuaranteesRequestRepository {
    const scopedModel = this.guaranteesRequestModel.scope(scope);
    const scopedRepository = Object.create(this);
    scopedRepository.guaranteesRequestModel = scopedModel;
    return scopedRepository;
  }

  async create(
    body: CreationAttributes<GuaranteesRequest>,
    options?: CreateOptions<GuaranteesRequest>,
  ): Promise<GuaranteesRequest> {
    return this.guaranteesRequestModel.create(body, options);
  }

  async findOne(
    options: FindOptions<GuaranteesRequest>,
  ): Promise<GuaranteesRequest> {
    return this.guaranteesRequestModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<GuaranteesRequest>,
  ): Promise<GuaranteesRequest> {
    return this.guaranteesRequestModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<GuaranteesRequest>,
  ): Promise<GuaranteesRequest[]> {
    return this.guaranteesRequestModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<GuaranteesRequest>,
  ): Promise<{ rows: GuaranteesRequest[]; count: number }> {
    return this.guaranteesRequestModel.findAndCountAll(options);
  }

  async update(
    body: Partial<GuaranteesRequest>,
    options?: UpdateOptions<GuaranteesRequest>,
  ): Promise<[number, GuaranteesRequest[]] | [number]> {
    return this.guaranteesRequestModel.update(body, options);
  }

  async delete(options: FindOptions<GuaranteesRequest>): Promise<number> {
    return this.guaranteesRequestModel.destroy(options);
  }
}

@Injectable()
export class GuaranteesRepository {
  constructor(
    @InjectModel(Guarantees)
    private readonly guaranteesModel: typeof Guarantees,
  ) {}

  async create(
    body: CreationAttributes<Guarantees>,
    options?: CreateOptions<Guarantees>,
  ): Promise<Guarantees> {
    return this.guaranteesModel.create(body, options);
  }

  async findOne(options: FindOptions<Guarantees>): Promise<Guarantees> {
    return this.guaranteesModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<Guarantees>,
  ): Promise<Guarantees> {
    return this.guaranteesModel.findByPk(id, options);
  }

  async findAll(options: FindOptions<Guarantees>): Promise<Guarantees[]> {
    return this.guaranteesModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<Guarantees>,
  ): Promise<{ rows: Guarantees[]; count: number }> {
    return this.guaranteesModel.findAndCountAll(options);
  }

  async update(
    body: Partial<Guarantees>,
    options?: UpdateOptions<Guarantees>,
  ): Promise<[number, Guarantees[]] | [number]> {
    return this.guaranteesModel.update(body, options);
  }

  async delete(options: FindOptions<Guarantees>): Promise<number> {
    return this.guaranteesModel.destroy(options);
  }

  async appendSwiftMessage(
    id: string,
    message: Record<string, unknown>,
    options?: { transaction?: Transaction },
  ): Promise<void> {
    await this.guaranteesModel.sequelize.query(
      `UPDATE guarantees
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
    entry: { guaranteesActionType: string; transactionId: string },
    options?: { transaction?: Transaction },
  ): Promise<void> {
    await this.guaranteesModel.sequelize.query(
      `UPDATE guarantees
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
      guaranteesActionType: string;
      transactionId: string;
      isReversed: boolean;
      transactionReversalId: string;
    },
    options?: { transaction?: Transaction },
  ): Promise<void> {
    await this.guaranteesModel.sequelize.query(
      `UPDATE guarantees
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
export class GuaranteesAmendmentRepository {
  constructor(
    @InjectModel(GuaranteesAmendment)
    private readonly guaranteesAmendmentModel: typeof GuaranteesAmendment,
  ) {}

  async create(
    body: CreationAttributes<GuaranteesAmendment>,
    options?: CreateOptions<GuaranteesAmendment>,
  ): Promise<GuaranteesAmendment> {
    return this.guaranteesAmendmentModel.create(body, options);
  }

  async findOne(
    options: FindOptions<GuaranteesAmendment>,
  ): Promise<GuaranteesAmendment> {
    return this.guaranteesAmendmentModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<GuaranteesAmendment>,
  ): Promise<GuaranteesAmendment> {
    return this.guaranteesAmendmentModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<GuaranteesAmendment>,
  ): Promise<GuaranteesAmendment[]> {
    return this.guaranteesAmendmentModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<GuaranteesAmendment>,
  ): Promise<{ rows: GuaranteesAmendment[]; count: number }> {
    return this.guaranteesAmendmentModel.findAndCountAll(options);
  }

  async update(
    body: Partial<GuaranteesAmendment>,
    options?: UpdateOptions<GuaranteesAmendment>,
  ): Promise<[number, GuaranteesAmendment[]] | [number]> {
    return this.guaranteesAmendmentModel.update(body, options);
  }

  async delete(options: FindOptions<GuaranteesAmendment>): Promise<number> {
    return this.guaranteesAmendmentModel.destroy(options);
  }
}

@Injectable()
export class GuaranteesAdjustmentRepository {
  constructor(
    @InjectModel(GuaranteesAdjustment)
    private readonly guaranteesAdjustmentModel: typeof GuaranteesAdjustment,
  ) {}

  async create(
    body: CreationAttributes<GuaranteesAdjustment>,
    options?: CreateOptions<GuaranteesAdjustment>,
  ): Promise<GuaranteesAdjustment> {
    return this.guaranteesAdjustmentModel.create(body, options);
  }

  async findOne(
    options: FindOptions<GuaranteesAdjustment>,
  ): Promise<GuaranteesAdjustment> {
    return this.guaranteesAdjustmentModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<GuaranteesAdjustment>,
  ): Promise<GuaranteesAdjustment> {
    return this.guaranteesAdjustmentModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<GuaranteesAdjustment>,
  ): Promise<GuaranteesAdjustment[]> {
    return this.guaranteesAdjustmentModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<GuaranteesAdjustment>,
  ): Promise<{ rows: GuaranteesAdjustment[]; count: number }> {
    return this.guaranteesAdjustmentModel.findAndCountAll(options);
  }

  async update(
    body: Partial<GuaranteesAdjustment>,
    options?: UpdateOptions<GuaranteesAdjustment>,
  ): Promise<[number, GuaranteesAdjustment[]] | [number]> {
    return this.guaranteesAdjustmentModel.update(body, options);
  }

  async delete(options: FindOptions<GuaranteesAdjustment>): Promise<number> {
    return this.guaranteesAdjustmentModel.destroy(options);
  }
}

@Injectable()
export class GuaranteesReceiveAcknowledgementRepository {
  constructor(
    @InjectModel(GuaranteesReceiveAcknowledgement)
    private readonly guaranteesReceiveAcknowledgementModel: typeof GuaranteesReceiveAcknowledgement,
  ) {}

  async create(
    body: CreationAttributes<GuaranteesReceiveAcknowledgement>,
    options?: CreateOptions<GuaranteesReceiveAcknowledgement>,
  ): Promise<GuaranteesReceiveAcknowledgement> {
    return this.guaranteesReceiveAcknowledgementModel.create(body, options);
  }

  async findOne(
    options: FindOptions<GuaranteesReceiveAcknowledgement>,
  ): Promise<GuaranteesReceiveAcknowledgement> {
    return this.guaranteesReceiveAcknowledgementModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<GuaranteesReceiveAcknowledgement>,
  ): Promise<GuaranteesReceiveAcknowledgement> {
    return this.guaranteesReceiveAcknowledgementModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<GuaranteesReceiveAcknowledgement>,
  ): Promise<GuaranteesReceiveAcknowledgement[]> {
    return this.guaranteesReceiveAcknowledgementModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<GuaranteesReceiveAcknowledgement>,
  ): Promise<{ rows: GuaranteesReceiveAcknowledgement[]; count: number }> {
    return this.guaranteesReceiveAcknowledgementModel.findAndCountAll(options);
  }

  async update(
    body: Partial<GuaranteesReceiveAcknowledgement>,
    options?: UpdateOptions<GuaranteesReceiveAcknowledgement>,
  ): Promise<[number, GuaranteesReceiveAcknowledgement[]] | [number]> {
    return this.guaranteesReceiveAcknowledgementModel.update(body, options);
  }

  async delete(
    options: FindOptions<GuaranteesReceiveAcknowledgement>,
  ): Promise<number> {
    return this.guaranteesReceiveAcknowledgementModel.destroy(options);
  }
}

@Injectable()
export class GuaranteesReceiveClaimRepository {
  constructor(
    @InjectModel(GuaranteesReceiveClaim)
    private readonly guaranteesReceiveClaimModel: typeof GuaranteesReceiveClaim,
  ) {}

  async create(
    body: CreationAttributes<GuaranteesReceiveClaim>,
    options?: CreateOptions<GuaranteesReceiveClaim>,
  ): Promise<GuaranteesReceiveClaim> {
    return this.guaranteesReceiveClaimModel.create(body, options);
  }

  async findOne(
    options: FindOptions<GuaranteesReceiveClaim>,
  ): Promise<GuaranteesReceiveClaim> {
    return this.guaranteesReceiveClaimModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<GuaranteesReceiveClaim>,
  ): Promise<GuaranteesReceiveClaim> {
    return this.guaranteesReceiveClaimModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<GuaranteesReceiveClaim>,
  ): Promise<GuaranteesReceiveClaim[]> {
    return this.guaranteesReceiveClaimModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<GuaranteesReceiveClaim>,
  ): Promise<{ rows: GuaranteesReceiveClaim[]; count: number }> {
    return this.guaranteesReceiveClaimModel.findAndCountAll(options);
  }

  async update(
    body: Partial<GuaranteesReceiveClaim>,
    options?: UpdateOptions<GuaranteesReceiveClaim>,
  ): Promise<[number, GuaranteesReceiveClaim[]] | [number]> {
    return this.guaranteesReceiveClaimModel.update(body, options);
  }

  async delete(options: FindOptions<GuaranteesReceiveClaim>): Promise<number> {
    return this.guaranteesReceiveClaimModel.destroy(options);
  }
}

@Injectable()
export class GuaranteesDocumentsPresentedRepository {
  constructor(
    @InjectModel(GuaranteesDocumentsPresented)
    private readonly guaranteesDocumentsPresentedModel: typeof GuaranteesDocumentsPresented,
  ) {}

  async create(
    body: CreationAttributes<GuaranteesDocumentsPresented>,
    options?: CreateOptions<GuaranteesDocumentsPresented>,
  ): Promise<GuaranteesDocumentsPresented> {
    return this.guaranteesDocumentsPresentedModel.create(body, options);
  }

  async findOne(
    options: FindOptions<GuaranteesDocumentsPresented>,
  ): Promise<GuaranteesDocumentsPresented> {
    return this.guaranteesDocumentsPresentedModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<GuaranteesDocumentsPresented>,
  ): Promise<GuaranteesDocumentsPresented> {
    return this.guaranteesDocumentsPresentedModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<GuaranteesDocumentsPresented>,
  ): Promise<GuaranteesDocumentsPresented[]> {
    return this.guaranteesDocumentsPresentedModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<GuaranteesDocumentsPresented>,
  ): Promise<{ rows: GuaranteesDocumentsPresented[]; count: number }> {
    return this.guaranteesDocumentsPresentedModel.findAndCountAll(options);
  }

  async update(
    body: Partial<GuaranteesDocumentsPresented>,
    options?: UpdateOptions<GuaranteesDocumentsPresented>,
  ): Promise<[number, GuaranteesDocumentsPresented[]] | [number]> {
    return this.guaranteesDocumentsPresentedModel.update(body, options);
  }

  async delete(
    options: FindOptions<GuaranteesDocumentsPresented>,
  ): Promise<number> {
    return this.guaranteesDocumentsPresentedModel.destroy(options);
  }
}

@Injectable()
export class GuaranteesCancellationRepository {
  constructor(
    @InjectModel(GuaranteesCancellation)
    private readonly guaranteesCancellationModel: typeof GuaranteesCancellation,
  ) {}

  async create(
    body: CreationAttributes<GuaranteesCancellation>,
    options?: CreateOptions<GuaranteesCancellation>,
  ): Promise<GuaranteesCancellation> {
    return this.guaranteesCancellationModel.create(body, options);
  }

  async findOne(
    options: FindOptions<GuaranteesCancellation>,
  ): Promise<GuaranteesCancellation> {
    return this.guaranteesCancellationModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<GuaranteesCancellation>,
  ): Promise<GuaranteesCancellation> {
    return this.guaranteesCancellationModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<GuaranteesCancellation>,
  ): Promise<GuaranteesCancellation[]> {
    return this.guaranteesCancellationModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<GuaranteesCancellation>,
  ): Promise<{ rows: GuaranteesCancellation[]; count: number }> {
    return this.guaranteesCancellationModel.findAndCountAll(options);
  }

  async update(
    body: Partial<GuaranteesCancellation>,
    options?: UpdateOptions<GuaranteesCancellation>,
  ): Promise<[number, GuaranteesCancellation[]] | [number]> {
    return this.guaranteesCancellationModel.update(body, options);
  }

  async delete(options: FindOptions<GuaranteesCancellation>): Promise<number> {
    return this.guaranteesCancellationModel.destroy(options);
  }
}

@Injectable()
export class GuaranteesFreeFormatRepository {
  constructor(
    @InjectModel(GuaranteesFreeFormat)
    private readonly guaranteesFreeFormatModel: typeof GuaranteesFreeFormat,
  ) {}

  async create(
    body: CreationAttributes<GuaranteesFreeFormat>,
    options?: CreateOptions<GuaranteesFreeFormat>,
  ): Promise<GuaranteesFreeFormat> {
    return this.guaranteesFreeFormatModel.create(body, options);
  }

  async findOne(
    options: FindOptions<GuaranteesFreeFormat>,
  ): Promise<GuaranteesFreeFormat> {
    return this.guaranteesFreeFormatModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<GuaranteesFreeFormat>,
  ): Promise<GuaranteesFreeFormat> {
    return this.guaranteesFreeFormatModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<GuaranteesFreeFormat>,
  ): Promise<GuaranteesFreeFormat[]> {
    return this.guaranteesFreeFormatModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<GuaranteesFreeFormat>,
  ): Promise<{ rows: GuaranteesFreeFormat[]; count: number }> {
    return this.guaranteesFreeFormatModel.findAndCountAll(options);
  }

  async update(
    body: Partial<GuaranteesFreeFormat>,
    options?: UpdateOptions<GuaranteesFreeFormat>,
  ): Promise<[number, GuaranteesFreeFormat[]] | [number]> {
    return this.guaranteesFreeFormatModel.update(body, options);
  }

  async delete(options: FindOptions<GuaranteesFreeFormat>): Promise<number> {
    return this.guaranteesFreeFormatModel.destroy(options);
  }
}
