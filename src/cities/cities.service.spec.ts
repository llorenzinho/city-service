import { Test, TestingModule } from '@nestjs/testing';
import { CitiesService } from './cities.service';
import { CitiesRepository } from './cities.repository';
import { CityScraperService } from './city-scraper.service';
import { getModelToken } from '@nestjs/mongoose';
import { City } from './entities/city.entity';
import { ConfigService } from '@nestjs/config';
import { citiesStub } from '../../test/stubs/cities.stub';

jest.mock('./cities.repository');

describe('CitiesService', () => {
  let service: CitiesService;
  let repository: CitiesRepository;

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
    repository = module.get<CitiesRepository>(CitiesRepository);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    describe('when findAll is called', () => {
      beforeEach(async () => {
        await service.findAll();
      });

      it('should have been called', async () => {
        expect(repository.findAll).toHaveBeenCalled();
      });

      it('should return an array of cities', async () => {
        expect(await service.findAll()).toEqual(citiesStub());
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne is called', () => {
      beforeEach(async () => {
        await service.findOne({ region: citiesStub()[0].region });
      });

      it('should have been called', async () => {
        expect(repository.findOne).toHaveBeenCalledWith({
          region: citiesStub()[0].region,
        });
      });

      it('should return an array of cities', async () => {
        expect(
          await service.findOne({ region: citiesStub()[0].region }),
        ).toEqual(citiesStub()[0]);
      });
    });
  });

  describe('find', () => {
    describe('when find is called', () => {
      beforeEach(async () => {
        await service.find();
      });

      it('repo should have been called', async () => {
        expect(repository.find).toHaveBeenCalled();
      });

      it('should return all cities with no filters', async () => {
        expect(await service.find()).toEqual(citiesStub());
      });

      it('should return filtered cities', async () => {
        expect(await service.find({ name: citiesStub()[0].name })).toEqual([
          citiesStub()[0],
        ]);
      });
    });
  });
});
