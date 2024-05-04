import { Injectable, Logger } from '@nestjs/common';
import { City } from './entities/city.entity';
import { FilterQuery } from 'mongoose';
import { CitiesRepository } from './cities.repository';
import { CityScraperService } from './city-scraper.service';

@Injectable()
export class CitiesService {
  private readonly logger = new Logger(CitiesService.name);
  constructor(
    private readonly cityRepo: CitiesRepository,
    private readonly cityScraper: CityScraperService,
  ) {}

  async scrape() {
    this.cityScraper.scrape();
    return { message: 'scraping started. Will run in background' };
  }

  findAll(): Promise<City[]> {
    return this.cityRepo.findAll();
  }

  findOne(query: FilterQuery<City>): Promise<City> {
    return this.cityRepo.findOne(query);
  }

  find(
    query?: FilterQuery<City>,
    page?: number,
    limit?: number,
  ): Promise<City[]> {
    return this.cityRepo.find(query, page, limit);
  }
}
