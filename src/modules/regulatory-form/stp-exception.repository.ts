import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes, FindOptions, UpdateOptions } from 'sequelize';
import { StpException } from './models/stp-exception.model';

@Injectable()
export class StpExceptionRepository {
  constructor(
    @InjectModel(StpException)
    private readonly stpExceptionModel: typeof StpException,
  ) {}

  async create(body: CreationAttributes<StpException>): Promise<StpException> {
    return this.stpExceptionModel.create(body);
  }

  async findOne(options: FindOptions<StpException>): Promise<StpException> {
    return this.stpExceptionModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<StpException>,
  ): Promise<StpException> {
    return this.stpExceptionModel.findByPk(id, options);
  }

  async findAll(options: FindOptions<StpException>): Promise<StpException[]> {
    return this.stpExceptionModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<StpException>,
  ): Promise<{ rows: StpException[]; count: number }> {
    return this.stpExceptionModel.findAndCountAll(options);
  }

  async update(
    body: Partial<StpException>,
    options?: UpdateOptions<StpException>,
  ): Promise<[number, StpException[]] | [number]> {
    return this.stpExceptionModel.update(body, options);
  }
}
