import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FormM } from './models/form-m.model';
import { CreationAttributes, FindOptions, UpdateOptions } from 'sequelize';
import { RegulatoryFormChargesAndTaxes } from './models/regulatory-form-charges-and-taxes.model';
import { FormNXP } from './models/form-nxp.model';
import { FormNCX } from './models/form-ncx.model';
import { FormA } from './models/form-a.model';

@Injectable()
export class FormMRepository {
  constructor(
    @InjectModel(FormM)
    private readonly formMModel: typeof FormM,
  ) {}

  async create(body: CreationAttributes<FormM>): Promise<FormM> {
    return this.formMModel.create(body);
  }

  async findOne(options: FindOptions<FormM>): Promise<FormM> {
    return this.formMModel.findOne(options);
  }

  async findByPk(id: string, options: FindOptions<FormM>): Promise<FormM> {
    return this.formMModel.findByPk(id, options);
  }

  async findAll(options: FindOptions<FormM>): Promise<FormM[]> {
    return this.formMModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<FormM>,
  ): Promise<{ rows: FormM[]; count: number }> {
    return this.formMModel.findAndCountAll(options);
  }

  async update(
    body: Partial<FormM>,
    options?: UpdateOptions<FormM>,
  ): Promise<[number, FormM[]] | [number]> {
    return this.formMModel.update(body, options);
  }
}

export class FormNXPRepository {
  constructor(
    @InjectModel(FormNXP)
    private readonly formNXPModel: typeof FormNXP,
  ) {}

  async create(body: CreationAttributes<FormNXP>): Promise<FormNXP> {
    return this.formNXPModel.create(body);
  }

  async findOne(options: FindOptions<FormNXP>): Promise<FormNXP> {
    return this.formNXPModel.findOne(options);
  }

  async findByPk(id: string, options: FindOptions<FormNXP>): Promise<FormNXP> {
    return this.formNXPModel.findByPk(id, options);
  }

  async findAll(options: FindOptions<FormNXP>): Promise<FormNXP[]> {
    return this.formNXPModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<FormNXP>,
  ): Promise<{ rows: FormNXP[]; count: number }> {
    return this.formNXPModel.findAndCountAll(options);
  }

  async update(
    body: Partial<FormNXP>,
    options?: UpdateOptions<FormNXP>,
  ): Promise<[number, FormNXP[]] | [number]> {
    return this.formNXPModel.update(body, options);
  }
}

export class FormNCXRepository {
  constructor(
    @InjectModel(FormNCX)
    private readonly formNCXModel: typeof FormNCX,
  ) {}

  async create(body: CreationAttributes<FormNCX>): Promise<FormNCX> {
    return this.formNCXModel.create(body);
  }

  async findOne(options: FindOptions<FormNCX>): Promise<FormNCX> {
    return this.formNCXModel.findOne(options);
  }

  async findByPk(id: string, options: FindOptions<FormNCX>): Promise<FormNCX> {
    return this.formNCXModel.findByPk(id, options);
  }

  async findAll(options: FindOptions<FormNCX>): Promise<FormNCX[]> {
    return this.formNCXModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<FormNCX>,
  ): Promise<{ rows: FormNCX[]; count: number }> {
    return this.formNCXModel.findAndCountAll(options);
  }

  async update(
    body: Partial<FormNCX>,
    options?: UpdateOptions<FormNCX>,
  ): Promise<[number, FormNCX[]] | [number]> {
    return this.formNCXModel.update(body, options);
  }
}

export class FormARepository {
  constructor(
    @InjectModel(FormA)
    private readonly formAModel: typeof FormA,
  ) {}

  async create(body: CreationAttributes<FormA>): Promise<FormA> {
    return this.formAModel.create(body);
  }

  async findOne(options: FindOptions<FormA>): Promise<FormA> {
    return this.formAModel.findOne(options);
  }

  async findByPk(id: string, options: FindOptions<FormA>): Promise<FormA> {
    return this.formAModel.findByPk(id, options);
  }

  async findAll(options: FindOptions<FormA>): Promise<FormA[]> {
    return this.formAModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<FormA>,
  ): Promise<{ rows: FormA[]; count: number }> {
    return this.formAModel.findAndCountAll(options);
  }

  async update(
    body: Partial<FormA>,
    options?: UpdateOptions<FormA>,
  ): Promise<[number, FormA[]] | [number]> {
    return this.formAModel.update(body, options);
  }
}

export class RegulatoryFormChargesAndTaxesRepository {
  constructor(
    @InjectModel(RegulatoryFormChargesAndTaxes)
    private readonly regulatoryFormChargesAndTaxesModel: typeof RegulatoryFormChargesAndTaxes,
  ) {}

  async create(
    body: CreationAttributes<RegulatoryFormChargesAndTaxes>,
  ): Promise<RegulatoryFormChargesAndTaxes> {
    return this.regulatoryFormChargesAndTaxesModel.create(body);
  }

  async findOne(
    options: FindOptions<RegulatoryFormChargesAndTaxes>,
  ): Promise<RegulatoryFormChargesAndTaxes> {
    return this.regulatoryFormChargesAndTaxesModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<RegulatoryFormChargesAndTaxes>,
  ): Promise<RegulatoryFormChargesAndTaxes> {
    return this.regulatoryFormChargesAndTaxesModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<RegulatoryFormChargesAndTaxes>,
  ): Promise<RegulatoryFormChargesAndTaxes[]> {
    return this.regulatoryFormChargesAndTaxesModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<RegulatoryFormChargesAndTaxes>,
  ): Promise<{ rows: RegulatoryFormChargesAndTaxes[]; count: number }> {
    return this.regulatoryFormChargesAndTaxesModel.findAndCountAll(options);
  }

  async update(
    body: Partial<RegulatoryFormChargesAndTaxes>,
    options?: UpdateOptions<RegulatoryFormChargesAndTaxes>,
  ): Promise<[number, RegulatoryFormChargesAndTaxes[]] | [number]> {
    return this.regulatoryFormChargesAndTaxesModel.update(body, options);
  }
}
