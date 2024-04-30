import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CityScraperModule } from './city-scraper/city-scraper.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    CityScraperModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
