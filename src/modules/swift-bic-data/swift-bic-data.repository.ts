import { InjectModel } from '@nestjs/sequelize';
import { SwiftBic } from './models/swift-bic-data.model';
import { Injectable } from '@nestjs/common';
import {
  CreateOptions,
  CreationAttributes,
  FindOptions,
  UpdateOptions,
} from 'sequelize';

@Injectable()
export class SwiftBicRepository {
  constructor(
    @InjectModel(SwiftBic)
    private readonly swiftBicModel: typeof SwiftBic,
  ) {}

  async create(
    body: CreationAttributes<SwiftBic>,
    options?: CreateOptions<SwiftBic>,
  ): Promise<SwiftBic> {
    return this.swiftBicModel.create(body, options);
  }

  async findOne(options: FindOptions<SwiftBic>): Promise<SwiftBic> {
    return this.swiftBicModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<SwiftBic>,
  ): Promise<SwiftBic> {
    return this.swiftBicModel.findByPk(id, options);
  }

  async findAll(options: FindOptions<SwiftBic>): Promise<SwiftBic[]> {
    return this.swiftBicModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<SwiftBic>,
  ): Promise<{ rows: SwiftBic[]; count: number }> {
    return this.swiftBicModel.findAndCountAll(options);
  }

  async update(
    body: Partial<SwiftBic>,
    options?: Omit<UpdateOptions<SwiftBic>, 'returning'> & {
      returning: Exclude<
        UpdateOptions<SwiftBic>['returning'],
        undefined | false
      >;
    },
  ): Promise<[number, SwiftBic[]]> {
    return this.swiftBicModel.update(body, options);
  }

  async delete(options: FindOptions<SwiftBic>): Promise<number> {
    return this.swiftBicModel.destroy(options);
  }
}
