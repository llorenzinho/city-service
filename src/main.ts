import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication, NestApplicationOptions } from '@nestjs/common';

function setupDoc(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('City service API')
    .setDescription('API endpoints to scrape and retrieve data')
    .setVersion('1.0')
    .addTag('cities')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs/api', app, document);
}

function getLogLevel(): NestApplicationOptions {
  const logLevel: string = process.env.LOG_LEVEL || 'development';
  return {
    logger: logLevel === 'development' ? ['log', 'debug', 'error', 'verbose', 'warn'] : ['error', 'warn', 'log'],
  };
}

async function bootstrap() {
  const options:NestApplicationOptions = {...getLogLevel()};
  const app: INestApplication = await NestFactory.create(AppModule, options);
  const config: ConfigService = app.get(ConfigService);

  console.log('ciao')
  setupDoc(app);

  const port: number = config.get<number>('app.port');
  await app.listen(port);
}
bootstrap();
