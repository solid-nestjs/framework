import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for GraphQL playground
  app.enableCors();

    // Enable validation
  app.useGlobalPipes(new ValidationPipe());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Products API')
    .setDescription('The products API description')
    .setVersion('1.0')
    .addTag('products')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000);
  
  console.log('🚀 Rest-API ready at http://localhost:3000/api');
  console.log('🚀 GraphQL server ready at http://localhost:3000/graphql');
}

bootstrap();
