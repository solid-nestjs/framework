import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('REST API GroupBy Functionality (e2e)', () => {
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
    it('should group products by supplier with count aggregate via REST API', async () => {
      // Create suppliers
      const supplier1Response = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'Tech Supplier',
          contactEmail: 'tech@supplier.com'
        })
        .expect(201);

      const supplier2Response = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'Office Supplier',
          contactEmail: 'office@supplier.com'
        })
        .expect(201);

      const supplier1 = supplier1Response.body;
      const supplier2 = supplier2Response.body;

      // Create products for supplier 1
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Gaming Laptop',
          description: 'High-end gaming laptop',
          price: 1500,
          stock: 10,
          supplier: { id: supplier1.id }
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Business Laptop',
          description: 'Professional laptop',
          price: 1200,
          stock: 15,
          supplier: { id: supplier1.id }
        })
        .expect(201);

      // Create products for supplier 2
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Office Chair',
          description: 'Ergonomic office chair',
          price: 300,
          stock: 25,
          supplier: { id: supplier2.id }
        })
        .expect(201);

      // Test: Group products by supplier with count aggregate
      const groupByQuery = {
        groupBy: {
          fields: { 
            supplier: { name: true } 
          },
          aggregates: [
            { field: 'name', function: 'COUNT', alias: 'totalProducts' },
            { field: 'price', function: 'AVG', alias: 'avgPrice' }
          ]
        }
      };

      const response = await request(app.getHttpServer())
        .get('/products/grouped')
        .query('groupBy=' + encodeURIComponent(JSON.stringify(groupByQuery.groupBy)));
      
      if (response.status !== 200) {
        console.log('Error response:', JSON.stringify(response.body, null, 2));
      }
      
      expect(response.status).toBe(200);

      // Verify the response structure
      expect(response.body).toHaveProperty('groups');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.groups)).toBe(true);
      expect(response.body.groups.length).toBe(2);

      // Verify group structure
      response.body.groups.forEach((group: any) => {
        expect(group).toHaveProperty('key');
        expect(group).toHaveProperty('aggregates');
        expect(typeof group.key).toBe('object');
        expect(typeof group.aggregates).toBe('object');

        // Verify content directly from objects
        const key = group.key;
        const aggregates = group.aggregates;

        expect(key).toHaveProperty('supplier_name');
        expect(aggregates).toHaveProperty('totalProducts');
        expect(aggregates).toHaveProperty('avgPrice');
      });

      // Verify pagination info
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination.total).toBe(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBeUndefined(); // No pagination specified
    });

    it('should handle empty results for grouped queries via REST API', async () => {
      // Test: Group query with no data
      const groupByQuery = {
        fields: { name: true },
        aggregates: [
          { field: 'name', function: 'COUNT', alias: 'totalProducts' }
        ]
      };

      const response = await request(app.getHttpServer())
        .get('/products/grouped')
        .query('groupBy=' + encodeURIComponent(JSON.stringify(groupByQuery)))
        .expect(200);

      expect(response.body).toHaveProperty('groups');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.groups)).toBe(true);
      expect(response.body.groups.length).toBe(0);
      expect(response.body.pagination.total).toBe(0);
    });

    it('should handle pagination in grouped queries via REST API', async () => {
      // Create supplier
      const supplierResponse = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'Test Supplier',
          contactEmail: 'test@supplier.com'
        })
        .expect(201);

      const supplier = supplierResponse.body;

      // Create multiple products with different names to create multiple groups
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

      // Test: Group by name with pagination
      const groupByArgs = {
        groupBy: {
          fields: { name: true },
          aggregates: [
            { field: 'name', function: 'COUNT', alias: 'totalProducts' }
          ]
        },
        pagination: { limit: 2 }
      };

      const response = await request(app.getHttpServer())
        .get('/products/grouped')
        .query('groupBy=' + encodeURIComponent(JSON.stringify(groupByArgs.groupBy)) + '&pagination=' + encodeURIComponent(JSON.stringify(groupByArgs.pagination)))
        .expect(200);

      expect(response.body.groups.length).toBe(2); // Limited by pagination
      expect(response.body.pagination.total).toBe(5); // Total groups available
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.pageCount).toBe(3);
    });

    it('should filter products before grouping via REST API', async () => {
      // Create suppliers
      const supplier1Response = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'Premium Electronics',
          contactEmail: 'premium@electronics.com'
        })
        .expect(201);

      const supplier2Response = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'Budget Electronics',
          contactEmail: 'budget@electronics.com'
        })
        .expect(201);

      const supplier1 = supplier1Response.body;
      const supplier2 = supplier2Response.body;

      // Create products with different price ranges
      const products = [
        { name: 'Expensive Laptop', price: 2000, stock: 5, supplierId: supplier1.id },
        { name: 'Mid Laptop', price: 800, stock: 10, supplierId: supplier1.id },
        { name: 'Budget Mouse', price: 25, stock: 50, supplierId: supplier2.id },
        { name: 'Budget Keyboard', price: 40, stock: 30, supplierId: supplier2.id }
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

      // Test: Group by supplier, filter products with price >= 500
      const groupByQuery = {
        fields: { supplier: { name: true } },
        aggregates: [
          { field: 'name', function: 'COUNT', alias: 'productCount' },
          { field: 'price', function: 'MIN', alias: 'minPrice' }
        ]
      };

      const whereFilter = { price: { _gte: 500 } };

      const response = await request(app.getHttpServer())
        .get('/products/grouped')
        .query('groupBy=' + encodeURIComponent(JSON.stringify(groupByQuery)) +
               '&where=' + encodeURIComponent(JSON.stringify(whereFilter)))
        .expect(200);

      // Should only have Premium Electronics group (2 products >= 500)
      expect(response.body.groups.length).toBe(1);
      
      const group = response.body.groups[0];
      const key = group.key;
      const aggregates = group.aggregates;
      
      expect(key.supplier_name).toBe('Premium Electronics');
      expect(aggregates.productCount).toBe(2); // Expensive Laptop, Mid Laptop
      expect(aggregates.minPrice).toBe(800); // Min of 2000, 800
    });

    it('should order grouped results by supplier name via REST API', async () => {
      // Create suppliers with names for testing ordering
      const suppliers = ['Zebra Tech', 'Alpha Corp', 'Beta Inc'];
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

      // Create one product for each supplier
      for (let i = 0; i < suppliers.length; i++) {
        await request(app.getHttpServer())
          .post('/products')
          .send({
            name: `Product ${i + 1}`,
            description: `Product for ${suppliers[i]}`,
            price: (i + 1) * 100,
            stock: 10,
            supplier: { id: supplierIds[i] }
          })
          .expect(201);
      }

      // Test: Group by supplier, order by supplier name ASC
      const groupByQuery = {
        fields: { supplier: { name: true } },
        aggregates: [
          { field: 'price', function: 'MAX', alias: 'maxPrice' }
        ]
      };

      const orderBy = [{ supplier: { name: 'ASC' } }];

      const response = await request(app.getHttpServer())
        .get('/products/grouped')
        .query('groupBy=' + encodeURIComponent(JSON.stringify(groupByQuery)) +
               '&orderBy=' + encodeURIComponent(JSON.stringify(orderBy)))
        .expect(200);

      expect(response.body.groups.length).toBe(3);
      
      // Verify alphabetical ordering: Alpha Corp, Beta Inc, Zebra Tech
      const groupNames = response.body.groups.map((group: any) => group.key.supplier_name);
      expect(groupNames).toEqual(['Alpha Corp', 'Beta Inc', 'Zebra Tech']);
    });

    it('should combine filtering and ordering via REST API', async () => {
      // Create supplier
      const supplierResponse = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'Combo Test Supplier',
          contactEmail: 'combo@test.com'
        })
        .expect(201);

      const supplier = supplierResponse.body;

      // Create products with varying stock levels and names for ordering test
      const products = [
        { name: 'Product A Low', stock: 5, price: 100 },
        { name: 'Product Z High', stock: 25, price: 100 },
        { name: 'Product B Low', stock: 3, price: 100 },
        { name: 'Product Y High', stock: 20, price: 100 },
        { name: 'Product M Med', stock: 12, price: 100 }
      ];

      for (const product of products) {
        await request(app.getHttpServer())
          .post('/products')
          .send({
            name: product.name,
            description: 'Combo test product',
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
          { field: 'stock', function: 'AVG', alias: 'avgStock' }
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

      expect(response.body.groups.length).toBe(3); // Products with stock >= 10
      
      // Verify DESC ordering: Z, Y, M (excluding A and B which have stock < 10)
      const groupNames = response.body.groups.map((group: any) => group.key.name);
      expect(groupNames).toEqual(['Product Z High', 'Product Y High', 'Product M Med']);
    });
  });
});