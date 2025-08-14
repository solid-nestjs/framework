import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('GroupBy Functionality (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useFactory({
        factory: async () => {
          const { DataSource } = await import('typeorm');
          const dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            dropSchema: true,
            entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: false,
          });
          await dataSource.initialize();
          return dataSource;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Product GroupBy functionality', () => {
    it('should group products by supplier with count aggregate', async () => {
      // Create suppliers
      const createSupplier1 = `
        mutation {
          createSupplier(createInput: {
            type: "TECH",
            name: "Tech Supplier",
            contactEmail: "tech@supplier.com"
          }) {
            type
            code
            name
          }
        }
      `;

      const createSupplier2 = `
        mutation {
          createSupplier(createInput: {
            type: "OFFICE",
            name: "Office Supplier",
            contactEmail: "office@supplier.com"
          }) {
            type
            code
            name
          }
        }
      `;

      const supplier1Response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createSupplier1 })
        .expect(200);

      const supplier2Response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createSupplier2 })
        .expect(200);

      const supplier1 = supplier1Response.body.data.createSupplier;
      const supplier2 = supplier2Response.body.data.createSupplier;

      // Create products for supplier 1
      const createProduct1 = `
        mutation {
          createProduct(createInput: {
            id: { type: "LAPTOP1" },
            name: "Gaming Laptop",
            description: "High-end gaming laptop",
            price: 1500,
            stock: 10,
            supplier: { type: "${supplier1.type}", code: ${supplier1.code} }
          }) {
            id { type code }
            name
          }
        }
      `;

      const createProduct2 = `
        mutation {
          createProduct(createInput: {
            id: { type: "LAPTOP2" },
            name: "Business Laptop",
            description: "Professional laptop",
            price: 1200,
            stock: 15,
            supplier: { type: "${supplier1.type}", code: ${supplier1.code} }
          }) {
            id { type code }
            name
          }
        }
      `;

      // Create products for supplier 2
      const createProduct3 = `
        mutation {
          createProduct(createInput: {
            id: { type: "CHAIR" },
            name: "Office Chair",
            description: "Ergonomic office chair",
            price: 300,
            stock: 25,
            supplier: { type: "${supplier2.type}", code: ${supplier2.code} }
          }) {
            id { type code }
            name
          }
        }
      `;

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createProduct1 })
        .expect(200);

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createProduct2 })
        .expect(200);

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createProduct3 })
        .expect(200);

      // Test: Group products by supplier with count aggregate
      const groupByQuery = `
        query {
          productsGrouped(
            groupBy: {
              fields: { supplier: { name: true } },
              aggregates: [
                { field: "type", function: COUNT, alias: "totalProducts" },
                { field: "price", function: AVG, alias: "avgPrice" }
              ]
            }
          ) {
            groups {
              key
              aggregates
              count
            }
            pagination {
              total
              count
              limit
              page
              pageCount
              hasNextPage
              hasPreviousPage
            }
            totalItems
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: groupByQuery });
      
      if (response.status !== 200) {
        console.log('GraphQL Error:', JSON.stringify(response.body, null, 2));
      }
      
      expect(response.status).toBe(200);

      // Verify the response structure
      expect(response.body.data.productsGrouped).toBeDefined();
      expect(response.body.data.productsGrouped.groups).toBeDefined();
      expect(Array.isArray(response.body.data.productsGrouped.groups)).toBe(true);
      expect(response.body.data.productsGrouped.groups.length).toBe(2);

      // Verify group structure
      response.body.data.productsGrouped.groups.forEach((group: any) => {
        expect(group.key).toBeDefined();
        expect(typeof group.key).toBe('string');
        expect(group.aggregates).toBeDefined();
        expect(typeof group.aggregates).toBe('string');
        expect(typeof group.count).toBe('number');

        // Parse JSON strings to verify content
        const key = JSON.parse(group.key);
        const aggregates = JSON.parse(group.aggregates);

        expect(key).toHaveProperty('supplier_name');
        expect(aggregates).toHaveProperty('totalProducts');
        expect(aggregates).toHaveProperty('avgPrice');
      });

      // Verify pagination info
      expect(response.body.data.productsGrouped.pagination).toBeDefined();
      expect(response.body.data.productsGrouped.pagination.total).toBe(2);
      expect(response.body.data.productsGrouped.pagination.page).toBe(1);
      expect(response.body.data.productsGrouped.pagination.limit).toBe(10);
    });

    it('should handle empty results for grouped queries', async () => {
      // Test: Group query with no data
      const groupByQuery = `
        query {
          productsGrouped(
            groupBy: {
              fields: { name: true },
              aggregates: [
                { field: "type", function: COUNT, alias: "totalProducts" }
              ]
            }
          ) {
            groups {
              key
              aggregates
              count
            }
            pagination {
              total
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: groupByQuery });
      
      if (response.status !== 200) {
        console.log('GraphQL Error:', JSON.stringify(response.body, null, 2));
      }
      
      expect(response.status).toBe(200);

      expect(response.body.data.productsGrouped).toBeDefined();
      expect(response.body.data.productsGrouped.groups).toBeDefined();
      expect(Array.isArray(response.body.data.productsGrouped.groups)).toBe(true);
      expect(response.body.data.productsGrouped.groups.length).toBe(0);
      expect(response.body.data.productsGrouped.pagination).toBeDefined();
      expect(response.body.data.productsGrouped.pagination.total).toBe(0);
    });
  });
});