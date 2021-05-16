import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'cars_queue',
        noAck: false,
        prefetchCount: 1,
        queueOptions: {
          durable: false,
        },
      },
    },
  );

  app.listen(() => {
    console.log('Car service is running');
  });
}
bootstrap();
