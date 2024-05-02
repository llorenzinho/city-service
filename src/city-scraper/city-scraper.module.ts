import { Module } from '@nestjs/common';
import { CityScraperService } from './city-scraper.service';
import { CityScraperController } from './city-scraper.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { City, CitySchema } from 'src/cities/entities/city.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: City.name, schema: CitySchema }]),
  ],
  controllers: [CityScraperController],
  providers: [CityScraperService],
})
export class CityScraperModule {}
