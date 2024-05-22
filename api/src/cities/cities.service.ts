import { Injectable, Logger } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { CitiesRepository } from './cities.repository';
import { ScraperService } from './scraper/scraper.service';
import { City } from './entities/city.entity';

@Injectable()
export class CitiesService {
  private readonly logger = new Logger(CitiesService.name);
  constructor(
    private readonly cityRepo: CitiesRepository,
    private readonly cityScraper: ScraperService,
  ) {}

  private async scrapeRegion(region: string) {
    const cities = await this.cityScraper.scrape(region);
    await this.cityRepo.deleteMany({ region });
    await this.cityRepo.bulkInsert(cities);
  }

  async scrape() {
    const regions = await this.cityScraper.getRegions();
    const errRegions: string[] = [];
    for (const region of regions) {
      try {
        await this.scrapeRegion(region);
      } catch (error) {
        this.logger.error(error);
        errRegions.push(region);
      }
    }
    this.logger.debug(`Scraped ${regions.length - errRegions.length} regions`);
    this.logger.debug(`Failed scraping ${errRegions.length} regions`);
    if (errRegions.length > 0) {
      this.logger.debug(`Failed regions: ${errRegions.join(', ')}`);
      do {
        const region = errRegions.shift();
        // sleep
        this.logger.debug(`Retrying ${region}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        try {
          await this.scrapeRegion(region);
        } catch (error) {
          this.logger.error(error);
          errRegions.push(region);
        }
      } while (errRegions.length > 0);
    }
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
