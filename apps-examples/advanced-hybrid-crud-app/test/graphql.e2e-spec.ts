import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { createTestDataSource, cleanupTestData, destroyTestDataSource } from './test-database.config';

describe('GraphQL Soft Deletion E2E Tests', () => {
  let app: INestApplication;

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
    await app.init();
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

  describe('Supplier GraphQL Soft Deletion Operations', () => {
    describe('softRemoveSupplier mutation', () => {
      it('should soft delete a supplier via GraphQL', async () => {
        // First create a supplier
        const createMutation = `
          mutation {
            createSupplier(createInput: {
              name: "GraphQL Soft Delete Supplier"
              contactEmail: "graphql.softdelete@supplier.com"
            }) {
              id
              name
              contactEmail
            }
          }
        `;

        const createResponse = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: createMutation })
          .expect(200);

        const supplierId = createResponse.body.data.createSupplier.id;

        // Soft delete the supplier
        const softRemoveMutation = `
          mutation {
            softRemoveSupplier(id: "${supplierId}") {
              id
              name
              contactEmail
            }
          }
        `;

        const softRemoveResponse = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: softRemoveMutation })
          .expect(200);

        expect(softRemoveResponse.body.data.softRemoveSupplier).toEqual({
          id: supplierId,
          name: 'GraphQL Soft Delete Supplier',
          contactEmail: 'graphql.softdelete@supplier.com',
        });

        // Verify supplier is not returned in normal queries (soft deleted)
        const findQuery = `
          query {
            supplier(id: "${supplierId}") {
              id
              name
              contactEmail
            }
          }
        `;

        const findResponse = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: findQuery })
          .expect(200);

        expect(findResponse.body.errors).toBeDefined();
        expect(findResponse.body.errors[0].message).toContain('not found');
      });

      it('should handle non-existent supplier in softRemove', async () => {
        const softRemoveMutation = `
          mutation {
            softRemoveSupplier(id: "non-existent-id") {
              id
              name
              contactEmail
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: softRemoveMutation })
          .expect(200);

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toContain(
          'Validation failed (uuid is expected)',
        );
      });
    });

    describe('recoverSupplier mutation', () => {
      it('should recover a soft deleted supplier via GraphQL', async () => {
        // First create a supplier
        const createMutation = `
          mutation {
            createSupplier(createInput: {
              name: "GraphQL Recovery Supplier"
              contactEmail: "graphql.recovery@supplier.com"
            }) {
              id
              name
              contactEmail
            }
          }
        `;

        const createResponse = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: createMutation })
          .expect(200);

        const supplierId = createResponse.body.data.createSupplier.id;

        // Soft delete the supplier first
        const softRemoveMutation = `
          mutation {
            softRemoveSupplier(id: "${supplierId}") {
              id
            }
          }
        `;

        await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: softRemoveMutation })
          .expect(200);

        // Now recover the supplier
        const recoverMutation = `
          mutation {
            recoverSupplier(id: "${supplierId}") {
              id
              name
              contactEmail
            }
          }
        `;

        const recoverResponse = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: recoverMutation })
          .expect(200);

        expect(recoverResponse.body.data.recoverSupplier).toEqual({
          id: supplierId,
          name: 'GraphQL Recovery Supplier',
          contactEmail: 'graphql.recovery@supplier.com',
        });

        // Verify supplier is accessible again after recovery
        const findQuery = `
          query {
            supplier(id: "${supplierId}") {
              id
              name
              contactEmail
            }
          }
        `;

        const findResponse = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: findQuery })
          .expect(200);

        expect(findResponse.body.data.supplier).toEqual({
          id: supplierId,
          name: 'GraphQL Recovery Supplier',
          contactEmail: 'graphql.recovery@supplier.com',
        });
      });
    });

    describe('hardRemoveSupplier mutation', () => {
      it('should permanently delete a supplier via GraphQL', async () => {
        // First create a supplier
        const createMutation = `
          mutation {
            createSupplier(createInput: {
              name: "GraphQL Hard Delete Supplier"
              contactEmail: "graphql.harddelete@supplier.com"
            }) {
              id
              name
              contactEmail
            }
          }
        `;

        const createResponse = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: createMutation })
          .expect(200);

        const supplierId = createResponse.body.data.createSupplier.id;

        // Hard delete the supplier
        const hardRemoveMutation = `
          mutation {
            hardRemoveSupplier(id: "${supplierId}") {
              id
              name
              contactEmail
            }
          }
        `;

        const hardRemoveResponse = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: hardRemoveMutation })
          .expect(200);

        expect(hardRemoveResponse.body.data.hardRemoveSupplier).toEqual({
          id: supplierId,
          name: 'GraphQL Hard Delete Supplier',
          contactEmail: 'graphql.harddelete@supplier.com',
        });

        // Verify supplier is completely removed
        const findQuery = `
          query {
            supplier(id: "${supplierId}") {
              id
              name
              contactEmail
            }
          }
        `;

        const findResponse = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: findQuery })
          .expect(200);

        expect(findResponse.body.errors).toBeDefined();
        expect(findResponse.body.errors[0].message).toContain('not found');
      });
    });

    describe('Soft Deletion with Related Entities via GraphQL', () => {
      it('should cascade soft delete to related products when supplier is soft deleted via GraphQL', async () => {
        // Create a supplier
        const createSupplierMutation = `
          mutation {
            createSupplier(createInput: {
              name: "GraphQL Cascade Supplier"
              contactEmail: "graphql.cascade@supplier.com"
            }) {
              id
              name
              contactEmail
            }
          }
        `;

        const supplierResponse = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: createSupplierMutation })
          .expect(200);

        const supplierId = supplierResponse.body.data.createSupplier.id;

        // Create a product for this supplier
        const createProductMutation = `
          mutation {
            createProduct(createInput: {
              name: "GraphQL Cascade Product"
              description: "A product for GraphQL cascade testing"
              price: 199.99
              stock: 5
              supplier: { id: "${supplierId}" }
            }) {
              id
              name
              description
              price
              stock
              supplier {
                id
              }
            }
          }
        `;

        const productResponse = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: createProductMutation })
          .expect(200);

        const productId = productResponse.body.data.createProduct.id;

        // Soft delete the supplier via GraphQL
        const softRemoveSupplierMutation = `
          mutation {
            softRemoveSupplier(id: "${supplierId}") {
              id
            }
          }
        `;

        await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: softRemoveSupplierMutation })
          .expect(200);

        // Verify supplier is soft deleted
        const findSupplierQuery = `
          query {
            supplier(id: "${supplierId}") {
              id
            }
          }
        `;

        const supplierFindResponse = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: findSupplierQuery })
          .expect(200);

        expect(supplierFindResponse.body.errors).toBeDefined();

        // Verify related product is also soft deleted (cascade behavior)
        const findProductQuery = `
          query {
            product(id: "${productId}") {
              id
            }
          }
        `;

        const productFindResponse = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: findProductQuery })
          .expect(200);

        expect(productFindResponse.body.errors).toBeDefined();
      });

      it('should cascade recover to related products when supplier is recovered via GraphQL', async () => {
        // Create a supplier
        const createSupplierMutation = `
          mutation {
            createSupplier(createInput: {
              name: "GraphQL Cascade Recovery Supplier"
              contactEmail: "graphql.cascade.recovery@supplier.com"
            }) {
              id
              name
              contactEmail
            }
          }
        `;

        const supplierResponse = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: createSupplierMutation })
          .expect(200);

        const supplierId = supplierResponse.body.data.createSupplier.id;

        // Create a product for this supplier
        const createProductMutation = `
          mutation {
            createProduct(createInput: {
              name: "GraphQL Cascade Recovery Product"
              description: "A product for GraphQL cascade recovery testing"
              price: 299.99
              stock: 3
              supplier: { id: "${supplierId}" }
            }) {
              id
              name
              supplier {
                id
              }
            }
          }
        `;

        const productResponse = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: createProductMutation })
          .expect(200);

        const productId = productResponse.body.data.createProduct.id;

        // Soft delete the supplier
        const softRemoveSupplierMutation = `
          mutation {
            softRemoveSupplier(id: "${supplierId}") {
              id
            }
          }
        `;

        await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: softRemoveSupplierMutation })
          .expect(200);

        // Now recover the supplier via GraphQL
        const recoverSupplierMutation = `
          mutation {
            recoverSupplier(id: "${supplierId}") {
              id
              name
              contactEmail
            }
          }
        `;

        const recoverResponse = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: recoverSupplierMutation })
          .expect(200);

        expect(recoverResponse.body.data.recoverSupplier).toEqual({
          id: supplierId,
          name: 'GraphQL Cascade Recovery Supplier',
          contactEmail: 'graphql.cascade.recovery@supplier.com',
        });

        // Verify supplier is accessible again
        const findSupplierQuery = `
          query {
            supplier(id: "${supplierId}") {
              id
              name
              contactEmail
            }
          }
        `;

        const supplierFindResponse = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: findSupplierQuery })
          .expect(200);

        expect(supplierFindResponse.body.data.supplier).toEqual({
          id: supplierId,
          name: 'GraphQL Cascade Recovery Supplier',
          contactEmail: 'graphql.cascade.recovery@supplier.com',
        });

        // Verify related product is also recovered (cascade behavior)
        const findProductQuery = `
          query {
            product(id: "${productId}") {
              id
              name
              supplier {
                id
              }
            }
          }
        `;

        const productFindResponse = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: findProductQuery })
          .expect(200);

        expect(productFindResponse.body.data.product).toEqual({
          id: productId,
          name: 'GraphQL Cascade Recovery Product',
          supplier: {
            id: supplierId,
          },
        });
      });
    });

    describe('GraphQL Error Handling', () => {
      it('should handle validation errors in GraphQL mutations', async () => {
        // Test with invalid input (missing required fields)
        const invalidCreateMutation = `
          mutation {
            createSupplier(createInput: {
              contactEmail: "invalid-email-format"
            }) {
              id
              name
              contactEmail
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: invalidCreateMutation })
          .expect(400);

        expect(response.body.errors).toBeDefined();
      });

      it('should handle invalid ID format in GraphQL mutations', async () => {
        const softRemoveMutation = `
          mutation {
            softRemoveSupplier(id: "invalid-uuid-format") {
              id
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: softRemoveMutation })
          .expect(200);

        expect(response.body.errors).toBeDefined();
      });
    });
  });
});
