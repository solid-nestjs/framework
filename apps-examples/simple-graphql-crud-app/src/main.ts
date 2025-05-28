import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for GraphQL playground
  app.enableCors();
  
  await app.listen(3000);
  
  console.log('🚀 GraphQL server ready at http://localhost:3000/graphql');
}

bootstrap();
