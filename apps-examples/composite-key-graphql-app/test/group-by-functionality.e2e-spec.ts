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
        expect(typeof group.key).toBe('object');
        expect(group.aggregates).toBeDefined();
        expect(typeof group.aggregates).toBe('object');

        // Verify content directly from objects
        const key = group.key;
        const aggregates = group.aggregates;

        expect(key).toHaveProperty('supplier_name');
        expect(aggregates).toHaveProperty('totalProducts');
        expect(aggregates).toHaveProperty('avgPrice');
      });

      // Verify pagination info
      expect(response.body.data.productsGrouped.pagination).toBeDefined();
      expect(response.body.data.productsGrouped.pagination.total).toBe(2);
      expect(response.body.data.productsGrouped.pagination.page).toBe(1);
      expect(response.body.data.productsGrouped.pagination.limit).toBeNull(); // No pagination specified, so no limit
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

    it('should filter products before grouping via GraphQL', async () => {
      // Create suppliers
      const createSupplier1 = `
        mutation {
          createSupplier(createInput: {
            type: "PREMIUM",
            name: "Premium Composite Supplier",
            contactEmail: "premium@composite.com"
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
            type: "BUDGET",
            name: "Budget Composite Supplier", 
            contactEmail: "budget@composite.com"
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

      // Create products with different price ranges
      const products = [
        { id: 'EXPENSIVE1', name: 'Expensive Product 1', price: 1500, stock: 3, supplier: supplier1 },
        { id: 'EXPENSIVE2', name: 'Expensive Product 2', price: 1200, stock: 5, supplier: supplier1 },
        { id: 'CHEAP1', name: 'Cheap Product 1', price: 50, stock: 20, supplier: supplier2 },
        { id: 'CHEAP2', name: 'Cheap Product 2', price: 75, stock: 15, supplier: supplier2 },
        { id: 'MID1', name: 'Mid Product 1', price: 300, stock: 10, supplier: supplier1 }
      ];

      for (const product of products) {
        const createProduct = `
          mutation {
            createProduct(createInput: {
              id: { type: "${product.id}" },
              name: "${product.name}",
              description: "Filter test product",
              price: ${product.price},
              stock: ${product.stock},
              supplier: { type: "${product.supplier.type}", code: ${product.supplier.code} }
            }) {
              id { type code }
            }
          }
        `;

        await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: createProduct })
          .expect(200);
      }

      // Test: Group by supplier, filter products with price >= 250
      const groupByQuery = `
        query {
          productsGrouped(
            where: { price: { _gte: 250 } },
            groupBy: {
              fields: { supplier: { name: true } },
              aggregates: [
                { field: "type", function: COUNT, alias: "productCount" },
                { field: "price", function: AVG, alias: "avgPrice" }
              ]
            }
          ) {
            groups {
              key
              aggregates
            }
            pagination {
              total
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: groupByQuery })
        .expect(200);

      // Should only have Premium supplier group (3 products >= 250)
      expect(response.body.data.productsGrouped.groups.length).toBe(1);
      expect(response.body.data.productsGrouped.pagination.total).toBe(1);
      
      const group = response.body.data.productsGrouped.groups[0];
      const key = group.key;
      const aggregates = group.aggregates;
      
      expect(key.supplier_name).toBe('Premium Composite Supplier');
      expect(aggregates.productCount).toBe(3); // EXPENSIVE1, EXPENSIVE2, MID1
      expect(aggregates.avgPrice).toBe(1000); // (1500 + 1200 + 300) / 3
    });

    it('should order grouped results via GraphQL', async () => {
      // Create suppliers with names for testing ordering
      const suppliers = [
        { type: 'ZEBRA', name: 'Zebra Composite Co' },
        { type: 'ALPHA', name: 'Alpha Composite Inc' },
        { type: 'BETA', name: 'Beta Composite Ltd' }
      ];

      const supplierData: any[] = [];

      for (const supplier of suppliers) {
        const createSupplier = `
          mutation {
            createSupplier(createInput: {
              type: "${supplier.type}",
              name: "${supplier.name}",
              contactEmail: "${supplier.name.toLowerCase().replace(/[^a-z]/g, '')}@test.com"
            }) {
              type
              code
              name
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: createSupplier })
          .expect(200);

        supplierData.push(response.body.data.createSupplier);
      }

      // Create one product for each supplier
      for (let i = 0; i < supplierData.length; i++) {
        const supplier = supplierData[i];
        const createProduct = `
          mutation {
            createProduct(createInput: {
              id: { type: "PROD${i + 1}" },
              name: "Composite Product ${i + 1}",
              description: "Order test product",
              price: ${(i + 1) * 100},
              stock: 10,
              supplier: { type: "${supplier.type}", code: ${supplier.code} }
            }) {
              id { type code }
            }
          }
        `;

        await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: createProduct })
          .expect(200);
      }

      // Test: Group by supplier, order by supplier name ASC
      const groupByQuery = `
        query {
          productsGrouped(
            orderBy: { supplier: { name: ASC } },
            groupBy: {
              fields: { supplier: { name: true } },
              aggregates: [
                { field: "price", function: SUM, alias: "totalPrice" }
              ]
            }
          ) {
            groups {
              key
              aggregates
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: groupByQuery })
        .expect(200);

      expect(response.body.data.productsGrouped.groups.length).toBe(3);
      
      // Verify alphabetical ordering: Alpha, Beta, Zebra
      const groupNames = response.body.data.productsGrouped.groups.map((group: any) => group.key.supplier_name);
      expect(groupNames).toEqual(['Alpha Composite Inc', 'Beta Composite Ltd', 'Zebra Composite Co']);
    });

    it('should combine filtering and ordering via GraphQL', async () => {
      // Create supplier
      const createSupplier = `
        mutation {
          createSupplier(createInput: {
            type: "COMBO",
            name: "Combo Test Composite Supplier",
            contactEmail: "combo@composite.com"
          }) {
            type
            code
            name
          }
        }
      `;

      const supplierResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createSupplier })
        .expect(200);

      const supplier = supplierResponse.body.data.createSupplier;

      // Create products with varying stock levels and names for testing
      const products = [
        { id: 'PROD_A_LOW', name: 'Composite A Low', stock: 5, price: 100 },
        { id: 'PROD_Z_HIGH', name: 'Composite Z High', stock: 30, price: 100 },
        { id: 'PROD_B_LOW', name: 'Composite B Low', stock: 4, price: 100 },
        { id: 'PROD_Y_HIGH', name: 'Composite Y High', stock: 25, price: 100 },
        { id: 'PROD_M_MED', name: 'Composite M Med', stock: 15, price: 100 }
      ];

      for (const product of products) {
        const createProduct = `
          mutation {
            createProduct(createInput: {
              id: { type: "${product.id}" },
              name: "${product.name}",
              description: "Combo filter order test",
              price: ${product.price},
              stock: ${product.stock},
              supplier: { type: "${supplier.type}", code: ${supplier.code} }
            }) {
              id { type code }
            }
          }
        `;

        await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: createProduct })
          .expect(200);
      }

      // Test: Group by name, filter stock >= 10, order by name DESC
      const groupByQuery = `
        query {
          productsGrouped(
            where: { stock: { _gte: 10 } },
            orderBy: { name: DESC },
            groupBy: {
              fields: { name: true },
              aggregates: [
                { field: "stock", function: MIN, alias: "minStock" }
              ]
            }
          ) {
            groups {
              key
              aggregates
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: groupByQuery })
        .expect(200);

      expect(response.body.data.productsGrouped.groups.length).toBe(3); // Products with stock >= 10
      
      // Verify DESC ordering: Z, Y, M (excluding A and B which have stock < 10)
      const groupNames = response.body.data.productsGrouped.groups.map((group: any) => group.key.name);
      expect(groupNames).toEqual(['Composite Z High', 'Composite Y High', 'Composite M Med']);
    });
  });
});