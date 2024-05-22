import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CitiesRepository } from './cities.repository';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CitySchema } from './entities/city.entity';
import { ScraperService } from './scraper/scraper.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'City', schema: CitySchema }]),
    HttpModule,
  ],
  controllers: [CitiesController],
  providers: [CitiesService, CitiesRepository, ScraperService, ConfigService],
})
export class CitiesModule {}
