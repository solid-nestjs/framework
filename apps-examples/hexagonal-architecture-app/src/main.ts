import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { swaggerRecomenedOptions } from '@solid-nestjs/rest-api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for GraphQL playground
  app.enableCors();

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('SOLID NestJS API')
    .setDescription('API documentation for SOLID NestJS application')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { ...swaggerRecomenedOptions },
  });

  await app.listen(process.env.PORT || 3000);

  const port = process.env.PORT || 3000;
  console.log(`🚀 Rest-API ready at http://localhost:${port}/api`);
  console.log(`🚀 GraphQL server ready at http://localhost:${port}/graphql`);
}
bootstrap();
