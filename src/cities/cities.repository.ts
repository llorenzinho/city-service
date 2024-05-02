import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { City } from './entities/city.entity';
import { FilterQuery, Model } from 'mongoose';
import { CitiesController } from './cities.controller';

@Injectable()
export class CitiesRepository {
  private readonly logger = new Logger("CitiesRepository");
  constructor(@InjectModel(City.name) private cities: Model<City>) {}

  findAll(): Promise<City[]> {
    return this.cities.find();
  }

  findOne(query: FilterQuery<City>): Promise<City> {
    return this.cities.findOne(query).collation({ locale: 'en', strength: 2 }).exec();
  }

  find(query: FilterQuery<City>, page?: number, limit?: number): Promise<City[]> {
    if (page && limit)
      return this.cities.find(query).collation({ locale: 'en', strength: 2 }).skip((page - 1) * limit).limit(limit).exec();

    return this.cities.find(query).collation({ locale: 'en', strength: 2 }).exec();
  }

}
