import { Module } from '@nestjs/common';
import { CityScraperService } from './city-scraper.service';
import { CityScraperController } from './city-scraper.controller';

@Module({
  controllers: [CityScraperController],
  providers: [CityScraperService],
})
export class CityScraperModule {}
