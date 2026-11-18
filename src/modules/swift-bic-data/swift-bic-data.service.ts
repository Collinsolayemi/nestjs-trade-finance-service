import { Injectable } from '@nestjs/common';
import { SwiftBicRepository } from './swift-bic-data.repository';
import { SwiftBic } from './models/swift-bic-data.model';
import { Op } from 'sequelize';

@Injectable()
export class SwiftBicService {
  constructor(private readonly swiftBicRepository: SwiftBicRepository) {}

  async getSwiftBicRecords(
    bic?: string,
    page: number = 1,
    size: number = 10,
  ): Promise<{
    swiftBicRecords: SwiftBic[];
    total: number;
    page: number;
    size: number;
  }> {
    const offset = (page - 1) * size;

    const where = bic ? { bic: { [Op.iLike]: `%${bic}%` } } : {};

    const { rows, count } = await this.swiftBicRepository.findAndCountAll({
      where,
      limit: size,
      offset,
    });

    return {
      swiftBicRecords: rows,
      total: count,
      page,
      size,
    };
  }
}
