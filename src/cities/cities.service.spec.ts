import { Test, TestingModule } from '@nestjs/testing';
import { CitiesService } from './cities.service';
import { CitiesRepository } from './cities.repository';
import { CityScraperService } from './city-scraper.service';
import { getModelToken } from '@nestjs/mongoose';
import { City } from './entities/city.entity';
import { ConfigService } from '@nestjs/config';

describe('CitiesService', () => {
  let service: CitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: getModelToken(City.name), useValue: jest.fn() },
        CitiesService,
        CitiesRepository,
        CityScraperService,
        ConfigService,
      ],
    }).compile();

    service = module.get<CitiesService>(CitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
