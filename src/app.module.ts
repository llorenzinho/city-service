import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CityScraperModule } from './city-scraper/city-scraper.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: false,
      load: [configuration],
    }),
    CityScraperModule,
    MongooseModule.forRootAsync(
      {
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          uri: `mongodb://${configService.get<string>('database.host')}:${configService.get<string>('database.port')}`,
          auth: {
            username: configService.get<string>('database.username'),
            password: configService.get<string>('database.password'),
          },
        }),
        inject: [ConfigService],
      }
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
