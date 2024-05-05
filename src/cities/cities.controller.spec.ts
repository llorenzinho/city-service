import { Test, TestingModule } from '@nestjs/testing';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';
import { CitiesRepository } from './cities.repository';
import { CityScraperService } from './scraper/city-scraper.service';
import { getModelToken } from '@nestjs/mongoose';
import { City } from './entities/city.entity';
import { ConfigService } from '@nestjs/config';

describe('CitiesController', () => {
  let controller: CitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitiesController],
      providers: [
        CitiesService,
        CitiesRepository,
        CityScraperService,
        ConfigService,
        { provide: getModelToken(City.name), useValue: jest.fn() },
      ],
    }).compile();

    controller = module.get<CitiesController>(CitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
