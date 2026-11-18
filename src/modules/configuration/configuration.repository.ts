import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Clause } from 'src/modules/configuration/models/clause.model';
import { Reference } from 'src/modules/configuration/models/reference.model';
import {
  CreationAttributes,
  FindOptions,
  ModelScopeOptions,
  UpdateOptions,
} from 'sequelize';
import { ClauseRequest } from './models/clause-request.model';

@Injectable()
export class ClauseRequestRepository {
  constructor(
    @InjectModel(ClauseRequest)
    private readonly clauseRequestModel: typeof ClauseRequest,
  ) {}

  scope(
    scope: string | string[] | ModelScopeOptions | null,
  ): ClauseRequestRepository {
    const scopedModel = this.clauseRequestModel.scope(scope);
    const scopedRepository = Object.create(this);
    scopedRepository.clauseRequestModel = scopedModel;
    return scopedRepository;
  }

  async create(
    body: CreationAttributes<ClauseRequest>,
  ): Promise<ClauseRequest> {
    return this.clauseRequestModel.create(body);
  }

  async findOne(options: FindOptions<ClauseRequest>): Promise<ClauseRequest> {
    return this.clauseRequestModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<ClauseRequest>,
  ): Promise<ClauseRequest> {
    return this.clauseRequestModel.findByPk(id, options);
  }

  async findAll(options: FindOptions<ClauseRequest>): Promise<ClauseRequest[]> {
    return this.clauseRequestModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<ClauseRequest>,
  ): Promise<{ rows: ClauseRequest[]; count: number }> {
    return this.clauseRequestModel.findAndCountAll(options);
  }

  async update(
    body: Partial<ClauseRequest>,
    options?: Omit<UpdateOptions<ClauseRequest>, 'returning'> & {
      returning: Exclude<
        UpdateOptions<ClauseRequest>['returning'],
        undefined | false
      >;
    },
  ): Promise<[number, ClauseRequest[]]> {
    return this.clauseRequestModel.update(body, options);
  }

  async delete(options: FindOptions<ClauseRequest>): Promise<number> {
    return this.clauseRequestModel.destroy(options);
  }
}

@Injectable()
export class ClauseRepository {
  constructor(
    @InjectModel(Clause)
    private readonly clauseModel: typeof Clause,
  ) {}

  scope(scope: string | string[] | ModelScopeOptions | null): ClauseRepository {
    const scopedModel = this.clauseModel.scope(scope);
    const scopedRepository = Object.create(this);
    scopedRepository.clauseModel = scopedModel;
    return scopedRepository;
  }

  async create(body: CreationAttributes<Clause>): Promise<Clause> {
    return this.clauseModel.create(body);
  }

  async findOne(options: FindOptions<Clause>): Promise<Clause> {
    return this.clauseModel.findOne(options);
  }

  async findByPk(id: string, options: FindOptions<Clause>): Promise<Clause> {
    return this.clauseModel.findByPk(id, options);
  }

  async findAll(options: FindOptions<Clause>): Promise<Clause[]> {
    return this.clauseModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<Clause>,
  ): Promise<{ rows: Clause[]; count: number }> {
    return this.clauseModel.findAndCountAll(options);
  }

  async update(
    body: Partial<Clause>,
    options?: Omit<UpdateOptions<Clause>, 'returning'> & {
      returning: Exclude<UpdateOptions<Clause>['returning'], undefined | false>;
    },
  ): Promise<[number, Clause[]]> {
    return this.clauseModel.update(body, options);
  }

  async delete(options: FindOptions<Clause>): Promise<number> {
    return this.clauseModel.destroy(options);
  }
}

@Injectable()
export class ReferenceRepository {
  constructor(
    @InjectModel(Reference)
    private readonly referenceModel: typeof Reference,
  ) {}

  async create(body: CreationAttributes<Reference>): Promise<Reference> {
    return this.referenceModel.create(body);
  }

  async findOne(options: FindOptions<Reference>): Promise<Reference> {
    return this.referenceModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<Reference>,
  ): Promise<Reference> {
    return this.referenceModel.findByPk(id, options);
  }

  async findAll(options: FindOptions<Reference>): Promise<Reference[]> {
    return this.referenceModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<Reference>,
  ): Promise<{ rows: Reference[]; count: number }> {
    return this.referenceModel.findAndCountAll(options);
  }

  async update(
    body: Partial<Reference>,
    options?: Omit<UpdateOptions<Reference>, 'returning'> & {
      returning: Exclude<
        UpdateOptions<Reference>['returning'],
        undefined | false
      >;
    },
  ): Promise<[number, Reference[]]> {
    return this.referenceModel.update(body, options);
  }
}
