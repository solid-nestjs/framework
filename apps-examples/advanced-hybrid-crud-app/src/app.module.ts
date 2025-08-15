import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { SeederService } from '@solid-nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { Supplier } from './suppliers/entities/supplier.entity';
import { SuppliersModule } from './suppliers/suppliers.module';
import { InvoicesModule } from './invoices/invoices.module';
import { Invoice } from './invoices/entities/invoice.entity';
import { InvoiceDetail } from './invoices/entities/invoice-detail.entity';
import { ClientsModule } from './clients/clients.module';
import { Client } from './clients/entities/client.entity';
import { SuppliersSeeder, ProductsSeeder, ClientsSeeder, InvoicesSeeder } from './seeders';
import { AppConfigModule } from './config/config.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('database');
        
        // For SQL Server, ensure database exists before connecting
        if (config?.type === 'mssql') {
          // Import the helper function locally to avoid import issues
          const { ensureSqlServerDatabase } = await import('./config/database-initializer.service');
          await ensureSqlServerDatabase(config);
        }
        
        return config;
      },
      inject: [ConfigService],
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        playground: configService.get('GRAPHQL_PLAYGROUND', 'true') === 'true' ? false : false,
        introspection: configService.get('GRAPHQL_INTROSPECTION', 'true') === 'true',
        sortSchema: true,
        plugins: configService.get('GRAPHQL_PLAYGROUND', 'true') === 'true' 
          ? [ApolloServerPluginLandingPageLocalDefault()] 
          : [],
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
    SuppliersModule,
    InvoicesModule,
    ClientsModule,
  ],
  providers: [SeederService, SuppliersSeeder, ProductsSeeder, ClientsSeeder, InvoicesSeeder],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(
    private readonly dataSource: DataSource,
    private readonly seederService: SeederService,
    private readonly suppliersSeeder: SuppliersSeeder,
    private readonly productsSeeder: ProductsSeeder,
    private readonly clientsSeeder: ClientsSeeder,
    private readonly invoicesSeeder: InvoicesSeeder,
  ) {}

  async onApplicationBootstrap() {
    // Skip seeders during testing to avoid interference with E2E tests
    const isTestEnvironment = process.env.NODE_ENV === 'test' || 
                             process.env.JEST_WORKER_ID !== undefined ||
                             global.process?.env?.npm_lifecycle_event?.includes('test');
    
    if (isTestEnvironment) {
      return;
    }

    // Wait a bit to ensure TypeORM has finished creating tables
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify that the DataSource is properly initialized
    if (!this.dataSource.isInitialized) {
      console.warn('⚠️ DataSource is not initialized yet, waiting...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const seeders = [
      this.suppliersSeeder,
      this.productsSeeder,
      this.clientsSeeder,
      this.invoicesSeeder,
    ];
    
    try {
      // Check if any seeder needs to run before running them
      const shouldRunSeeders = await this.seederService.shouldRunAnySeeder(
        this.dataSource,
        seeders,
      );

      if (shouldRunSeeders) {
        await this.seederService.runSeeders(this.dataSource, seeders);
      }
    } catch (error) {
      console.error('⚠️ Error during seeding, tables might not be ready yet:', error.message);
    }
  }
}
