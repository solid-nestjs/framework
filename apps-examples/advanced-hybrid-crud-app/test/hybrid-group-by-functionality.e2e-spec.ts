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

  describe('Filtered and Ordered GROUP BY Tests', () => {
    it('should filter before grouping via REST API', async () => {
      // Create suppliers
      const supplier1Response = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'Premium Supplier',
          contactEmail: 'premium@supplier.com'
        })
        .expect(201);

      const supplier2Response = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'Budget Supplier',
          contactEmail: 'budget@supplier.com'
        })
        .expect(201);

      const supplier1 = supplier1Response.body;
      const supplier2 = supplier2Response.body;

      // Create products with different price ranges
      const products = [
        { name: 'Premium Item 1', price: 500, stock: 10, supplierId: supplier1.id },
        { name: 'Premium Item 2', price: 750, stock: 5, supplierId: supplier1.id },
        { name: 'Budget Item 1', price: 50, stock: 20, supplierId: supplier2.id },
        { name: 'Budget Item 2', price: 75, stock: 15, supplierId: supplier2.id },
        { name: 'Mid-range Item', price: 250, stock: 12, supplierId: supplier1.id }
      ];

      for (const product of products) {
        await request(app.getHttpServer())
          .post('/products')
          .send({
            name: product.name,
            description: `Description for ${product.name}`,
            price: product.price,
            stock: product.stock,
            supplier: { id: product.supplierId }
          })
          .expect(201);
      }

      // Test: Group by supplier, but only include products with price >= 200
      const groupByQuery = {
        fields: { supplier: { name: true } },
        aggregates: [
          { field: 'name', function: 'COUNT', alias: 'productCount' },
          { field: 'price', function: 'AVG', alias: 'avgPrice' }
        ]
      };

      const whereFilter = { price: { _gte: 200 } };

      const response = await request(app.getHttpServer())
        .get('/products/grouped')
        .query('groupBy=' + encodeURIComponent(JSON.stringify(groupByQuery)) +
               '&where=' + encodeURIComponent(JSON.stringify(whereFilter)))
        .expect(200);

      // Should only have Premium Supplier group (3 products >= 200)
      expect(response.body.groups.length).toBe(1);
      
      const group = response.body.groups[0];
      const key = group.key;
      const aggregates = group.aggregates;
      
      expect(key.supplier_name).toBe('Premium Supplier');
      expect(aggregates.productCount).toBe(3); // Premium Item 1, Premium Item 2, Mid-range Item
      expect(aggregates.avgPrice).toBe(500); // (500 + 750 + 250) / 3
    });

    it('should order grouped results via REST API', async () => {
      // Create suppliers
      const suppliers = ['Zebra Supplier', 'Alpha Supplier', 'Beta Supplier'];
      const supplierIds: string[] = [];

      for (const supplierName of suppliers) {
        const response = await request(app.getHttpServer())
          .post('/suppliers')
          .send({
            name: supplierName,
            contactEmail: `${supplierName.toLowerCase().replace(' ', '')}@test.com`
          })
          .expect(201);
        supplierIds.push(response.body.id);
      }

      // Create products for each supplier
      for (let i = 0; i < suppliers.length; i++) {
        await request(app.getHttpServer())
          .post('/products')
          .send({
            name: `Product for ${suppliers[i]}`,
            description: 'Test product',
            price: 100,
            stock: 10,
            supplier: { id: supplierIds[i] }
          })
          .expect(201);
      }

      // Test: Group by supplier and order by supplier name ASC
      const groupByQuery = {
        fields: { supplier: { name: true } },
        aggregates: [
          { field: 'name', function: 'COUNT', alias: 'productCount' }
        ]
      };

      const orderBy = [{ supplier: { name: 'ASC' } }];

      const response = await request(app.getHttpServer())
        .get('/products/grouped')
        .query('groupBy=' + encodeURIComponent(JSON.stringify(groupByQuery)) +
               '&orderBy=' + encodeURIComponent(JSON.stringify(orderBy)))
        .expect(200);

      expect(response.body.groups.length).toBe(3);
      
      // Verify ordering: Alpha, Beta, Zebra
      const groupNames = response.body.groups.map((group: any) => group.key.supplier_name);
      expect(groupNames).toEqual(['Alpha Supplier', 'Beta Supplier', 'Zebra Supplier']);
    });

    it('should combine filtering and ordering via REST API', async () => {
      // Create supplier
      const supplierResponse = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'Filter Order Supplier',
          contactEmail: 'filterorder@test.com'
        })
        .expect(201);

      const supplier = supplierResponse.body;

      // Create products with different stock levels
      const products = [
        { name: 'Low Stock A', stock: 5, price: 100 },
        { name: 'High Stock Z', stock: 50, price: 100 },
        { name: 'Low Stock B', stock: 3, price: 100 },
        { name: 'High Stock Y', stock: 40, price: 100 },
        { name: 'Med Stock M', stock: 15, price: 100 }
      ];

      for (const product of products) {
        await request(app.getHttpServer())
          .post('/products')
          .send({
            name: product.name,
            description: 'Test product',
            price: product.price,
            stock: product.stock,
            supplier: { id: supplier.id }
          })
          .expect(201);
      }

      // Test: Group by name, filter stock >= 10, order by name DESC
      const groupByQuery = {
        fields: { name: true },
        aggregates: [
          { field: 'stock', function: 'SUM', alias: 'totalStock' }
        ]
      };

      const whereFilter = { stock: { _gte: 10 } };
      const orderBy = [{ name: 'DESC' }];

      const response = await request(app.getHttpServer())
        .get('/products/grouped')
        .query('groupBy=' + encodeURIComponent(JSON.stringify(groupByQuery)) +
               '&where=' + encodeURIComponent(JSON.stringify(whereFilter)) +
               '&orderBy=' + encodeURIComponent(JSON.stringify(orderBy)))
        .expect(200);

      expect(response.body.groups.length).toBe(3); // High Stock Z, High Stock Y, Med Stock M
      
      // Verify DESC ordering: M, Z, Y (excluding A and B which have stock < 10)
      const groupNames = response.body.groups.map((group: any) => group.key.name);
      expect(groupNames).toEqual(['Med Stock M', 'High Stock Z', 'High Stock Y']);
    });

    it('should filter before grouping via GraphQL', async () => {
      // Create suppliers via GraphQL
      const createSupplier1 = `
        mutation {
          createSupplier(createInput: {
            name: "GraphQL Premium Supplier",
            contactEmail: "graphql.premium@test.com"
          }) {
            id
            name
          }
        }
      `;

      const createSupplier2 = `
        mutation {
          createSupplier(createInput: {
            name: "GraphQL Budget Supplier",
            contactEmail: "graphql.budget@test.com"
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

      // Create products with different price ranges
      const products = [
        { name: 'GraphQL Premium 1', price: 600, stock: 8, supplierId: supplier1.id },
        { name: 'GraphQL Premium 2', price: 800, stock: 4, supplierId: supplier1.id },
        { name: 'GraphQL Budget 1', price: 60, stock: 25, supplierId: supplier2.id },
        { name: 'GraphQL Budget 2', price: 80, stock: 20, supplierId: supplier2.id },
        { name: 'GraphQL Mid', price: 300, stock: 10, supplierId: supplier1.id }
      ];

      for (const product of products) {
        const createProduct = `
          mutation {
            createProduct(createInput: {
              name: "${product.name}",
              description: "GraphQL test product",
              price: ${product.price},
              stock: ${product.stock},
              supplier: { id: "${product.supplierId}" }
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

      // Test: Group by supplier, filter price >= 250
      const groupByQuery = `
        query {
          productsGrouped(
            where: { price: { _gte: 250 } },
            groupBy: {
              fields: { supplier: { name: true } },
              aggregates: [
                { field: "name", function: COUNT, alias: "productCount" },
                { field: "price", function: MIN, alias: "minPrice" }
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

      // Should only have GraphQL Premium Supplier group (3 products >= 250)
      expect(response.body.data.productsGrouped.groups.length).toBe(1);
      expect(response.body.data.productsGrouped.pagination.total).toBe(1);
      
      const group = response.body.data.productsGrouped.groups[0];
      const key = group.key;
      const aggregates = group.aggregates;
      
      expect(key.supplier_name).toBe('GraphQL Premium Supplier');
      expect(aggregates.productCount).toBe(3); // Premium 1, Premium 2, Mid
      expect(aggregates.minPrice).toBe(300); // Minimum of 600, 800, 300
    });

    it('should order grouped results via GraphQL', async () => {
      // Create suppliers with names that will test ordering
      const suppliers = ['GraphQL Zebra Co', 'GraphQL Alpha Inc', 'GraphQL Beta Ltd'];
      const supplierIds: string[] = [];

      for (const supplierName of suppliers) {
        const createSupplier = `
          mutation {
            createSupplier(createInput: {
              name: "${supplierName}",
              contactEmail: "${supplierName.toLowerCase().replace(/[^a-z]/g, '')}@test.com"
            }) {
              id
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: createSupplier })
          .expect(200);

        supplierIds.push(response.body.data.createSupplier.id);
      }

      // Create products for each supplier
      for (let i = 0; i < suppliers.length; i++) {
        const createProduct = `
          mutation {
            createProduct(createInput: {
              name: "GraphQL Product ${i + 1}",
              description: "Test ordering",
              price: ${(i + 1) * 100},
              stock: 10,
              supplier: { id: "${supplierIds[i]}" }
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

      // Test: Group by supplier, order by supplier name ASC
      const groupByQuery = `
        query {
          productsGrouped(
            orderBy: { supplier: { name: ASC } },
            groupBy: {
              fields: { supplier: { name: true } },
              aggregates: [
                { field: "price", function: MAX, alias: "maxPrice" }
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
      
      // Verify ordering: Alpha, Beta, Zebra
      const groupNames = response.body.data.productsGrouped.groups.map((group: any) => group.key.supplier_name);
      expect(groupNames).toEqual(['GraphQL Alpha Inc', 'GraphQL Beta Ltd', 'GraphQL Zebra Co']);
    });

    it('should combine filtering and ordering via GraphQL', async () => {
      // Create supplier
      const createSupplier = `
        mutation {
          createSupplier(createInput: {
            name: "GraphQL Filter Order Supplier",
            contactEmail: "graphqlfilterorder@test.com"
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

      // Create products with varying stock and prices
      const products = [
        { name: 'GraphQL Low A', stock: 8, price: 150 },
        { name: 'GraphQL High Z', stock: 60, price: 200 },
        { name: 'GraphQL Low B', stock: 5, price: 120 },
        { name: 'GraphQL High Y', stock: 45, price: 180 },
        { name: 'GraphQL Med M', stock: 20, price: 160 }
      ];

      for (const product of products) {
        const createProduct = `
          mutation {
            createProduct(createInput: {
              name: "${product.name}",
              description: "GraphQL filter order test",
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

      // Test: Group by name, filter price >= 150, order by name ASC
      const groupByQuery = `
        query {
          productsGrouped(
            where: { price: { _gte: 150 } },
            orderBy: { name: ASC },
            groupBy: {
              fields: { name: true },
              aggregates: [
                { field: "stock", function: AVG, alias: "avgStock" }
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

      expect(response.body.data.productsGrouped.groups.length).toBe(4); // All except GraphQL Low B (price 120)
      
      // Verify ordering (ASC) and that Low B is excluded
      const groupNames = response.body.data.productsGrouped.groups.map((group: any) => group.key.name);
      expect(groupNames).toEqual(['GraphQL High Y', 'GraphQL High Z', 'GraphQL Low A', 'GraphQL Med M']);
      expect(groupNames).not.toContain('GraphQL Low B');
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

  describe('Relational WHERE Filters in GROUP BY', () => {
    it('should filter by related entity properties via REST API', async () => {
      // Create suppliers with different email domains
      const premiumSupplier = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'Premium Corp',
          contactEmail: 'contact@premium.com'
        })
        .expect(201);

      const standardSupplier = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'Standard Inc',
          contactEmail: 'info@standard.net'
        })
        .expect(201);

      // Create products for each supplier
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Premium Product A',
          description: 'High-end item A',
          price: 1000,
          stock: 5,
          supplier: { id: premiumSupplier.body.id }
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Premium Product B',
          description: 'High-end item B',
          price: 1500,
          stock: 3,
          supplier: { id: premiumSupplier.body.id }
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Standard Product A',
          description: 'Regular item A',
          price: 200,
          stock: 10,
          supplier: { id: standardSupplier.body.id }
        })
        .expect(201);

      // Test: Group by supplier name, but only include suppliers with .com email domains
      const groupByQuery = {
        fields: { supplier: { name: true } },
        aggregates: [
          { field: 'name', function: 'COUNT', alias: 'productCount' },
          { field: 'price', function: 'AVG', alias: 'avgPrice' }
        ]
      };

      const whereFilter = { 
        supplier: { 
          contactEmail: { _like: '%@premium.com' } 
        } 
      };

      const response = await request(app.getHttpServer())
        .get('/products/grouped')
        .query('groupBy=' + encodeURIComponent(JSON.stringify(groupByQuery)) +
               '&where=' + encodeURIComponent(JSON.stringify(whereFilter)))
        .expect(200);

      // Should only have Premium Corp group (products from suppliers with @premium.com email)
      expect(response.body.groups.length).toBe(1);
      
      const group = response.body.groups[0];
      const key = group.key;
      const aggregates = group.aggregates;
      
      expect(key.supplier_name).toBe('Premium Corp');
      expect(aggregates.productCount).toBe(2); // Premium Product A and B
      expect(aggregates.avgPrice).toBe(1250); // (1000 + 1500) / 2
    });

    it('should filter by related entity properties via GraphQL', async () => {
      // Create suppliers with different email domains
      const enterpriseSupplier = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createSupplier(
                createInput: {
                  name: "Enterprise Solutions"
                  contactEmail: "sales@enterprise.com"
                }
              ) {
                id
                name
                contactEmail
              }
            }
          `
        })
        .expect(200);

      const startupSupplier = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              createSupplier(
                createInput: {
                  name: "Startup Tech"
                  contactEmail: "hello@startup.io"
                }
              ) {
            id
                name
                contactEmail
              }
            }
          `
        })
        .expect(200);

      const enterpriseSupplierId = enterpriseSupplier.body.data.createSupplier.id;
      const startupSupplierId = startupSupplier.body.data.createSupplier.id;

      // Create products via GraphQL
      for (const productData of [
        { name: 'Enterprise Tool X', price: 2000, stock: 2, supplierId: enterpriseSupplierId },
        { name: 'Enterprise Tool Y', price: 3000, stock: 1, supplierId: enterpriseSupplierId },
        { name: 'Enterprise Tool Z', price: 2500, stock: 3, supplierId: enterpriseSupplierId },
        { name: 'Startup App A', price: 50, stock: 100, supplierId: startupSupplierId }
      ]) {
        await request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: `
              mutation {
                createProduct(
                  createInput: {
                    name: "${productData.name}"
                    description: "Test product"
                    price: ${productData.price}
                    stock: ${productData.stock}
                    supplier: { id: "${productData.supplierId}" }
                  }
                ) {
                  id
                  name
                }
              }
            `
          })
          .expect(200);
      }

      // Test: Group by supplier, filter by suppliers with .com email domains
      const groupByQuery = `
        query {
          productsGrouped(
            where: { supplier: { contactEmail: { _like: "%.com" } } }
            groupBy: {
              fields: { supplier: { name: true } }
              aggregates: [
                { field: "name", function: COUNT, alias: "productCount" }
                { field: "price", function: MAX, alias: "maxPrice" }
                { field: "price", function: MIN, alias: "minPrice" }
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

      // Should only have Enterprise Solutions group (supplier with .com email)
      expect(response.body.data.productsGrouped.groups.length).toBe(1);
      expect(response.body.data.productsGrouped.pagination.total).toBe(1);
      
      const group = response.body.data.productsGrouped.groups[0];
      const key = group.key;
      const aggregates = group.aggregates;
      
      expect(key.supplier_name).toBe('Enterprise Solutions');
      expect(aggregates.productCount).toBe(3); // Enterprise Tools X, Y, Z
      expect(aggregates.maxPrice).toBe(3000); // Enterprise Tool Y
      expect(aggregates.minPrice).toBe(2000); // Enterprise Tool X
    });

    it('should combine relational and direct filters via REST API', async () => {
      // Create a luxury supplier
      const luxurySupplier = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'Luxury Brands Ltd',
          contactEmail: 'vip@luxury.com'
        })
        .expect(201);

      // Create products with different price ranges
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Luxury Item Low',
          description: 'Entry luxury',
          price: 800, // Below our price filter
          stock: 2,
          supplier: { id: luxurySupplier.body.id }
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Luxury Item High',
          description: 'Premium luxury',
          price: 5000, // Above our price filter
          stock: 1,
          supplier: { id: luxurySupplier.body.id }
        })
        .expect(201);

      // Test: Group by supplier, filter by luxury supplier AND price >= 1000
      const groupByQuery = {
        fields: { supplier: { name: true } },
        aggregates: [
          { field: 'name', function: 'COUNT', alias: 'expensiveProductCount' },
          { field: 'stock', function: 'SUM', alias: 'totalExpensiveStock' }
        ]
      };

      const whereFilter = { 
        supplier: { 
          contactEmail: { _like: '%@luxury.com' } 
        },
        price: { _gte: 1000 } // Only expensive items
      };

      const response = await request(app.getHttpServer())
        .get('/products/grouped')
        .query('groupBy=' + encodeURIComponent(JSON.stringify(groupByQuery)) +
               '&where=' + encodeURIComponent(JSON.stringify(whereFilter)))
        .expect(200);

      // Should only have Luxury Brands Ltd group with 1 expensive product (Luxury Item High)
      expect(response.body.groups.length).toBe(1);
      
      const group = response.body.groups[0];
      const key = group.key;
      const aggregates = group.aggregates;
      
      expect(key.supplier_name).toBe('Luxury Brands Ltd');
      expect(aggregates.expensiveProductCount).toBe(1); // Only Luxury Item High meets both criteria
      expect(aggregates.totalExpensiveStock).toBe(1); // Stock of Luxury Item High
    });

    it('should handle complex scenario: relational filters + relational ordering + pagination via REST API', async () => {
      // Create multiple suppliers with different characteristics
      const suppliers = [];
      const supplierData = [
        { name: 'Alpha Tech Corp', email: 'contact@alphatech.com', domain: 'com' },
        { name: 'Beta Solutions LLC', email: 'info@betasolutions.com', domain: 'com' },
        { name: 'Gamma Innovations', email: 'sales@gammainnovations.org', domain: 'org' },
        { name: 'Delta Systems Inc', email: 'support@deltasystems.com', domain: 'com' },
        { name: 'Epsilon Networks', email: 'hello@epsilonnetworks.net', domain: 'net' },
        { name: 'Zeta Technologies', email: 'team@zetatech.com', domain: 'com' }
      ];

      for (const supplier of supplierData) {
        const response = await request(app.getHttpServer())
          .post('/suppliers')
          .send({
            name: supplier.name,
            contactEmail: supplier.email
          })
          .expect(201);
        suppliers.push({ ...supplier, id: response.body.id });
      }

      // Create products for each supplier (varying quantities and prices)
      const productsBySupplier = [
        { supplierId: suppliers[0].id, products: 3, basePrice: 100 }, // Alpha Tech: 3 products
        { supplierId: suppliers[1].id, products: 5, basePrice: 200 }, // Beta Solutions: 5 products  
        { supplierId: suppliers[2].id, products: 2, basePrice: 300 }, // Gamma (.org): 2 products
        { supplierId: suppliers[3].id, products: 4, basePrice: 150 }, // Delta Systems: 4 products
        { supplierId: suppliers[4].id, products: 1, basePrice: 500 }, // Epsilon (.net): 1 product
        { supplierId: suppliers[5].id, products: 6, basePrice: 80 }   // Zeta Tech: 6 products
      ];

      for (const supplierProducts of productsBySupplier) {
        for (let i = 1; i <= supplierProducts.products; i++) {
          const supplierName = suppliers.find(s => s.id === supplierProducts.supplierId)?.name;
          await request(app.getHttpServer())
            .post('/products')
            .send({
              name: `${supplierName} Product ${i}`,
              description: `Product ${i} from ${supplierName}`,
              price: supplierProducts.basePrice + (i * 10),
              stock: i * 5,
              supplier: { id: supplierProducts.supplierId }
            })
            .expect(201);
        }
      }

      // Complex Query: 
      // - Filter: Only suppliers with .com email domains (excludes .org and .net)
      // - Group by: supplier name  
      // - Order by: supplier name DESC (Z to A)
      // - Pagination: limit 2, starting from page 2 (skip first 2 results)
      // - Aggregates: COUNT products, AVG price, SUM stock
      
      const groupByQuery = {
        fields: { supplier: { name: true } },
        aggregates: [
          { field: 'name', function: 'COUNT', alias: 'productCount' },
          { field: 'price', function: 'AVG', alias: 'avgPrice' },
          { field: 'stock', function: 'SUM', alias: 'totalStock' },
          { field: 'price', function: 'MAX', alias: 'maxPrice' }
        ]
      };

      const whereFilter = { 
        supplier: { 
          contactEmail: { _like: '%.com' } // Only .com domains
        } 
      };

      const orderBy = [{ supplier: { name: 'DESC' } }]; // Z to A ordering

      const pagination = { limit: 2, page: 2 }; // Second page, 2 items per page

      const response = await request(app.getHttpServer())
        .get('/products/grouped')
        .query('groupBy=' + encodeURIComponent(JSON.stringify(groupByQuery)) +
               '&where=' + encodeURIComponent(JSON.stringify(whereFilter)) +
               '&orderBy=' + encodeURIComponent(JSON.stringify(orderBy)) +
               '&pagination=' + encodeURIComponent(JSON.stringify(pagination)))
        .expect(200);

      // Expected .com suppliers in DESC order: Zeta, Delta, Beta, Alpha
      // With pagination limit=2, page=2: should get Beta and Alpha (positions 3-4)
      expect(response.body.groups.length).toBe(2);
      
      // Verify pagination metadata
      expect(response.body.pagination.total).toBe(4); // Total .com suppliers
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.pageCount).toBe(2); // ceil(4/2) = 2 pages

      // Verify correct suppliers in DESC order (page 2 should have Beta and Alpha)
      const group1 = response.body.groups[0]; // Should be Beta Solutions
      const group2 = response.body.groups[1]; // Should be Alpha Tech Corp
      
      expect(group1.key.supplier_name).toBe('Beta Solutions LLC');
      expect(group2.key.supplier_name).toBe('Alpha Tech Corp');

      // Verify aggregations are correct
      const betaAggregates = group1.aggregates;
      const alphaAggregates = group2.aggregates;
      
      // Beta Solutions: 5 products with prices 210, 220, 230, 240, 250 | stocks 5, 10, 15, 20, 25
      expect(betaAggregates.productCount).toBe(5);
      expect(betaAggregates.avgPrice).toBe(230); // (210+220+230+240+250)/5
      expect(betaAggregates.totalStock).toBe(75); // 5+10+15+20+25
      expect(betaAggregates.maxPrice).toBe(250);

      // Alpha Tech: 3 products with prices 110, 120, 130 | stocks 5, 10, 15  
      expect(alphaAggregates.productCount).toBe(3);
      expect(alphaAggregates.avgPrice).toBe(120); // (110+120+130)/3
      expect(alphaAggregates.totalStock).toBe(30); // 5+10+15
      expect(alphaAggregates.maxPrice).toBe(130);
    });

    it('should handle complex scenario: relational filters + relational ordering + pagination via GraphQL', async () => {
      // Create suppliers with different email patterns and regions
      const supplierCreations = [
        { name: 'European Solutions', email: 'contact@european.eu', region: 'Europe' },
        { name: 'American Enterprises', email: 'info@american.us', region: 'America' },
        { name: 'Global Tech Corp', email: 'sales@globaltech.com', region: 'Global' },
        { name: 'International Systems', email: 'support@international.com', region: 'Global' },
        { name: 'Continental Networks', email: 'hello@continental.eu', region: 'Europe' },
        { name: 'Worldwide Solutions', email: 'team@worldwide.com', region: 'Global' }
      ];

      const createdSuppliers = [];
      for (const supplier of supplierCreations) {
        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({
            query: `
              mutation {
                createSupplier(createInput: {
                  name: "${supplier.name}"
                  contactEmail: "${supplier.email}"
                }) {
                  id
                  name
                  contactEmail
                }
              }
            `
          })
          .expect(200);
        
        createdSuppliers.push({
          ...supplier,
          id: response.body.data.createSupplier.id
        });
      }

      // Create varying numbers of products for each supplier
      const productConfigs = [
        { supplierId: createdSuppliers[0].id, count: 2, basePrice: 500 }, // European Solutions
        { supplierId: createdSuppliers[1].id, count: 4, basePrice: 300 }, // American Enterprises  
        { supplierId: createdSuppliers[2].id, count: 3, basePrice: 400 }, // Global Tech Corp
        { supplierId: createdSuppliers[3].id, count: 5, basePrice: 200 }, // International Systems
        { supplierId: createdSuppliers[4].id, count: 1, basePrice: 800 }, // Continental Networks
        { supplierId: createdSuppliers[5].id, count: 4, basePrice: 350 }  // Worldwide Solutions
      ];

      for (const config of productConfigs) {
        const supplierName = createdSuppliers.find(s => s.id === config.supplierId)?.name;
        for (let i = 1; i <= config.count; i++) {
          await request(app.getHttpServer())
            .post('/graphql')
            .send({
              query: `
                mutation {
                  createProduct(createInput: {
                    name: "${supplierName} Product ${i}"
                    description: "Product ${i} from ${supplierName}"
                    price: ${config.basePrice + (i * 25)}
                    stock: ${i * 3}
                    supplier: { id: "${config.supplierId}" }
                  }) {
                    id
                    name
                  }
                }
              `
            })
            .expect(200);
        }
      }

      // Ultra Complex GraphQL Query:
      // - Filter: Only suppliers with .com email domains
      // - Group by: supplier name
      // - Order by: supplier name ASC (A to Z)  
      // - Pagination: limit 2, offset 1 (skip first, get next 2)
      // - Aggregates: Multiple aggregations
      
      const complexGroupByQuery = `
        query {
          productsGrouped(
            where: { supplier: { contactEmail: { _like: "%.com" } } }
            orderBy: { supplier: { name: ASC } }
            pagination: { limit: 2, page: 2 }
            groupBy: {
              fields: { supplier: { name: true } }
              aggregates: [
                { field: "name", function: COUNT, alias: "productCount" }
                { field: "price", function: AVG, alias: "avgPrice" }
                { field: "price", function: MIN, alias: "minPrice" }
                { field: "price", function: MAX, alias: "maxPrice" }
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
              page
              limit
              pageCount
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: complexGroupByQuery })
        .expect(200);
      
      // Expected .com suppliers in ASC order: Global Tech Corp, International Systems, Worldwide Solutions
      // With pagination page=2, limit=2: should get Worldwide Solutions (only 1 remaining)
      const data = response.body.data.productsGrouped;
      
      expect(data.groups.length).toBe(1); // Only 1 supplier on page 2
      
      // Verify pagination metadata
      expect(data.pagination.total).toBe(3); // Total .com suppliers 
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(2);
      expect(data.pagination.pageCount).toBe(2); // ceil(3/2) = 2 pages

      // Verify correct supplier in ASC order (page 2: only Worldwide Solutions)
      const group1 = data.groups[0]; // Should be Worldwide Solutions
      
      expect(group1.key.supplier_name).toBe('Worldwide Solutions');

      // Verify complex aggregations for Worldwide Solutions
      const worldwideAggregates = group1.aggregates;
      
      // Worldwide Solutions: 4 products with prices 375, 400, 425, 450 | stocks 3, 6, 9, 12
      expect(worldwideAggregates.productCount).toBe(4);
      expect(worldwideAggregates.avgPrice).toBe(412.5); // (375+400+425+450)/4
      expect(worldwideAggregates.minPrice).toBe(375);
      expect(worldwideAggregates.maxPrice).toBe(450);
      expect(worldwideAggregates.totalStock).toBe(30); // 3+6+9+12
    });
  });
});