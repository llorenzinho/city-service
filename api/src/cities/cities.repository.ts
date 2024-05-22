import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { City } from './entities/city.entity';

@Injectable()
export class CitiesRepository {
  private readonly logger = new Logger('CitiesRepository');
  constructor(@InjectModel(City.name) private cities: Model<City>) {}

  private queryToRegex(query: FilterQuery<City>): FilterQuery<City> {
    const keys = Object.keys(query);
    for (const key of keys) {
      query[key] = new RegExp(query[key], 'i');
    }
    return query;
  }

  async deleteMany(query: FilterQuery<City>) {
    const q = this.queryToRegex(query);
    const c = await this.cities.deleteMany(q);
    this.logger.debug(`Deleted ${c.deletedCount} cities`);
  }

  findAll(): Promise<City[]> {
    return this.cities.find();
  }

  findOne(query: FilterQuery<City>): Promise<City> {
    query = this.queryToRegex(query);
    return this.cities
      .findOne(query)
      .collation({ locale: 'en', strength: 2 })
      .exec();
  }

  find(
    query?: FilterQuery<City>,
    page?: number,
    limit?: number,
  ): Promise<City[]> {
    query = this.queryToRegex(query);
    if (page && limit)
      return this.cities
        .find(query)
        .collation({ locale: 'en', strength: 2 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

    return this.cities
      .find(query)
      .collation({ locale: 'en', strength: 2 })
      .exec();
  }

  async bulkInsert(cities: City[]) {
    const c = await this.cities.insertMany(cities);
    this.logger.debug(`Inserted ${c.length} cities`);
  }
}
