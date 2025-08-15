import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
import { DatabaseInitializerService } from './database-initializer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: [
        '.env',
        `.env.${process.env.NODE_ENV || 'development'}`,
      ],
      load: [databaseConfig],
    }),
  ],
  providers: [DatabaseInitializerService],
})
export class AppConfigModule {}