import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import {
  CreateOptions,
  CreationAttributes,
  FindOptions,
  UpdateOptions,
} from 'sequelize';
import { TradeJournalPosting } from './models/trade-journal-posting.model';

@Injectable()
export class TradeJournalPostingRepository {
  constructor(
    @InjectModel(TradeJournalPosting)
    private readonly tradeJournalPostingModel: typeof TradeJournalPosting,
  ) {}

  async create(
    body: CreationAttributes<TradeJournalPosting>,
    options?: CreateOptions<TradeJournalPosting>,
  ): Promise<TradeJournalPosting> {
    return this.tradeJournalPostingModel.create(body, options);
  }

  async findOne(
    options: FindOptions<TradeJournalPosting>,
  ): Promise<TradeJournalPosting> {
    return this.tradeJournalPostingModel.findOne(options);
  }

  async findByPk(
    id: string,
    options: FindOptions<TradeJournalPosting>,
  ): Promise<TradeJournalPosting> {
    return this.tradeJournalPostingModel.findByPk(id, options);
  }

  async findAll(
    options: FindOptions<TradeJournalPosting>,
  ): Promise<TradeJournalPosting[]> {
    return this.tradeJournalPostingModel.findAll(options);
  }

  async findAndCountAll(
    options: FindOptions<TradeJournalPosting>,
  ): Promise<{ rows: TradeJournalPosting[]; count: number }> {
    return this.tradeJournalPostingModel.findAndCountAll(options);
  }

  async update(
    body: Partial<TradeJournalPosting>,
    options?: Omit<UpdateOptions<TradeJournalPosting>, 'returning'> & {
      returning: Exclude<
        UpdateOptions<TradeJournalPosting>['returning'],
        undefined | false
      >;
    },
  ): Promise<[number, TradeJournalPosting[]]> {
    return this.tradeJournalPostingModel.update(body, options);
  }

  async delete(options?: FindOptions<TradeJournalPosting>): Promise<number> {
    return this.tradeJournalPostingModel.destroy(options);
  }
}
