import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  CountOptions,
  CreateOptions,
  CreationAttributes,
  FindOptions,
  ModelScopeOptions,
  QueryTypes,
  Transaction,
  UpdateOptions,
} from 'sequelize';
import { LetterOfCredit } from './models/letter-of-credit.model';
import { LetterOfCreditRequest } from './models/letter-of-credit-request.model';
import { LetterOfCreditDocumentLodgement } from './models/letter-of-credit-document-lodgement.model';
import { LetterOfCreditAmendment } from './models/letter-of-credit-amendment.model';
import { LetterOfCreditAdjustment } from './models/letter-of-credit-adjustment.model';
import { LetterOfCreditCancellation } from './models/letter-of-credit-cancellation.model';
import { LetterOfCreditFreeFormatMessage } from './models/letter-of-credit-free-format-message.model';
import { LetterOfCreditTemplate } from './models/letter-of-credit-template.model';
import { LetterOfCreditPayment } from './models/letter-of-credit-payment.model';
import { LetterOfCreditAssignmentOfProceed } from './models/letter-of-credit-assignment-of-proceed.model';
// import { LetterOfCreditNegotiation } from './models/letter-of-credit-negotiation.model';
// import { LetterOfCreditPreNegotiation } from './models/letter-of-credit-pre-negotiation.model';
// import { LetterOfCreditFxBidRequest } from './models/letter-of-credit-fx-bid-request.model';
// import { LetterOfCreditPreIssuance } from './models/letter-of-credit-pre-issuance.model';

@Injectable()
export class LetterOfCreditRequestRepository {
  constructor(
    @InjectModel(LetterOfCreditRequest)
    private readonly letterOfCreditRequestModel: typeof LetterOfCreditRequest,
  ) {}

  scope(
    scope: string | string[] | ModelScopeOptions | null,
  ): LetterOfCreditRequestRepository {
    const scopedModel = this.letterOfCreditRequestModel.scope(scope);
    const scopedRepository = Object.create(this);
    scopedRepository.letterOfCreditRequestModel = scopedModel;
    return scopedRepository;
  }

  async create(
    body: CreationAttributes<LetterOfCreditRequest>,
    options?: CreateOptions<LetterOfCreditRequest>,
  ): Promise<LetterOfCreditRequest> {
    return this.letterOfCreditRequestModel.create(body, options);
  }

  async findOne(
    options: FindOptions<LetterOfCreditRequest>,
  ): Promise<LetterOfCreditRequest> {
    return this.letterOfCreditRequestModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<LetterOfCreditRequest>,
  ): Promise<LetterOfCreditRequest> {
    return this.letterOfCreditRequestModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<LetterOfCreditRequest>,
  ): Promise<LetterOfCreditRequest[]> {
    return this.letterOfCreditRequestModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<LetterOfCreditRequest>,
  ): Promise<{ rows: LetterOfCreditRequest[]; count: number }> {
    return this.letterOfCreditRequestModel.findAndCountAll(options);
  }

  async count(options?: CountOptions<LetterOfCreditRequest>): Promise<number> {
    return this.letterOfCreditRequestModel.count(options);
  }

  async update(
    body: Partial<LetterOfCreditRequest>,
    options?: UpdateOptions<LetterOfCreditRequest>,
  ): Promise<[number, LetterOfCreditRequest[]] | [number]> {
    return this.letterOfCreditRequestModel.update(body, options);
  }

  async delete(options: FindOptions<LetterOfCreditRequest>): Promise<number> {
    return this.letterOfCreditRequestModel.destroy(options);
  }
}

@Injectable()
export class LetterOfCreditRepository {
  constructor(
    @InjectModel(LetterOfCredit)
    private readonly letterOfCreditModel: typeof LetterOfCredit,
  ) {}

  async create(
    body: CreationAttributes<LetterOfCredit>,
    options?: CreateOptions<LetterOfCredit>,
  ): Promise<LetterOfCredit> {
    return this.letterOfCreditModel.create(body, options);
  }

  async findOne(options: FindOptions<LetterOfCredit>): Promise<LetterOfCredit> {
    return this.letterOfCreditModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<LetterOfCredit>,
  ): Promise<LetterOfCredit> {
    return this.letterOfCreditModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<LetterOfCredit>,
  ): Promise<LetterOfCredit[]> {
    return this.letterOfCreditModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<LetterOfCredit>,
  ): Promise<{ rows: LetterOfCredit[]; count: number }> {
    return this.letterOfCreditModel.findAndCountAll(options);
  }

  async update(
    body: Partial<LetterOfCredit>,
    options?: UpdateOptions<LetterOfCredit>,
  ): Promise<[number, LetterOfCredit[]] | [number]> {
    return this.letterOfCreditModel.update(body, options);
  }

  async delete(options: FindOptions<LetterOfCredit>): Promise<number> {
    return this.letterOfCreditModel.destroy(options);
  }

  async appendSwiftMessage(
    id: string,
    message: Record<string, unknown>,
    options?: { transaction?: Transaction },
  ): Promise<void> {
    await this.letterOfCreditModel.sequelize.query(
      `UPDATE letter_of_credits
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
    entry: { letterOfCreditActionType: string; transactionId: string },
    options?: { transaction?: Transaction },
  ): Promise<void> {
    await this.letterOfCreditModel.sequelize.query(
      `UPDATE letter_of_credits
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
      letterOfCreditActionType: string;
      transactionId: string;
      isReversed: boolean;
      transactionReversalId: string;
    },
    options?: { transaction?: Transaction },
  ): Promise<void> {
    await this.letterOfCreditModel.sequelize.query(
      `UPDATE letter_of_credits
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
export class LetterOfCreditAmendmentRepository {
  constructor(
    @InjectModel(LetterOfCreditAmendment)
    private readonly letterOfCreditAmendmentModel: typeof LetterOfCreditAmendment,
  ) {}

  async create(
    body: CreationAttributes<LetterOfCreditAmendment>,
    options?: CreateOptions<LetterOfCreditAmendment>,
  ): Promise<LetterOfCreditAmendment> {
    return this.letterOfCreditAmendmentModel.create(body, options);
  }

  async findOne(
    options: FindOptions<LetterOfCreditAmendment>,
  ): Promise<LetterOfCreditAmendment> {
    return this.letterOfCreditAmendmentModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<LetterOfCreditAmendment>,
  ): Promise<LetterOfCreditAmendment> {
    return this.letterOfCreditAmendmentModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<LetterOfCreditAmendment>,
  ): Promise<LetterOfCreditAmendment[]> {
    return this.letterOfCreditAmendmentModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<LetterOfCreditAmendment>,
  ): Promise<{ rows: LetterOfCreditAmendment[]; count: number }> {
    return this.letterOfCreditAmendmentModel.findAndCountAll(options);
  }

  async update(
    body: Partial<LetterOfCreditAmendment>,
    options?: UpdateOptions<LetterOfCreditAmendment>,
  ): Promise<[number, LetterOfCreditAmendment[]] | [number]> {
    return this.letterOfCreditAmendmentModel.update(body, options);
  }
}

@Injectable()
export class LetterOfCreditAdjustmentRepository {
  constructor(
    @InjectModel(LetterOfCreditAdjustment)
    private readonly letterOfCreditAdjustmentModel: typeof LetterOfCreditAdjustment,
  ) {}

  async create(
    body: CreationAttributes<LetterOfCreditAdjustment>,
    options?: CreateOptions<LetterOfCreditAdjustment>,
  ): Promise<LetterOfCreditAdjustment> {
    return this.letterOfCreditAdjustmentModel.create(body, options);
  }

  async findOne(
    options: FindOptions<LetterOfCreditAdjustment>,
  ): Promise<LetterOfCreditAdjustment> {
    return this.letterOfCreditAdjustmentModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<LetterOfCreditAdjustment>,
  ): Promise<LetterOfCreditAdjustment> {
    return this.letterOfCreditAdjustmentModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<LetterOfCreditAdjustment>,
  ): Promise<LetterOfCreditAdjustment[]> {
    return this.letterOfCreditAdjustmentModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<LetterOfCreditAdjustment>,
  ): Promise<{ rows: LetterOfCreditAdjustment[]; count: number }> {
    return this.letterOfCreditAdjustmentModel.findAndCountAll(options);
  }

  async update(
    body: Partial<LetterOfCreditAdjustment>,
    options?: UpdateOptions<LetterOfCreditAdjustment>,
  ): Promise<[number, LetterOfCreditAdjustment[]] | [number]> {
    return this.letterOfCreditAdjustmentModel.update(body, options);
  }
}

@Injectable()
export class LetterOfCreditPaymentRepository {
  constructor(
    @InjectModel(LetterOfCreditPayment)
    private readonly letterOfCreditPaymentModel: typeof LetterOfCreditPayment,
  ) {}

  async create(
    body: CreationAttributes<LetterOfCreditPayment>,
    options?: CreateOptions<LetterOfCreditPayment>,
  ): Promise<LetterOfCreditPayment> {
    return this.letterOfCreditPaymentModel.create(body, options);
  }

  async findOne(
    options: FindOptions<LetterOfCreditPayment>,
  ): Promise<LetterOfCreditPayment> {
    return this.letterOfCreditPaymentModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<LetterOfCreditPayment>,
  ): Promise<LetterOfCreditPayment> {
    return this.letterOfCreditPaymentModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<LetterOfCreditPayment>,
  ): Promise<LetterOfCreditPayment[]> {
    return this.letterOfCreditPaymentModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<LetterOfCreditPayment>,
  ): Promise<{ rows: LetterOfCreditPayment[]; count: number }> {
    return this.letterOfCreditPaymentModel.findAndCountAll(options);
  }

  async update(
    body: Partial<LetterOfCreditPayment>,
    options?: UpdateOptions<LetterOfCreditPayment>,
  ): Promise<[number, LetterOfCreditPayment[]] | [number]> {
    return this.letterOfCreditPaymentModel.update(body, options);
  }
}

@Injectable()
export class LetterOfCreditDocumentLodgementRepository {
  constructor(
    @InjectModel(LetterOfCreditDocumentLodgement)
    private readonly letterOfCreditDocumentLodgemenntModel: typeof LetterOfCreditDocumentLodgement,
  ) {}

  async create(
    body: CreationAttributes<LetterOfCreditDocumentLodgement>,
    options?: CreateOptions<LetterOfCreditDocumentLodgement>,
  ): Promise<LetterOfCreditDocumentLodgement> {
    return this.letterOfCreditDocumentLodgemenntModel.create(body, options);
  }

  async findOne(
    options: FindOptions<LetterOfCreditDocumentLodgement>,
  ): Promise<LetterOfCreditDocumentLodgement> {
    return this.letterOfCreditDocumentLodgemenntModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<LetterOfCreditDocumentLodgement>,
  ): Promise<LetterOfCreditDocumentLodgement> {
    return this.letterOfCreditDocumentLodgemenntModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<LetterOfCreditDocumentLodgement>,
  ): Promise<LetterOfCreditDocumentLodgement[]> {
    return this.letterOfCreditDocumentLodgemenntModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<LetterOfCreditDocumentLodgement>,
  ): Promise<{ rows: LetterOfCreditDocumentLodgement[]; count: number }> {
    return this.letterOfCreditDocumentLodgemenntModel.findAndCountAll(options);
  }

  async update(
    body: Partial<LetterOfCreditDocumentLodgement>,
    options?: UpdateOptions<LetterOfCreditDocumentLodgement>,
  ): Promise<[number, LetterOfCreditDocumentLodgement[]] | [number]> {
    return this.letterOfCreditDocumentLodgemenntModel.update(body, options);
  }
}

@Injectable()
export class LetterOfCreditCancellationRepository {
  constructor(
    @InjectModel(LetterOfCreditCancellation)
    private readonly letterOfCreditCancellationModel: typeof LetterOfCreditCancellation,
  ) {}

  async create(
    body: CreationAttributes<LetterOfCreditCancellation>,
    options?: CreateOptions<LetterOfCreditCancellation>,
  ): Promise<LetterOfCreditCancellation> {
    return this.letterOfCreditCancellationModel.create(body, options);
  }

  async findOne(
    options: FindOptions<LetterOfCreditCancellation>,
  ): Promise<LetterOfCreditCancellation> {
    return this.letterOfCreditCancellationModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<LetterOfCreditCancellation>,
  ): Promise<LetterOfCreditCancellation> {
    return this.letterOfCreditCancellationModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<LetterOfCreditCancellation>,
  ): Promise<LetterOfCreditCancellation[]> {
    return this.letterOfCreditCancellationModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<LetterOfCreditCancellation>,
  ): Promise<{ rows: LetterOfCreditCancellation[]; count: number }> {
    return this.letterOfCreditCancellationModel.findAndCountAll(options);
  }

  async update(
    body: Partial<LetterOfCreditCancellation>,
    options?: UpdateOptions<LetterOfCreditCancellation>,
  ): Promise<[number, LetterOfCreditCancellation[]] | [number]> {
    return this.letterOfCreditCancellationModel.update(body, options);
  }
}

@Injectable()
export class LetterOfCreditFreeFormatMessageRepository {
  constructor(
    @InjectModel(LetterOfCreditFreeFormatMessage)
    private readonly letterOfCreditFreeFormatMessageModel: typeof LetterOfCreditFreeFormatMessage,
  ) {}

  async create(
    body: CreationAttributes<LetterOfCreditFreeFormatMessage>,
    options?: CreateOptions<LetterOfCreditFreeFormatMessage>,
  ): Promise<LetterOfCreditFreeFormatMessage> {
    return this.letterOfCreditFreeFormatMessageModel.create(body, options);
  }

  async findOne(
    options: FindOptions<LetterOfCreditFreeFormatMessage>,
  ): Promise<LetterOfCreditFreeFormatMessage> {
    return this.letterOfCreditFreeFormatMessageModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<LetterOfCreditFreeFormatMessage>,
  ): Promise<LetterOfCreditFreeFormatMessage> {
    return this.letterOfCreditFreeFormatMessageModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<LetterOfCreditFreeFormatMessage>,
  ): Promise<LetterOfCreditFreeFormatMessage[]> {
    return this.letterOfCreditFreeFormatMessageModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<LetterOfCreditFreeFormatMessage>,
  ): Promise<{ rows: LetterOfCreditFreeFormatMessage[]; count: number }> {
    return this.letterOfCreditFreeFormatMessageModel.findAndCountAll(options);
  }

  async update(
    body: Partial<LetterOfCreditFreeFormatMessage>,
    options?: UpdateOptions<LetterOfCreditFreeFormatMessage>,
  ): Promise<[number, LetterOfCreditFreeFormatMessage[]] | [number]> {
    return this.letterOfCreditFreeFormatMessageModel.update(body, options);
  }
}

@Injectable()
export class LetterOfCreditTemplateRepository {
  constructor(
    @InjectModel(LetterOfCreditTemplate)
    private readonly letterOfCreditTemplateModel: typeof LetterOfCreditTemplate,
  ) {}

  async create(
    body: CreationAttributes<LetterOfCreditTemplate>,
    options?: CreateOptions<LetterOfCreditTemplate>,
  ): Promise<LetterOfCreditTemplate> {
    return this.letterOfCreditTemplateModel.create(body, options);
  }

  async findOne(
    options: FindOptions<LetterOfCreditTemplate>,
  ): Promise<LetterOfCreditTemplate> {
    return this.letterOfCreditTemplateModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<LetterOfCreditTemplate>,
  ): Promise<LetterOfCreditTemplate> {
    return this.letterOfCreditTemplateModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<LetterOfCreditTemplate>,
  ): Promise<LetterOfCreditTemplate[]> {
    return this.letterOfCreditTemplateModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<LetterOfCreditTemplate>,
  ): Promise<{ rows: LetterOfCreditTemplate[]; count: number }> {
    return this.letterOfCreditTemplateModel.findAndCountAll(options);
  }

  async update(
    body: Partial<LetterOfCreditTemplate>,
    options?: UpdateOptions<LetterOfCreditTemplate>,
  ): Promise<[number, LetterOfCreditTemplate[]] | [number]> {
    return this.letterOfCreditTemplateModel.update(body, options);
  }
}

@Injectable()
export class LetterOfCreditAssignmentOfProceedRepository {
  constructor(
    @InjectModel(LetterOfCreditAssignmentOfProceed)
    private readonly letterOfCreditAssignmentOfProceedModel: typeof LetterOfCreditAssignmentOfProceed,
  ) {}

  async create(
    body: CreationAttributes<LetterOfCreditAssignmentOfProceed>,
    options?: CreateOptions<LetterOfCreditAssignmentOfProceed>,
  ): Promise<LetterOfCreditAssignmentOfProceed> {
    return this.letterOfCreditAssignmentOfProceedModel.create(body, options);
  }

  async findOne(
    options: FindOptions<LetterOfCreditAssignmentOfProceed>,
  ): Promise<LetterOfCreditAssignmentOfProceed> {
    return this.letterOfCreditAssignmentOfProceedModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<LetterOfCreditAssignmentOfProceed>,
  ): Promise<LetterOfCreditAssignmentOfProceed> {
    return this.letterOfCreditAssignmentOfProceedModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<LetterOfCreditAssignmentOfProceed>,
  ): Promise<LetterOfCreditAssignmentOfProceed[]> {
    return this.letterOfCreditAssignmentOfProceedModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<LetterOfCreditAssignmentOfProceed>,
  ): Promise<{ rows: LetterOfCreditAssignmentOfProceed[]; count: number }> {
    return this.letterOfCreditAssignmentOfProceedModel.findAndCountAll(options);
  }

  async update(
    body: Partial<LetterOfCreditAssignmentOfProceed>,
    options?: UpdateOptions<LetterOfCreditAssignmentOfProceed>,
  ): Promise<[number, LetterOfCreditAssignmentOfProceed[]] | [number]> {
    return this.letterOfCreditAssignmentOfProceedModel.update(body, options);
  }
}

// @Injectable()
// export class LetterOfCreditNegotiationRepository {
//   constructor(
//     @InjectModel(LetterOfCreditNegotiation)
//     private readonly letterOfCreditNegotiationModel: typeof LetterOfCreditNegotiation,
//   ) {}

//   async create(
//     body: CreationAttributes<LetterOfCreditNegotiation>,
//     options?: CreateOptions<LetterOfCreditNegotiation>,
//   ): Promise<LetterOfCreditNegotiation> {
//     return this.letterOfCreditNegotiationModel.create(body, options);
//   }

//   async findOne(
//     options: FindOptions<LetterOfCreditNegotiation>,
//   ): Promise<LetterOfCreditNegotiation> {
//     return this.letterOfCreditNegotiationModel.findOne(options);
//   }

//   async findByPk(
//     id: string,
//     options: FindOptions<LetterOfCreditNegotiation>,
//   ): Promise<LetterOfCreditNegotiation> {
//     return this.letterOfCreditNegotiationModel.findByPk(id, options);
//   }

//   async findAll(
//     options: FindOptions<LetterOfCreditNegotiation>,
//   ): Promise<LetterOfCreditNegotiation[]> {
//     return this.letterOfCreditNegotiationModel.findAll(options);
//   }

//   async findAndCountAll(
//     options: FindOptions<LetterOfCreditNegotiation>,
//   ): Promise<{ rows: LetterOfCreditNegotiation[]; count: number }> {
//     return this.letterOfCreditNegotiationModel.findAndCountAll(options);
//   }

//   async update(
//     body: Partial<LetterOfCreditNegotiation>,
//     options?: Omit<UpdateOptions<LetterOfCreditNegotiation>, 'returning'> & {
//       returning: Exclude<
//         UpdateOptions<LetterOfCreditNegotiation>['returning'],
//         undefined | false
//       >;
//     },
//   ): Promise<[number, LetterOfCreditNegotiation[]]> {
//     return this.letterOfCreditNegotiationModel.update(body, options);
//   }
// }

// @Injectable()
// export class LetterOfCreditPreNegotiationRepository {
//   constructor(
//     @InjectModel(LetterOfCreditPreNegotiation)
//     private readonly letterOfCreditPreNegotiationModel: typeof LetterOfCreditPreNegotiation,
//   ) {}

//   async create(
//     body: CreationAttributes<LetterOfCreditPreNegotiation>,
//     options?: CreateOptions<LetterOfCreditPreNegotiation>,
//   ): Promise<LetterOfCreditPreNegotiation> {
//     return this.letterOfCreditPreNegotiationModel.create(body, options);
//   }

//   async findOne(
//     options: FindOptions<LetterOfCreditPreNegotiation>,
//   ): Promise<LetterOfCreditPreNegotiation> {
//     return this.letterOfCreditPreNegotiationModel.findOne(options);
//   }

//   async findByPk(
//     id: string,
//     options: FindOptions<LetterOfCreditPreNegotiation>,
//   ): Promise<LetterOfCreditPreNegotiation> {
//     return this.letterOfCreditPreNegotiationModel.findByPk(id, options);
//   }

//   async findAll(
//     options: FindOptions<LetterOfCreditPreNegotiation>,
//   ): Promise<LetterOfCreditPreNegotiation[]> {
//     return this.letterOfCreditPreNegotiationModel.findAll(options);
//   }

//   async findAndCountAll(
//     options: FindOptions<LetterOfCreditPreNegotiation>,
//   ): Promise<{ rows: LetterOfCreditPreNegotiation[]; count: number }> {
//     return this.letterOfCreditPreNegotiationModel.findAndCountAll(options);
//   }

//   async update(
//     body: Partial<LetterOfCreditPreNegotiation>,
//     options?: Omit<UpdateOptions<LetterOfCreditPreNegotiation>, 'returning'> & {
//       returning: Exclude<
//         UpdateOptions<LetterOfCreditPreNegotiation>['returning'],
//         undefined | false
//       >;
//     },
//   ): Promise<[number, LetterOfCreditPreNegotiation[]]> {
//     return this.letterOfCreditPreNegotiationModel.update(body, options);
//   }
// }

// @Injectable()
// export class LetterOfCreditFxBidRequestRepository {
//   constructor(
//     @InjectModel(LetterOfCreditFxBidRequest)
//     private readonly letterOfCreditFxBidRequestModel: typeof LetterOfCreditFxBidRequest,
//   ) {}

//   async create(
//     body: CreationAttributes<LetterOfCreditFxBidRequest>,
//     options?: CreateOptions<LetterOfCreditFxBidRequest>,
//   ): Promise<LetterOfCreditFxBidRequest> {
//     return this.letterOfCreditFxBidRequestModel.create(body, options);
//   }

//   async findOne(
//     options: FindOptions<LetterOfCreditFxBidRequest>,
//   ): Promise<LetterOfCreditFxBidRequest> {
//     return this.letterOfCreditFxBidRequestModel.findOne(options);
//   }

//   async findByPk(
//     id: string,
//     options: FindOptions<LetterOfCreditFxBidRequest>,
//   ): Promise<LetterOfCreditFxBidRequest> {
//     return this.letterOfCreditFxBidRequestModel.findByPk(id, options);
//   }

//   async findAll(
//     options: FindOptions<LetterOfCreditFxBidRequest>,
//   ): Promise<LetterOfCreditFxBidRequest[]> {
//     return this.letterOfCreditFxBidRequestModel.findAll(options);
//   }

//   async findAndCountAll(
//     options: FindOptions<LetterOfCreditFxBidRequest>,
//   ): Promise<{ rows: LetterOfCreditFxBidRequest[]; count: number }> {
//     return this.letterOfCreditFxBidRequestModel.findAndCountAll(options);
//   }

//   async update(
//     body: Partial<LetterOfCreditFxBidRequest>,
//     options?: Omit<UpdateOptions<LetterOfCreditFxBidRequest>, 'returning'> & {
//       returning: Exclude<
//         UpdateOptions<LetterOfCreditFxBidRequest>['returning'],
//         undefined | false
//       >;
//     },
//   ): Promise<[number, LetterOfCreditFxBidRequest[]]> {
//     return this.letterOfCreditFxBidRequestModel.update(body, options);
//   }
// }
