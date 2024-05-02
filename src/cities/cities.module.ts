import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { CitySchema } from './entities/city.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { CitiesRepository } from './cities.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'City', schema: CitySchema },
    ])
  ],
  controllers: [CitiesController],
  providers: [CitiesService, CitiesRepository],
})
export class CitiesModule {}
