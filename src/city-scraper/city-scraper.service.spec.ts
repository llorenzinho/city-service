import { Test, TestingModule } from '@nestjs/testing';
import { CityScraperService } from './city-scraper.service';

describe('CityScraperService', () => {
  let service: CityScraperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CityScraperService],
    }).compile();

    service = module.get<CityScraperService>(CityScraperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
