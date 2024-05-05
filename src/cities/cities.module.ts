import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { CitySchema } from './entities/city.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { CitiesRepository } from './cities.repository';
import { CityScraperService } from './scraper/city-scraper.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'City', schema: CitySchema }])],
  controllers: [CitiesController],
  providers: [
    CitiesService,
    CitiesRepository,
    CityScraperService,
    ConfigService,
  ],
})
export class CitiesModule {}
