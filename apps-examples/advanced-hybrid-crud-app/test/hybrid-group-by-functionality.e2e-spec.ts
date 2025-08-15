import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Hybrid App GROUP BY Functionality (e2e)', () => {
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

  describe('REST API GROUP BY Tests', () => {
    it('should group products by supplier name with aggregations via REST', async () => {
      // Create suppliers
      const supplier1Response = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'Electronics Corp',
          contactEmail: 'contact@electronics.com'
        })
        .expect(201);

      const supplier2Response = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'Office Solutions',
          contactEmail: 'info@office.com'
        })
        .expect(201);

      const supplier1 = supplier1Response.body;
      const supplier2 = supplier2Response.body;

      // Create products for supplier 1
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Laptop Pro',
          description: 'Professional laptop',
          price: 1299.99,
          stock: 10,
          supplier: { id: supplier1.id }
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Monitor 4K',
          description: '4K Ultra HD monitor',
          price: 399.99,
          stock: 15,
          supplier: { id: supplier1.id }
        })
        .expect(201);

      // Create products for supplier 2
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Office Chair',
          description: 'Ergonomic chair',
          price: 249.99,
          stock: 25,
          supplier: { id: supplier2.id }
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Desk Lamp',
          description: 'LED desk lamp',
          price: 49.99,
          stock: 30,
          supplier: { id: supplier2.id }
        })
        .expect(201);

      // Test: Group by supplier name with multiple aggregations
      const groupByQuery = {
        fields: { supplier: { name: true } },
        aggregates: [
          { field: 'name', function: 'COUNT', alias: 'productCount' },
          { field: 'price', function: 'AVG', alias: 'avgPrice' },
          { field: 'price', function: 'MIN', alias: 'minPrice' },
          { field: 'price', function: 'MAX', alias: 'maxPrice' },
          { field: 'stock', function: 'SUM', alias: 'totalStock' }
        ]
      };

      const response = await request(app.getHttpServer())
        .get('/products/grouped')
        .query('groupBy=' + encodeURIComponent(JSON.stringify(groupByQuery)))
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('groups');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.groups)).toBe(true);
      expect(response.body.groups.length).toBe(2);

      // Verify each group
      response.body.groups.forEach((group: any) => {
        expect(group).toHaveProperty('key');
        expect(group).toHaveProperty('aggregates');
        
        const key = group.key;
        const aggregates = group.aggregates;
        
        expect(key).toHaveProperty('supplier_name');
        expect(['Electronics Corp', 'Office Solutions']).toContain(key.supplier_name);
        
        expect(aggregates).toHaveProperty('productCount');
        expect(aggregates).toHaveProperty('avgPrice');
        expect(aggregates).toHaveProperty('minPrice');
        expect(aggregates).toHaveProperty('maxPrice');
        expect(aggregates).toHaveProperty('totalStock');
        
        expect(aggregates.productCount).toBe(2);
        expect(typeof aggregates.avgPrice).toBe('number');
        expect(typeof aggregates.minPrice).toBe('number');
        expect(typeof aggregates.maxPrice).toBe('number');
        expect(typeof aggregates.totalStock).toBe('number');
      });

      // Verify pagination
      expect(response.body.pagination.total).toBe(2);
      expect(response.body.pagination.page).toBe(1);
    });

    it('should group products by price ranges via REST', async () => {
      // Create supplier
      const supplierResponse = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'General Supplier',
          contactEmail: 'general@supplier.com'
        })
        .expect(201);

      const supplier = supplierResponse.body;

      // Create products with different price ranges
      const products = [
        { name: 'Budget Item 1', price: 25.00, stock: 10 },
        { name: 'Budget Item 2', price: 45.00, stock: 15 },
        { name: 'Mid Range 1', price: 125.00, stock: 8 },
        { name: 'Mid Range 2', price: 175.00, stock: 12 },
        { name: 'Premium 1', price: 550.00, stock: 5 },
        { name: 'Premium 2', price: 750.00, stock: 3 }
      ];

      for (const product of products) {
        await request(app.getHttpServer())
          .post('/products')
          .send({
            ...product,
            description: `Product ${product.name}`,
            supplier: { id: supplier.id }
          })
          .expect(201);
      }

      // Test: Group by price ranges using product price
      const groupByQuery = {
        fields: { price: true },
        aggregates: [
          { field: 'name', function: 'COUNT', alias: 'count' },
          { field: 'stock', function: 'AVG', alias: 'avgStock' }
        ]
      };

      const response = await request(app.getHttpServer())
        .get('/products/grouped')
        .query('groupBy=' + encodeURIComponent(JSON.stringify(groupByQuery)))
        .expect(200);

      expect(response.body.groups.length).toBe(6); // One group per unique price
      expect(response.body.pagination.total).toBe(6);
    });

    it('should handle empty results gracefully via REST', async () => {
      const groupByQuery = {
        fields: { name: true },
        aggregates: [
          { field: 'name', function: 'COUNT', alias: 'count' }
        ]
      };

      const response = await request(app.getHttpServer())
        .get('/products/grouped')
        .query('groupBy=' + encodeURIComponent(JSON.stringify(groupByQuery)))
        .expect(200);

      expect(response.body.groups).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });

    it('should handle pagination in grouped queries via REST', async () => {
      // Create supplier and multiple products
      const supplierResponse = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'Pagination Test Supplier',
          contactEmail: 'pagination@test.com'
        })
        .expect(201);

      const supplier = supplierResponse.body;

      // Create 5 products with unique names to create 5 groups
      for (let i = 1; i <= 5; i++) {
        await request(app.getHttpServer())
          .post('/products')
          .send({
            name: `Product ${i}`,
            description: `Description ${i}`,
            price: 100 * i,
            stock: 10,
            supplier: { id: supplier.id }
          })
          .expect(201);
      }

      // Test pagination with limit 2
      const groupByArgs = {
        groupBy: {
          fields: { name: true },
          aggregates: [
            { field: 'price', function: 'SUM', alias: 'totalPrice' }
          ]
        },
        pagination: { limit: 2 }
      };

      const response = await request(app.getHttpServer())
        .get('/products/grouped')
        .query('groupBy=' + encodeURIComponent(JSON.stringify(groupByArgs.groupBy)) + 
               '&pagination=' + encodeURIComponent(JSON.stringify(groupByArgs.pagination)))
        .expect(200);

      expect(response.body.groups.length).toBe(2); // Limited by pagination
      expect(response.body.pagination.total).toBe(5); // Total groups available
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.pageCount).toBe(3);
    });
  });

  describe('GraphQL GROUP BY Tests', () => {
    it('should group products by supplier with aggregations via GraphQL', async () => {
      // Create suppliers via GraphQL
      const createSupplier1 = `
        mutation {
          createSupplier(createInput: {
            name: "Tech Innovations",
            contactEmail: "tech@innovations.com"
          }) {
            id
            name
          }
        }
      `;

      const createSupplier2 = `
        mutation {
          createSupplier(createInput: {
            name: "Office Supplies Co",
            contactEmail: "supplies@office.com"
          }) {
            id
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

      // Create products via GraphQL
      const createProduct1 = `
        mutation {
          createProduct(createInput: {
            name: "Smartphone",
            description: "Latest smartphone",
            price: 699.99,
            stock: 20,
            supplier: { id: "${supplier1.id}" }
          }) {
            id
            name
          }
        }
      `;

      const createProduct2 = `
        mutation {
          createProduct(createInput: {
            name: "Tablet",
            description: "Portable tablet",
            price: 399.99,
            stock: 15,
            supplier: { id: "${supplier1.id}" }
          }) {
            id
            name
          }
        }
      `;

      const createProduct3 = `
        mutation {
          createProduct(createInput: {
            name: "Notebook",
            description: "Professional notebook",
            price: 4.99,
            stock: 100,
            supplier: { id: "${supplier2.id}" }
          }) {
            id
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

      // Test: Group products by supplier with aggregations
      const groupByQuery = `
        query {
          productsGrouped(
            groupBy: {
              fields: { supplier: { name: true } },
              aggregates: [
                { field: "name", function: COUNT, alias: "productCount" },
                { field: "price", function: AVG, alias: "avgPrice" },
                { field: "stock", function: SUM, alias: "totalStock" }
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
              page
              limit
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
      expect(response.body.data.productsGrouped.groups.length).toBe(2);

      // Verify group structure
      response.body.data.productsGrouped.groups.forEach((group: any) => {
        expect(group.key).toBeDefined();
        expect(group.aggregates).toBeDefined();
        
        const key = group.key;
        const aggregates = group.aggregates;
        
        expect(key).toHaveProperty('supplier_name');
        expect(['Tech Innovations', 'Office Supplies Co']).toContain(key.supplier_name);
        
        expect(aggregates).toHaveProperty('productCount');
        expect(aggregates).toHaveProperty('avgPrice');
        expect(aggregates).toHaveProperty('totalStock');
      });

      // Verify pagination
      expect(response.body.data.productsGrouped.pagination.total).toBe(2);
      expect(response.body.data.productsGrouped.pagination.limit).toBeNull();
    });

    it('should group by multiple fields via GraphQL', async () => {
      // Create supplier
      const createSupplier = `
        mutation {
          createSupplier(createInput: {
            name: "Multi Group Supplier",
            contactEmail: "multi@group.com"
          }) {
            id
          }
        }
      `;

      const supplierResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createSupplier })
        .expect(200);

      const supplier = supplierResponse.body.data.createSupplier;

      // Create products with same names but different descriptions
      const products = [
        { name: 'Product A', description: 'Type 1', price: 100, stock: 10 },
        { name: 'Product A', description: 'Type 2', price: 150, stock: 5 },
        { name: 'Product B', description: 'Type 1', price: 200, stock: 8 },
        { name: 'Product B', description: 'Type 2', price: 250, stock: 12 }
      ];

      for (const product of products) {
        const createProduct = `
          mutation {
            createProduct(createInput: {
              name: "${product.name}",
              description: "${product.description}",
              price: ${product.price},
              stock: ${product.stock},
              supplier: { id: "${supplier.id}" }
            }) {
              id
            }
          }
        `;

        await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: createProduct })
          .expect(200);
      }

      // Test: Group by name and description
      const groupByQuery = `
        query {
          productsGrouped(
            groupBy: {
              fields: { 
                name: true,
                description: true
              },
              aggregates: [
                { field: "price", function: AVG, alias: "avgPrice" },
                { field: "stock", function: MAX, alias: "maxStock" }
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

      expect(response.body.data.productsGrouped.groups.length).toBe(4); // 4 unique combinations
      expect(response.body.data.productsGrouped.pagination.total).toBe(4);

      // Verify that each group has both name and description in the key
      response.body.data.productsGrouped.groups.forEach((group: any) => {
        const key = group.key;
        expect(key).toHaveProperty('name');
        expect(key).toHaveProperty('description');
      });
    });

    it('should handle complex aggregations via GraphQL', async () => {
      // Create supplier
      const createSupplier = `
        mutation {
          createSupplier(createInput: {
            name: "Complex Aggregation Supplier",
            contactEmail: "complex@agg.com"
          }) {
            id
          }
        }
      `;

      const supplierResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createSupplier })
        .expect(200);

      const supplier = supplierResponse.body.data.createSupplier;

      // Create products with known values for precise testing
      const products = [
        { name: 'Category A', price: 100, stock: 10 },
        { name: 'Category A', price: 200, stock: 20 },
        { name: 'Category A', price: 300, stock: 30 },
        { name: 'Category B', price: 50, stock: 5 },
        { name: 'Category B', price: 150, stock: 15 }
      ];

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const createProduct = `
          mutation {
            createProduct(createInput: {
              name: "${product.name}",
              description: "Product ${i + 1}",
              price: ${product.price},
              stock: ${product.stock},
              supplier: { id: "${supplier.id}" }
            }) {
              id
            }
          }
        `;

        await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: createProduct })
          .expect(200);
      }

      // Test: All aggregate functions
      const groupByQuery = `
        query {
          productsGrouped(
            groupBy: {
              fields: { name: true },
              aggregates: [
                { field: "price", function: COUNT, alias: "priceCount" },
                { field: "price", function: SUM, alias: "priceSum" },
                { field: "price", function: AVG, alias: "priceAvg" },
                { field: "price", function: MIN, alias: "priceMin" },
                { field: "price", function: MAX, alias: "priceMax" },
                { field: "stock", function: SUM, alias: "stockSum" }
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

      expect(response.body.data.productsGrouped.groups.length).toBe(2);

      // Find Category A group and verify calculations
      const categoryAGroup = response.body.data.productsGrouped.groups.find((group: any) => {
        const key = group.key;
        return key.name === 'Category A';
      });

      expect(categoryAGroup).toBeDefined();
      const categoryAAggregates = categoryAGroup.aggregates;
      
      expect(categoryAAggregates.priceCount).toBe(3);
      expect(categoryAAggregates.priceSum).toBe(600); // 100 + 200 + 300
      expect(categoryAAggregates.priceAvg).toBe(200); // 600 / 3
      expect(categoryAAggregates.priceMin).toBe(100);
      expect(categoryAAggregates.priceMax).toBe(300);
      expect(categoryAAggregates.stockSum).toBe(60); // 10 + 20 + 30
    });

    it('should handle pagination in GraphQL grouped queries', async () => {
      // Create supplier
      const createSupplier = `
        mutation {
          createSupplier(createInput: {
            name: "Pagination GraphQL Supplier",
            contactEmail: "pagination@graphql.com"
          }) {
            id
          }
        }
      `;

      const supplierResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createSupplier })
        .expect(200);

      const supplier = supplierResponse.body.data.createSupplier;

      // Create 6 products with unique names
      for (let i = 1; i <= 6; i++) {
        const createProduct = `
          mutation {
            createProduct(createInput: {
              name: "Unique Product ${i}",
              description: "Description ${i}",
              price: ${i * 50},
              stock: ${i * 5},
              supplier: { id: "${supplier.id}" }
            }) {
              id
            }
          }
        `;

        await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: createProduct })
          .expect(200);
      }

      // Test pagination
      const groupByQuery = `
        query {
          productsGrouped(
            groupBy: {
              fields: { name: true },
              aggregates: [
                { field: "price", function: SUM, alias: "totalPrice" }
              ]
            },
            pagination: { limit: 3 }
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
        .send({ query: groupByQuery })
        .expect(200);

      expect(response.body.data.productsGrouped.groups.length).toBe(3); // Limited by pagination
      expect(response.body.data.productsGrouped.pagination.total).toBe(6); // Total available
      expect(response.body.data.productsGrouped.pagination.limit).toBe(3);
      expect(response.body.data.productsGrouped.pagination.pageCount).toBe(2);
      expect(response.body.data.productsGrouped.pagination.hasNextPage).toBe(true);
      expect(response.body.data.productsGrouped.pagination.hasPreviousPage).toBe(false);
    });
  });

  describe('Advanced Scenarios', () => {
    it('should work with soft-deleted entities (hybrid test)', async () => {
      // This tests both REST and GraphQL on the same data with soft deletion
      
      // Create supplier via REST
      const supplierResponse = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'Soft Delete Test',
          contactEmail: 'softdelete@test.com'
        })
        .expect(201);

      const supplier = supplierResponse.body;

      // Create products via REST
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Product to Keep',
          description: 'This will stay',
          price: 100,
          stock: 10,
          supplier: { id: supplier.id }
        })
        .expect(201);

      const productToDeleteResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Product to Delete',
          description: 'This will be deleted',
          price: 200,
          stock: 20,
          supplier: { id: supplier.id }
        })
        .expect(201);

      const productToDelete = productToDeleteResponse.body;

      // Test initial group count via REST
      const initialGroupByQuery = {
        fields: { name: true },
        aggregates: [
          { field: 'name', function: 'COUNT', alias: 'count' }
        ]
      };

      const initialResponse = await request(app.getHttpServer())
        .get('/products/grouped')
        .query('groupBy=' + encodeURIComponent(JSON.stringify(initialGroupByQuery)))
        .expect(200);

      expect(initialResponse.body.groups.length).toBe(2);

      // Soft delete one product via REST
      await request(app.getHttpServer())
        .delete(`/products/${productToDelete.id}`)
        .expect(202);

      // Test group count after soft delete via REST
      const afterDeleteResponse = await request(app.getHttpServer())
        .get('/products/grouped')
        .query('groupBy=' + encodeURIComponent(JSON.stringify(initialGroupByQuery)))
        .expect(200);

      expect(afterDeleteResponse.body.groups.length).toBe(1);

      // Verify same result via GraphQL
      const graphqlGroupByQuery = `
        query {
          productsGrouped(
            groupBy: {
              fields: { name: true },
              aggregates: [
                { field: "name", function: COUNT, alias: "count" }
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

      const graphqlResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: graphqlGroupByQuery })
        .expect(200);

      expect(graphqlResponse.body.data.productsGrouped.groups.length).toBe(1);
      expect(graphqlResponse.body.data.productsGrouped.pagination.total).toBe(1);
    });

    it('should handle both REST and GraphQL responses consistently', async () => {
      // Create test data
      const supplierResponse = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'Consistency Test Supplier',
          contactEmail: 'consistency@test.com'
        })
        .expect(201);

      const supplier = supplierResponse.body;

      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Consistency Product',
          description: 'Test product',
          price: 299.99,
          stock: 25,
          supplier: { id: supplier.id }
        })
        .expect(201);

      // Test via REST
      const restGroupByQuery = {
        fields: { supplier: { name: true } },
        aggregates: [
          { field: 'price', function: 'AVG', alias: 'avgPrice' },
          { field: 'stock', function: 'SUM', alias: 'totalStock' }
        ]
      };

      const restResponse = await request(app.getHttpServer())
        .get('/products/grouped')
        .query('groupBy=' + encodeURIComponent(JSON.stringify(restGroupByQuery)))
        .expect(200);

      // Test via GraphQL
      const graphqlQuery = `
        query {
          productsGrouped(
            groupBy: {
              fields: { supplier: { name: true } },
              aggregates: [
                { field: "price", function: AVG, alias: "avgPrice" },
                { field: "stock", function: SUM, alias: "totalStock" }
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

      const graphqlResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: graphqlQuery })
        .expect(200);

      // Both should return the same data structure and values
      expect(restResponse.body.groups.length).toBe(1);
      expect(graphqlResponse.body.data.productsGrouped.groups.length).toBe(1);

      expect(restResponse.body.pagination.total).toBe(1);
      expect(graphqlResponse.body.data.productsGrouped.pagination.total).toBe(1);

      // Parse and compare aggregates
      const restAggregates = restResponse.body.groups[0].aggregates;
      const graphqlAggregates = graphqlResponse.body.data.productsGrouped.groups[0].aggregates;

      expect(restAggregates.avgPrice).toBe(graphqlAggregates.avgPrice);
      expect(restAggregates.totalStock).toBe(graphqlAggregates.totalStock);
    });
  });
});