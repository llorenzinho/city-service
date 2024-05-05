import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

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

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);
  const config: ConfigService = app.get(ConfigService);

  setupDoc(app);

  const port: number = config.get<number>('app.port');
  await app.listen(port);
}
bootstrap();
