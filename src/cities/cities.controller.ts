import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { FilterQuery } from 'mongoose';
import { City } from './entities/city.entity';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  findAll() {
    return this.citiesService.findAll();
  }

  @Get('find-one')
  findOne(@Query() query: FilterQuery<City>) {
    return this.citiesService.findOne(query);
  }
  @Get('find')
  async find(@Query() query: FilterQuery<City>) {
    return await this.citiesService.find(query);
  }

  @Get('find/page/:page/limit/:limit')
  async findPaginated(@Query() query: FilterQuery<City>, @Param('page') page: number, @Param('limit') limit: number) {
    return await this.citiesService.find(query, page, limit);
  }

}
