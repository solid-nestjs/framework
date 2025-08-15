import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { createTestDataSource, cleanupTestData, destroyTestDataSource } from './test-database.config';

describe('Multiplicative Relations Filter (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let supplier: any;
  let client: any;
  let product1: any;
  let product2: any;
  let invoice1: any;
  let invoice2: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useFactory({
        factory: async () => {
          return await createTestDataSource();
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
    
    // Clean up data before each test (SQL Server only - SQLite creates fresh DB)
    if (process.env.DB_TYPE === 'mssql') {
      await cleanupTestData(dataSource);
    }

    // Setup test data
    await setupTestData();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });
  
  afterAll(async () => {
    // Cleanup shared SQL Server connection if exists
    await destroyTestDataSource();
  });

  async function setupTestData() {
    // Create supplier
    const supplierResponse = await request(app.getHttpServer())
      .post('/suppliers')
      .send({
        name: 'Test Supplier',
        contactEmail: 'test@supplier.com',
      })
      .expect(201);
    supplier = supplierResponse.body;

    // Create client
    const clientResponse = await request(app.getHttpServer())
      .post('/clients')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      })
      .expect(201);
    client = clientResponse.body;

    // Create products
    const product1Response = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Expensive Product',
        description: 'An expensive product',
        price: 500.0,
        stock: 10,
        supplier: { id: supplier.id },
      })
      .expect(201);
    product1 = product1Response.body;

    const product2Response = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Cheap Product',
        description: 'A cheap product',
        price: 25.0,
        stock: 100,
        supplier: { id: supplier.id },
      })
      .expect(201);
    product2 = product2Response.body;

    // Create invoices
    const invoice1Response = await request(app.getHttpServer())
      .post('/invoices')
      .send({
        invoiceNumber: 'INV-001',
        status: 'pending',
        client: { id: client.id },
        details: [
          {
            productId: product1.id,
            quantity: 2,
            unitPrice: 500.0,
          },
          {
            productId: product2.id,
            quantity: 5,
            unitPrice: 25.0,
          },
        ],
      })
      .expect(201);
    invoice1 = invoice1Response.body;

    const invoice2Response = await request(app.getHttpServer())
      .post('/invoices')
      .send({
        invoiceNumber: 'INV-002',
        status: 'paid',
        client: { id: client.id },
        details: [
          {
            productId: product2.id,
            quantity: 10,
            unitPrice: 25.0,
          },
        ],
      })
      .expect(201);
    invoice2 = invoice2Response.body;
  }

  describe('GraphQL Multiplicative Relation Filtering', () => {
    it('should filter invoices by invoice details productId', async () => {
      const filterQuery = `
        query {
          invoices(where: { details: { productId: "${product1.id}" } }) {
            id
            invoiceNumber
            details {
              id
              productId
              quantity
              unitPrice
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: filterQuery })
        .expect(200);

      expect(response.body.data.invoices).toBeDefined();
      expect(Array.isArray(response.body.data.invoices)).toBe(true);
      expect(response.body.data.invoices.length).toBe(1);
      expect(response.body.data.invoices[0].invoiceNumber).toBe('INV-001');

      // Verify that the invoice contains the expensive product
      const hasExpensiveProduct = response.body.data.invoices[0].details.some(
        (detail: any) => detail.productId === product1.id,
      );
      expect(hasExpensiveProduct).toBe(true);
    });

    it('should filter invoices by invoice details quantity', async () => {
      const filterQuery = `
        query {
          invoices(where: { details: { quantity: { _gte: 10 } } }) {
            id
            invoiceNumber
            details {
              id
              quantity
              productId
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: filterQuery })
        .expect(200);

      expect(response.body.data.invoices).toBeDefined();
      expect(Array.isArray(response.body.data.invoices)).toBe(true);
      expect(response.body.data.invoices.length).toBe(1);
      expect(response.body.data.invoices[0].invoiceNumber).toBe('INV-002');

      // Verify that the invoice contains details with quantity >= 10
      const hasHighQuantity = response.body.data.invoices[0].details.some(
        (detail: any) => detail.quantity >= 10,
      );
      expect(hasHighQuantity).toBe(true);
    });

    it('should filter invoices by invoice details unitPrice range', async () => {
      const filterQuery = `
        query {
          invoices(where: { details: { unitPrice: { _gte: 100 } } }) {
            id
            invoiceNumber
            details {
              id
              unitPrice
              productId
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: filterQuery })
        .expect(200);

      expect(response.body.data.invoices).toBeDefined();
      expect(Array.isArray(response.body.data.invoices)).toBe(true);
      expect(response.body.data.invoices.length).toBe(1);
      expect(response.body.data.invoices[0].invoiceNumber).toBe('INV-001');

      // Verify that the invoice contains details with high unit price
      const hasHighPrice = response.body.data.invoices[0].details.some(
        (detail: any) => detail.unitPrice >= 100,
      );
      expect(hasHighPrice).toBe(true);
    });

    it('should filter invoices by nested product properties through details', async () => {
      const filterQuery = `
        query {
          invoices(where: { details: { product: { name: { _contains: "Expensive" } } } }) {
            id
            invoiceNumber
            details {
              id
              product {
                id
                name
                price
              }
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: filterQuery })
        .expect(200);

      expect(response.body.data.invoices).toBeDefined();
      expect(Array.isArray(response.body.data.invoices)).toBe(true);
      expect(response.body.data.invoices.length).toBe(1);
      expect(response.body.data.invoices[0].invoiceNumber).toBe('INV-001');

      // Verify that the invoice contains the expensive product
      const hasExpensiveProduct = response.body.data.invoices[0].details.some(
        (detail: any) => detail.product.name.includes('Expensive'),
      );
      expect(hasExpensiveProduct).toBe(true);
    });

    it('should handle complex nested AND conditions with multiplicative relations', async () => {
      const filterQuery = `
        query {
          invoices(where: { 
            _and: [
              { details: { quantity: { _gte: 2 } } },
              { details: { unitPrice: { _gte: 100 } } },
              { status: "pending" }
            ]
          }) {
            id
            invoiceNumber
            status
            details {
              id
              quantity
              unitPrice
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: filterQuery })
        .expect(200);

      expect(response.body.data.invoices).toBeDefined();
      expect(Array.isArray(response.body.data.invoices)).toBe(true);
      expect(response.body.data.invoices.length).toBe(1);
      expect(response.body.data.invoices[0].invoiceNumber).toBe('INV-001');
      expect(response.body.data.invoices[0].status).toBe('pending');
    });

    it('should handle OR conditions with multiplicative relations', async () => {
      const filterQuery = `
        query {
          invoices(where: { 
            _or: [
              { details: { quantity: { _gte: 10 } } },
              { details: { unitPrice: { _gte: 400 } } }
            ]
          }) {
            id
            invoiceNumber
            details {
              id
              quantity
              unitPrice
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: filterQuery })
        .expect(200);

      expect(response.body.data.invoices).toBeDefined();
      expect(Array.isArray(response.body.data.invoices)).toBe(true);
      expect(response.body.data.invoices.length).toBe(2); // Both invoices should match
    });

    it('should work with pagination when filtering by multiplicative relations', async () => {
      // Create additional invoices for pagination test
      await request(app.getHttpServer())
        .post('/invoices')
        .send({
          invoiceNumber: 'INV-003',
          status: 'cancelled',
          client: { id: client.id },
          details: [
            {
              productId: product1.id,
              quantity: 1,
              unitPrice: 500.0,
            },
            {
              productId: product2.id,
              quantity: 2,
              unitPrice: 25.0,
            },
          ],
        })
        .expect(201);

      const paginatedQuery = `
        query {
          invoices(
            where: { details: { productId: "${product1.id}" } },
            pagination: { page: 1, limit: 1 }
          ) {
            id
            invoiceNumber
            details {
              productId
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: paginatedQuery })
        .expect(200);

      expect(response.body.data.invoices).toBeDefined();
      expect(Array.isArray(response.body.data.invoices)).toBe(true);
      expect(response.body.data.invoices.length).toBe(1); // Should respect pagination limit

      // Verify the returned invoice has the expected product
      const hasExpectedProduct = response.body.data.invoices[0].details.some(
        (detail: any) => detail.productId === product1.id,
      );
      expect(hasExpectedProduct).toBe(true);

      // Verify the returned invoice has the expected product 2
      const hasExpectedProduct2 = response.body.data.invoices[0].details.some(
        (detail: any) => detail.productId === product2.id,
      );
      expect(hasExpectedProduct2).toBe(true);
    });

    it('should return empty array when no invoices match multiplicative filter', async () => {
      const nonExistentProductId = '00000000-0000-0000-0000-000000000000'; // Use valid UUID format
      const filterQuery = `
        query {
          invoices(where: { details: { productId: "${nonExistentProductId}" } }) {
            id
            invoiceNumber
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: filterQuery })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.invoices).toBeDefined();
      expect(Array.isArray(response.body.data.invoices)).toBe(true);
      expect(response.body.data.invoices.length).toBe(0);
    });

    it('should throw error when trying to order by multiplicative relation fields', async () => {
      const orderQuery = `
        query {
          invoices(orderBy: [{ details: { quantity: ASC } }]) {
            id
            invoiceNumber
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: orderQuery });

      // Should return an error
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Mixed Filters (Multiplicative + Non-Multiplicative)', () => {
    it('should combine multiplicative and non-multiplicative filters', async () => {
      const mixedQuery = `
        query {
          invoices(where: { 
            details: { quantity: { _gte: 5 } },
            status: "pending"
          }) {
            id
            invoiceNumber
            status
            details {
              id
              quantity
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mixedQuery })
        .expect(200);

      expect(response.body.data.invoices).toBeDefined();
      expect(Array.isArray(response.body.data.invoices)).toBe(true);
      expect(response.body.data.invoices.length).toBe(1);
      expect(response.body.data.invoices[0].invoiceNumber).toBe('INV-001');
      expect(response.body.data.invoices[0].status).toBe('pending');
    });

    it('should combine multiplicative relation filter with client relation filter', async () => {
      const mixedQuery = `
        query {
          invoices(where: { 
            details: { unitPrice: { _gte: 20 } },
            client: { firstName: { _eq: "John" } }
          }) {
            id
            invoiceNumber
            client {
              firstName
              lastName
            }
            details {
              id
              unitPrice
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mixedQuery })
        .expect(200);

      expect(response.body.data.invoices).toBeDefined();
      expect(Array.isArray(response.body.data.invoices)).toBe(true);
      expect(response.body.data.invoices.length).toBe(2); // Both invoices match

      // All returned invoices should belong to John
      response.body.data.invoices.forEach((invoice: any) => {
        expect(invoice.client.firstName).toBe('John');
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle multiple nested multiplicative filters efficiently', async () => {
      const complexQuery = `
        query {
          invoices(where: { 
            details: { 
              _and: [
                { quantity: { _gte: 1 } },
                { unitPrice: { _lte: 1000 } },
                { product: { stock: { _gte: 5 } } }
              ]
            }
          }) {
            id
            invoiceNumber
            details {
              id
              quantity
              unitPrice
              product {
                stock
              }
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: complexQuery })
        .expect(200);

      expect(response.body.data.invoices).toBeDefined();
      expect(Array.isArray(response.body.data.invoices)).toBe(true);
      // Should return invoices that match all nested conditions
      expect(response.body.data.invoices.length).toBeGreaterThan(0);
    });

    it('should handle deeply nested product relations through details', async () => {
      const deepQuery = `
        query {
          invoices(where: { 
            details: { 
              product: { 
                supplier: { 
                  name: { _contains: "Test" } 
                } 
              } 
            } 
          }) {
            id
            invoiceNumber
            details {
              id
              product {
                name
                supplier {
                  name
                }
              }
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: deepQuery })
        .expect(200);

      expect(response.body.data.invoices).toBeDefined();
      expect(Array.isArray(response.body.data.invoices)).toBe(true);
      expect(response.body.data.invoices.length).toBe(2); // Both invoices should match

      // Verify that all returned invoices have products from "Test" supplier
      response.body.data.invoices.forEach((invoice: any) => {
        const hasTestSupplier = invoice.details.some((detail: any) =>
          detail.product.supplier.name.includes('Test'),
        );
        expect(hasTestSupplier).toBe(true);
      });
    });
  });
});
