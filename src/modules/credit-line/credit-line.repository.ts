import { Injectable } from '@nestjs/common';
import { FindOptions, WhereOptions } from 'sequelize';
import { CreditLine } from './models/credit-line.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreditLineRequest } from './models/credit-line-request.model';
import { isUUID } from 'class-validator';

@Injectable()
export class CreditLineRepository {
  constructor(
    @InjectModel(CreditLine)
    private readonly model: typeof CreditLine,
  ) {}
  async create(body: Partial<CreditLine>): Promise<CreditLine> {
    return this.model.create(body);
  }
  async count(where: WhereOptions<CreditLine>) {
    return this.model.count({ where });
  }
  async findOne(where: WhereOptions<CreditLine>): Promise<CreditLine> {
    return this.model.findOne({ where, raw: true });
  }

  async find(args: FindOptions<CreditLine>): Promise<CreditLine[]> {
    return this.model.findAll({ ...args, raw: true });
  }

  async findByAny(id: string): Promise<CreditLine> {
    let where = {};

    if (isUUID(id)) {
      where = {
        creditLineId: id,
      };
    } else {
      where = {
        creditLineReferenceCode: id,
      };
    }
    return this.model.findOne({ where, raw: true });
  }

  async findAndCount(
    args: FindOptions<CreditLine>,
  ): Promise<{ data: CreditLine[]; count: number }> {
    const result = await this.model.findAndCountAll({ ...args, raw: true });

    return {
      data: result.rows,
      count: result.count,
    };
  }

  async update(
    where: WhereOptions<CreditLine>,
    args: Partial<CreditLine>,
  ): Promise<CreditLine[]> {
    const [, updatedRows] = await this.model.update(args, {
      where,
      returning: true,
    });
    return updatedRows;
  }

  async softDelete(where: WhereOptions<CreditLine>) {
    return this.model.destroy({ where });
  }
}

@Injectable()
export class CreditLineRequestRepository {
  constructor(
    @InjectModel(CreditLineRequest)
    private readonly model: typeof CreditLineRequest,
  ) {}
  async create(body: Partial<CreditLineRequest>): Promise<CreditLineRequest> {
    return this.model.create(body);
  }
  async count(where: WhereOptions<CreditLineRequest>) {
    return this.model.count({ where });
  }
  async findOne(
    where: WhereOptions<CreditLineRequest>,
  ): Promise<CreditLineRequest> {
    return this.model.findOne({ where, raw: true });
  }

  async update(
    where: WhereOptions<CreditLineRequest>,
    args: Partial<CreditLineRequest>,
  ): Promise<CreditLineRequest[]> {
    const [, updatedRows] = await this.model.update(args, {
      where,
      returning: true,
    });
    return updatedRows;
  }

  async softDelete(where: WhereOptions<CreditLineRequest>) {
    return this.model.destroy({
      where,
    });
  }
  async findAndCount(
    args: FindOptions<CreditLineRequest>,
  ): Promise<{ data: CreditLineRequest[]; count: number }> {
    const result = await this.model.findAndCountAll({ ...args, raw: true });

    return {
      data: result.rows,
      count: result.count,
    };
  }
}
