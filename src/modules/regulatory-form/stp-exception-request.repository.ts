import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreationAttributes,
  FindOptions,
  ModelScopeOptions,
  UpdateOptions,
} from 'sequelize';
import { StpExceptionRequest } from './models/stp-exception-request.model';

@Injectable()
export class StpExceptionRequestRepository {
  constructor(
    @InjectModel(StpExceptionRequest)
    private readonly stpExceptionResolveRequestModel: typeof StpExceptionRequest,
  ) {}

  scope(
    scope: string | string[] | ModelScopeOptions | null,
  ): StpExceptionRequestRepository {
    const scopedModel = this.stpExceptionResolveRequestModel.scope(scope);
    const scopedRepository = Object.create(this);
    scopedRepository.stpExceptionResolveRequestModel = scopedModel;
    return scopedRepository;
  }

  async create(
    body: CreationAttributes<StpExceptionRequest>,
  ): Promise<StpExceptionRequest> {
    return this.stpExceptionResolveRequestModel.create(body);
  }

  async findOne(
    options: FindOptions<StpExceptionRequest>,
  ): Promise<StpExceptionRequest> {
    return this.stpExceptionResolveRequestModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<StpExceptionRequest>,
  ): Promise<StpExceptionRequest> {
    return this.stpExceptionResolveRequestModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<StpExceptionRequest>,
  ): Promise<StpExceptionRequest[]> {
    return this.stpExceptionResolveRequestModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<StpExceptionRequest>,
  ): Promise<{ rows: StpExceptionRequest[]; count: number }> {
    return this.stpExceptionResolveRequestModel.findAndCountAll(options);
  }

  async update(
    body: Partial<StpExceptionRequest>,
    options?: UpdateOptions<StpExceptionRequest>,
  ): Promise<[number, StpExceptionRequest[]] | [number]> {
    return this.stpExceptionResolveRequestModel.update(body, options);
  }

  async delete(options: FindOptions<StpExceptionRequest>): Promise<number> {
    return this.stpExceptionResolveRequestModel.destroy(options);
  }
}
