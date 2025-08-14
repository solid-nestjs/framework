import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Supplier Multiplicative Relations Filter (e2e)', () => {
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

  describe('Supplier filtering by product fields (multiplicative relation)', () => {
    it('should filter suppliers by product name', async () => {
      // Create suppliers
      const createSupplier1 = `
        mutation {
          createSupplier(createInput: {
            type: "TECH",
            name: "Electronics Supplier",
            contactEmail: "electronics@supplier.com"
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
            type: "FOOD",
            name: "Food Supplier",
            contactEmail: "food@supplier.com"
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
            id: { type: "LAPTOP" },
            name: "Gaming Laptop",
            description: "High-end gaming laptop",
            price: 1500,
            stock: 10,
            supplier: { type: "${supplier1.type}", code: ${supplier1.code} }
          }) {
            id {
              type
              code
            }
            name
          }
        }
      `;

      const createProduct2 = `
        mutation {
          createProduct(createInput: {
            id: { type: "PHONE" },
            name: "Smartphone",
            description: "Latest smartphone",
            price: 800,
            stock: 20,
            supplier: { type: "${supplier1.type}", code: ${supplier1.code} }
          }) {
            id {
              type
              code
            }
            name
          }
        }
      `;

      // Create products for supplier 2
      const createProduct3 = `
        mutation {
          createProduct(createInput: {
            id: { type: "FRUIT" },
            name: "Fresh Apples",
            description: "Organic apples",
            price: 5,
            stock: 100,
            supplier: { type: "${supplier2.type}", code: ${supplier2.code} }
          }) {
            id {
              type
              code
            }
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

      // Test: Filter suppliers by product name containing "Laptop"
      const filterQuery = `
        query {
          suppliers(where: { products: { name: { _contains: "Laptop" } } }) {
            type
            code
            name
            products {
              name
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: filterQuery })
        .expect(200);

      expect(response.body.data.suppliers).toBeDefined();
      expect(Array.isArray(response.body.data.suppliers)).toBe(true);
      expect(response.body.data.suppliers.length).toBe(1);
      expect(response.body.data.suppliers[0].name).toBe('Electronics Supplier');
      
      // Verify that the supplier has the laptop product
      const hasLaptop = response.body.data.suppliers[0].products.some(
        (product: any) => product.name.includes('Laptop')
      );
      expect(hasLaptop).toBe(true);
    });

    it('should filter suppliers by product price range', async () => {
      // Create suppliers
      const createSupplier1 = `
        mutation {
          createSupplier(createInput: {
            type: "LUXURY",
            name: "Luxury Goods Supplier",
            contactEmail: "luxury@supplier.com"
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
            name: "Budget Supplier",
            contactEmail: "budget@supplier.com"
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

      // Create expensive product for supplier 1
      const createExpensiveProduct = `
        mutation {
          createProduct(createInput: {
            id: { type: "WATCH" },
            name: "Luxury Watch",
            description: "Swiss luxury watch",
            price: 5000,
            stock: 5,
            supplier: { type: "${supplier1.type}", code: ${supplier1.code} }
          }) {
            id {
              type
              code
            }
            name
            price
          }
        }
      `;

      // Create cheap product for supplier 2
      const createCheapProduct = `
        mutation {
          createProduct(createInput: {
            id: { type: "PENCIL" },
            name: "Pencil Set",
            description: "Basic pencil set",
            price: 10,
            stock: 500,
            supplier: { type: "${supplier2.type}", code: ${supplier2.code} }
          }) {
            id {
              type
              code
            }
            name
            price
          }
        }
      `;

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createExpensiveProduct })
        .expect(200);

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createCheapProduct })
        .expect(200);

      // Test: Filter suppliers with products over $1000
      const filterQuery = `
        query {
          suppliers(where: { products: { price: { _gte: 1000 } } }) {
            type
            code
            name
            products {
              name
              price
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: filterQuery })
        .expect(200);

      expect(response.body.data.suppliers).toBeDefined();
      expect(Array.isArray(response.body.data.suppliers)).toBe(true);
      expect(response.body.data.suppliers.length).toBe(1);
      expect(response.body.data.suppliers[0].name).toBe('Luxury Goods Supplier');
      
      // Verify that the supplier has expensive products
      const hasExpensiveProduct = response.body.data.suppliers[0].products.some(
        (product: any) => product.price >= 1000
      );
      expect(hasExpensiveProduct).toBe(true);
    });

    it('should filter suppliers by product stock levels', async () => {
      // Create supplier
      const createSupplier = `
        mutation {
          createSupplier(createInput: {
            type: "WAREHOUSE",
            name: "Warehouse Supplier",
            contactEmail: "warehouse@supplier.com"
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

      // Create products with different stock levels
      const createHighStockProduct = `
        mutation {
          createProduct(createInput: {
            id: { type: "BULK" },
            name: "Bulk Item",
            description: "Item in bulk",
            price: 20,
            stock: 1000,
            supplier: { type: "${supplier.type}", code: ${supplier.code} }
          }) {
            id {
              type
              code
            }
            name
            stock
          }
        }
      `;

      const createLowStockProduct = `
        mutation {
          createProduct(createInput: {
            id: { type: "RARE" },
            name: "Rare Item",
            description: "Limited stock item",
            price: 200,
            stock: 2,
            supplier: { type: "${supplier.type}", code: ${supplier.code} }
          }) {
            id {
              type
              code
            }
            name
            stock
          }
        }
      `;

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createHighStockProduct })
        .expect(200);

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createLowStockProduct })
        .expect(200);

      // Test: Filter suppliers with products having high stock (>= 500)
      const filterQuery = `
        query {
          suppliers(where: { products: { stock: { _gte: 500 } } }) {
            type
            code
            name
            products {
              name
              stock
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: filterQuery })
        .expect(200);

      expect(response.body.data.suppliers).toBeDefined();
      expect(Array.isArray(response.body.data.suppliers)).toBe(true);
      expect(response.body.data.suppliers.length).toBe(1);
      expect(response.body.data.suppliers[0].name).toBe('Warehouse Supplier');
      
      // Verify that the supplier has high stock products
      const hasHighStockProduct = response.body.data.suppliers[0].products.some(
        (product: any) => product.stock >= 500
      );
      expect(hasHighStockProduct).toBe(true);
    });

    it('should combine multiplicative product filter with direct supplier filter', async () => {
      // Create suppliers
      const createSupplier1 = `
        mutation {
          createSupplier(createInput: {
            type: "TECH",
            name: "Tech Solutions",
            contactEmail: "tech@solutions.com"
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
            type: "TECH2",
            name: "Tech Innovations",
            contactEmail: "tech@innovations.com"
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

      // Create products
      const createProduct1 = `
        mutation {
          createProduct(createInput: {
            id: { type: "DEVICE" },
            name: "Smart Device",
            description: "IoT device",
            price: 150,
            stock: 50,
            supplier: { type: "${supplier1.type}", code: ${supplier1.code} }
          }) {
            id {
              type
              code
            }
            name
          }
        }
      `;

      const createProduct2 = `
        mutation {
          createProduct(createInput: {
            id: { type: "GADGET" },
            name: "Smart Gadget",
            description: "Cool gadget",
            price: 75,
            stock: 100,
            supplier: { type: "${supplier2.type}", code: ${supplier2.code} }
          }) {
            id {
              type
              code
            }
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

      // Test: Filter suppliers with "Tech" in name AND products with "Smart" in name
      const filterQuery = `
        query {
          suppliers(where: { 
            name: { _contains: "Tech" },
            products: { name: { _contains: "Smart" } }
          }) {
            type
            code
            name
            products {
              name
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: filterQuery })
        .expect(200);

      expect(response.body.data.suppliers).toBeDefined();
      expect(Array.isArray(response.body.data.suppliers)).toBe(true);
      expect(response.body.data.suppliers.length).toBe(2);
      
      // Both suppliers should have "Tech" in name
      response.body.data.suppliers.forEach((supplier: any) => {
        expect(supplier.name).toContain('Tech');
        // Each should have at least one product with "Smart" in name
        const hasSmartProduct = supplier.products.some(
          (product: any) => product.name.includes('Smart')
        );
        expect(hasSmartProduct).toBe(true);
      });
    });

    it('should return empty array when no suppliers match product filter', async () => {
      // Create supplier
      const createSupplier = `
        mutation {
          createSupplier(createInput: {
            type: "GENERAL",
            name: "General Supplier",
            contactEmail: "general@supplier.com"
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

      // Create product
      const createProduct = `
        mutation {
          createProduct(createInput: {
            id: { type: "STANDARD" },
            name: "Standard Product",
            description: "Regular product",
            price: 50,
            stock: 20,
            supplier: { type: "${supplier.type}", code: ${supplier.code} }
          }) {
            id {
              type
              code
            }
            name
          }
        }
      `;

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createProduct })
        .expect(200);

      // Test: Filter suppliers with non-existent product name
      const filterQuery = `
        query {
          suppliers(where: { products: { name: { _contains: "NonExistent" } } }) {
            type
            code
            name
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: filterQuery })
        .expect(200);

      expect(response.body.data.suppliers).toBeDefined();
      expect(Array.isArray(response.body.data.suppliers)).toBe(true);
      expect(response.body.data.suppliers.length).toBe(0);
    });

    it('should handle pagination with multiplicative product filters', async () => {
      // Create multiple suppliers with products
      for (let i = 1; i <= 3; i++) {
        const createSupplier = `
          mutation {
            createSupplier(createInput: {
              type: "SUP${i}",
              name: "Premium Supplier ${i}",
              contactEmail: "supplier${i}@test.com"
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

        // Create premium product for each supplier
        const createProduct = `
          mutation {
            createProduct(createInput: {
              id: { type: "PREM${i}" },
              name: "Premium Product ${i}",
              description: "High quality product",
              price: ${1000 * i},
              stock: 10,
              supplier: { type: "${supplier.type}", code: ${supplier.code} }
            }) {
              id {
                type
                code
              }
              name
            }
          }
        `;

        await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: createProduct })
          .expect(200);
      }

      // Test: Paginated query for suppliers with premium products
      const paginatedQuery = `
        query {
          suppliers(
            where: { products: { name: { _contains: "Premium" } } },
            pagination: { page: 1, limit: 2 }
          ) {
            type
            code
            name
            products {
              name
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: paginatedQuery })
        .expect(200);

      expect(response.body.data.suppliers).toBeDefined();
      expect(Array.isArray(response.body.data.suppliers)).toBe(true);
      expect(response.body.data.suppliers.length).toBe(2); // Should respect limit
      
      // All returned suppliers should have premium products
      response.body.data.suppliers.forEach((supplier: any) => {
        const hasPremiumProduct = supplier.products.some(
          (product: any) => product.name.includes('Premium')
        );
        expect(hasPremiumProduct).toBe(true);
      });
    });
  });
});