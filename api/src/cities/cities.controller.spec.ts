import { Test, TestingModule } from '@nestjs/testing';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';
import { CitiesRepository } from './cities.repository';
import { ScraperService } from './scraper/scraper.service';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { City } from './entities/city.entity';
import { HttpModule } from '@nestjs/axios';

describe('CitiesController', () => {
  let controller: CitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [CitiesController],
      providers: [
        CitiesService,
        CitiesRepository,
        ScraperService,
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
