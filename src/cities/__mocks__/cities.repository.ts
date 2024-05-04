import { FilterQuery } from 'mongoose';
import { citiesStub } from '../../../test/stubs/cities.stub';
import { City } from '../entities/city.entity';

export const CitiesRepository = jest.fn().mockImplementation(() => ({
  findAll: jest.fn().mockResolvedValue(citiesStub()),
  findOne: jest.fn().mockResolvedValue(citiesStub()[0]),
  find: jest.fn().mockImplementation((query?: FilterQuery<City>) => {
    return query
      ? citiesStub().filter((city) => city.name === query.name)
      : citiesStub();
  }),
}));
