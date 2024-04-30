import { Test, TestingModule } from '@nestjs/testing';
import { CityScraperController } from './city-scraper.controller';
import { CityScraperService } from './city-scraper.service';

describe('CityScraperController', () => {
  let controller: CityScraperController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CityScraperController],
      providers: [CityScraperService],
    }).compile();

    controller = module.get<CityScraperController>(CityScraperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
