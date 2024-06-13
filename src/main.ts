import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('Payments Microservice');

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(envs.PORT);

  logger.log(`Payments Microservice is on port ${envs.PORT}`);
}
bootstrap();
