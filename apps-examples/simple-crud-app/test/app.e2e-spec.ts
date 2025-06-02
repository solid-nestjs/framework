import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../src/products/products.module';
import { SuppliersModule } from '../src/suppliers/suppliers.module';
import { Product } from '../src/products/entities/product.entity';
import { Supplier } from '../src/suppliers/entities/supplier.entity';

describe('Simple CRUD App (e2e)', () => {
  let app: INestApplication<App>;
  let supplierId: string;
  let productId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Product, Supplier],
          synchronize: true,
          dropSchema: true,
          logging: false,
        }),
        ProductsModule,
        SuppliersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Suppliers API', () => {
    describe('POST /suppliers', () => {
      it('should create a new supplier', async () => {
        const createSupplierDto = {
          name: 'Tech Supplies Inc',
          contactEmail: 'contact@techsupplies.com',
        };

        const response = await request(app.getHttpServer())
          .post('/suppliers')
          .send(createSupplierDto)
          .expect(201);

        expect(response.body).toMatchObject({
          id: expect.any(String),
          name: createSupplierDto.name,
          contactEmail: createSupplierDto.contactEmail,
        });

        supplierId = response.body.id;
      });

      it('should create supplier even with invalid data (validation not enabled)', async () => {
        const invalidSupplierDto = {
          name: '',
          contactEmail: 'invalid-email',
        };

        const response = await request(app.getHttpServer())
          .post('/suppliers')
          .send(invalidSupplierDto)
          .expect(201);

        expect(response.body.id).toBeDefined();
      });
    });

    describe('GET /suppliers', () => {
      it('should get all suppliers as plain array', async () => {
        const response = await request(app.getHttpServer())
          .get('/suppliers')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: supplierId,
              name: 'Tech Supplies Inc',
              contactEmail: 'contact@techsupplies.com',
            }),
          ]),
        );
      });
    });

    describe('GET /suppliers/:id', () => {
      it('should get a specific supplier', async () => {
        const response = await request(app.getHttpServer())
          .get(`/suppliers/${supplierId}`)
          .expect(200);

        expect(response.body).toMatchObject({
          id: supplierId,
          name: 'Tech Supplies Inc',
          contactEmail: 'contact@techsupplies.com',
        });
      });

      it('should return 404 for non-existent supplier', async () => {
        await request(app.getHttpServer())
          .get('/suppliers/00000000-0000-0000-0000-000000000000')
          .expect(404);
      });
    });

    describe('PUT /suppliers/:id', () => {
      it('should update a supplier using PUT method (returns 202)', async () => {
        const updateSupplierDto = {
          name: 'Updated Tech Supplies Inc',
          contactEmail: 'updated@techsupplies.com',
        };

        const response = await request(app.getHttpServer())
          .put(`/suppliers/${supplierId}`)
          .send(updateSupplierDto)
          .expect(202);

        // Verify the update was successful by fetching the supplier
        const verifyResponse = await request(app.getHttpServer())
          .get(`/suppliers/${supplierId}`)
          .expect(200);

        expect(verifyResponse.body).toMatchObject({
          id: supplierId,
          name: 'Updated Tech Supplies Inc',
          contactEmail: 'updated@techsupplies.com',
        });
      });
    });
  });

  describe('Products API', () => {
    describe('POST /products', () => {
      it('should create a new product', async () => {
        const createProductDto = {
          name: 'Laptop',
          description: 'High-performance laptop',
          price: 999.99,
          stock: 10,
          supplier: { id: supplierId },
        };

        const response = await request(app.getHttpServer())
          .post('/products')
          .send(createProductDto)
          .expect(201);

        expect(response.body).toMatchObject({
          id: expect.any(String),
          name: createProductDto.name,
          description: createProductDto.description,
          price: createProductDto.price,
          stock: createProductDto.stock,
        });

        productId = response.body.id;
      });

      it('should create product even with invalid data (validation not enabled)', async () => {
        const invalidProductDto = {
          name: '',
          description: '',
          price: -1,
          stock: -1,
        };

        const response = await request(app.getHttpServer())
          .post('/products')
          .send(invalidProductDto)
          .expect(201);

        expect(response.body.id).toBeDefined();
      });
    });

    describe('GET /products', () => {
      it('should get all products as plain array', async () => {
        const response = await request(app.getHttpServer())
          .get('/products')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: productId,
              name: 'Laptop',
              description: 'High-performance laptop',
              price: 999.99,
              stock: 10,
            }),
          ]),
        );
      });

      it('should get products with relations loaded by default', async () => {
        const response = await request(app.getHttpServer())
          .get('/products')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body[0]).toHaveProperty('supplier');
        expect(response.body[0].supplier).toMatchObject({
          id: supplierId,
          name: 'Updated Tech Supplies Inc',
        });
      });
    });

    describe('GET /products/:id', () => {
      it('should get a specific product', async () => {
        const response = await request(app.getHttpServer())
          .get(`/products/${productId}`)
          .expect(200);

        expect(response.body).toMatchObject({
          id: productId,
          name: 'Laptop',
          description: 'High-performance laptop',
          price: 999.99,
          stock: 10,
        });
      });

      it('should get a product with relations', async () => {
        const response = await request(app.getHttpServer())
          .get(`/products/${productId}`)
          .expect(200);

        expect(response.body).toHaveProperty('supplier');
        expect(response.body.supplier).toMatchObject({
          id: supplierId,
          name: 'Updated Tech Supplies Inc',
        });
      });

      it('should return 404 for non-existent product', async () => {
        await request(app.getHttpServer())
          .get('/products/00000000-0000-0000-0000-000000000000')
          .expect(404);
      });
    });

    describe('PUT /products/:id', () => {
      it('should update a product using PUT method', async () => {
        const updateProductDto = {
          name: 'Updated Laptop',
          description: 'Updated high-performance laptop',
          price: 1199.99,
          stock: 5,
          supplier: { id: supplierId },
        };

        const response = await request(app.getHttpServer())
          .put(`/products/${productId}`)
          .send(updateProductDto)
          .expect(202);

        expect(response.body).toMatchObject({
          id: productId,
          name: updateProductDto.name,
          description: updateProductDto.description,
          price: updateProductDto.price,
          stock: updateProductDto.stock,
        });
      });
    });

    describe('DELETE /products/:id', () => {
      it('should delete a product (returns 202 Accepted)', async () => {
        await request(app.getHttpServer())
          .delete(`/products/${productId}`)
          .expect(202);

        // Verify product is deleted
        await request(app.getHttpServer())
          .get(`/products/${productId}`)
          .expect(404);
      });
    });
  });

  describe('DELETE /suppliers/:id', () => {
    it('should delete a supplier (returns 202 Accepted)', async () => {
      await request(app.getHttpServer())
        .delete(`/suppliers/${supplierId}`)
        .expect(202);

      // Verify supplier is deleted
      await request(app.getHttpServer())
        .get(`/suppliers/${supplierId}`)
        .expect(404);
    });
  });

  describe('Framework Behavior Tests', () => {
    let testSupplierId: string;
    let testProductId: string;

    beforeAll(async () => {
      // Create test supplier
      const supplierResponse = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'Test Supplier',
          contactEmail: 'test@supplier.com',
        });
      testSupplierId = supplierResponse.body.id;

      // Create test product
      const productResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          description: 'Test description',
          price: 100.0,
          stock: 20,
          supplier: { id: testSupplierId },
        });
      testProductId = productResponse.body.id;
    });

    it('should handle basic API endpoints correctly', async () => {
      // Test that GET returns arrays, not paginated objects
      const suppliersResponse = await request(app.getHttpServer())
        .get('/suppliers')
        .expect(200);

      expect(Array.isArray(suppliersResponse.body)).toBe(true);

      const productsResponse = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(Array.isArray(productsResponse.body)).toBe(true);
    });

    it('should demonstrate that validation is not enforced', async () => {
      // This demonstrates that validation is not working as expected
      const invalidResponse = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: '',
          contactEmail: 'not-an-email',
        })
        .expect(201);

      expect(invalidResponse.body.id).toBeDefined();
    });

    it('should confirm DELETE operations return 202', async () => {
      const tempSupplier = await request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'Temp Supplier',
          contactEmail: 'temp@test.com',
        });

      await request(app.getHttpServer())
        .delete(`/suppliers/${tempSupplier.body.id}`)
        .expect(202);
    });

    it('should confirm PUT is used for updates, not PATCH', async () => {
      // PUT works
      await request(app.getHttpServer())
        .put(`/suppliers/${testSupplierId}`)
        .send({
          name: 'Updated Name',
          contactEmail: 'updated@test.com',
        })
        .expect(202);

      // PATCH returns 404 (method not found)
      await request(app.getHttpServer())
        .patch(`/suppliers/${testSupplierId}`)
        .send({
          name: 'Patch Update',
        })
        .expect(404);
    });

    it('should verify products load suppliers by default', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/${testProductId}`)
        .expect(200);

      expect(response.body).toHaveProperty('supplier');
      expect(response.body.supplier).toMatchObject({
        id: testSupplierId,
      });
    });

    afterAll(async () => {
      // Clean up test data
      try {
        await request(app.getHttpServer()).delete(`/products/${testProductId}`);
        await request(app.getHttpServer()).delete(
          `/suppliers/${testSupplierId}`,
        );
      } catch (error) {
        // Ignore cleanup errors
      }
    });
  });
});
