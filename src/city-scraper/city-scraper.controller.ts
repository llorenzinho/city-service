import { Controller, Get } from '@nestjs/common';
import { CityScraperService } from './city-scraper.service';

@Controller('scrape')
export class CityScraperController {
  constructor(private readonly cityScraperService: CityScraperService) {}

  @Get()
  async scrape() {
    this.cityScraperService.scrape();
    return "ok";
  }
}
