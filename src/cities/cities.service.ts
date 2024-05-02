import { Injectable, Logger } from '@nestjs/common';
import { City } from './entities/city.entity';
import { FilterQuery } from 'mongoose';
import { CitiesRepository } from './cities.repository';

@Injectable()
export class CitiesService {
  private readonly logger = new Logger(CitiesService.name);
  constructor(private readonly cityRepo: CitiesRepository) {}

  findAll(): Promise<City[]> {
    return this.cityRepo.findAll();
  }

  findOne(query: FilterQuery<City>): Promise<City> {
    return this.cityRepo.findOne(query);
  }

  find(query: FilterQuery<City>, page?: number, limit?: number): Promise<City[]> {
    return this.cityRepo.find(query, page, limit);
  }
}
