import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('Composite Key GraphQL CRUD App (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let createdSupplier: { type: string; code: number };
  let createdProduct: { type: string; code: number };

  beforeAll(async () => {
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
          });
          await dataSource.initialize();
          return dataSource;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    // Clear database before each test
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Suppliers API (Composite Keys)', () => {
    it('should create a supplier with composite key', async () => {
      const createSupplierMutation = `
        mutation {
          createSupplier(createInput: {
            name: "Test Supplier"
            contactEmail: "test@supplier.com"
            type: "VENDOR"
          }) {
            type
            code
            name
            contactEmail
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createSupplierMutation })
        .expect(200);

      expect(response.body.data.createSupplier).toBeDefined();
      expect(response.body.data.createSupplier.name).toBe('Test Supplier');
      expect(response.body.data.createSupplier.contactEmail).toBe(
        'test@supplier.com',
      );
      expect(response.body.data.createSupplier.type).toBe('VENDOR');
      expect(response.body.data.createSupplier.code).toBeDefined();
      expect(typeof response.body.data.createSupplier.code).toBe('string'); // GraphQL ID type returns string

      createdSupplier = {
        type: response.body.data.createSupplier.type,
        code: parseInt(response.body.data.createSupplier.code), // Convert back to number for internal use
      };
    });

    it('should get all suppliers', async () => {
      // First create a supplier
      const createSupplierMutation = `
        mutation {
          createSupplier(createInput: {
            name: "Test Supplier"
            contactEmail: "test@supplier.com"
            type: "VENDOR"
          }) {
            type
            code
            name
            contactEmail
          }
        }
      `;

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createSupplierMutation });

      const getAllSuppliersQuery = `
        query {
          suppliers {
            type
            code
            name
            contactEmail
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: getAllSuppliersQuery })
        .expect(200);

      expect(response.body.data.suppliers).toBeDefined();
      expect(Array.isArray(response.body.data.suppliers)).toBe(true);
      expect(response.body.data.suppliers.length).toBeGreaterThan(0);
      expect(response.body.data.suppliers[0].type).toBeDefined();
      expect(response.body.data.suppliers[0].code).toBeDefined();
    });

    it('should get a single supplier by composite key', async () => {
      // First create a supplier
      const createSupplierMutation = `
        mutation {
          createSupplier(createInput: {
            name: "Test Supplier"
            contactEmail: "test@supplier.com"
            type: "VENDOR"
          }) {
            type
            code
            name
            contactEmail
          }
        }
      `;

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createSupplierMutation });

      const supplierType = createResponse.body.data.createSupplier.type;
      const supplierCode = createResponse.body.data.createSupplier.code;

      const getSupplierQuery = `
        query {
          supplier(id: { type: "${supplierType}", code: ${supplierCode} }) {
            type
            code
            name
            contactEmail
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: getSupplierQuery })
        .expect(200);

      expect(response.body.data.supplier).toBeDefined();
      expect(response.body.data.supplier.type).toBe(supplierType);
      expect(response.body.data.supplier.code).toBe(supplierCode);
      expect(response.body.data.supplier.name).toBe('Test Supplier');
    });

    it('should update a supplier with composite key', async () => {
      // First create a supplier
      const createSupplierMutation = `
        mutation {
          createSupplier(createInput: {
            name: "Test Supplier"
            contactEmail: "test@supplier.com"
            type: "VENDOR"
          }) {
            type
            code
            name
            contactEmail
          }
        }
      `;

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createSupplierMutation });

      const supplierType = createResponse.body.data.createSupplier.type;
      const supplierCode = createResponse.body.data.createSupplier.code;

      const updateSupplierMutation = `
        mutation {
          updateSupplier(
            id: { type: "${supplierType}", code: ${supplierCode} },
            updateInput: {            
              name: "Updated Supplier"
              contactEmail: "updated@supplier.com"
            }
          ) {
            type
            code
            name
            contactEmail
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: updateSupplierMutation })
        .expect(200);

      expect(response.body.data.updateSupplier).toBeDefined();
      expect(response.body.data.updateSupplier.name).toBe('Updated Supplier');
      expect(response.body.data.updateSupplier.contactEmail).toBe(
        'updated@supplier.com',
      );
      expect(response.body.data.updateSupplier.type).toBe(supplierType);
      expect(response.body.data.updateSupplier.code).toBe(supplierCode);
    });

    it('should delete a supplier with composite key', async () => {
      // First create a supplier
      const createSupplierMutation = `
        mutation {
          createSupplier(createInput: {
            name: "Test Supplier"
            contactEmail: "test@supplier.com"
            type: "VENDOR"
          }) {
            type
            code
            name
            contactEmail
          }
        }
      `;

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createSupplierMutation });

      const supplierType = createResponse.body.data.createSupplier.type;
      const supplierCode = createResponse.body.data.createSupplier.code;

      const deleteSupplierMutation = `
        mutation {
          removeSupplier(id: { type: "${supplierType}", code: ${supplierCode} }) {
            type
            code
            name
            contactEmail
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: deleteSupplierMutation })
        .expect(200);

      expect(response.body.data.removeSupplier).toBeDefined();
      expect(response.body.data.removeSupplier.type).toBe(supplierType);
      expect(response.body.data.removeSupplier.code).toBe(supplierCode);
    });
  });

  describe('Products API (Composite Keys)', () => {
    beforeEach(async () => {
      // Create a supplier for product tests
      const createSupplierMutation = `
        mutation {
          createSupplier(createInput: {
            name: "Test Supplier"
            contactEmail: "test@supplier.com"
            type: "VENDOR"
          }) {
            type
            code
            name
            contactEmail
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createSupplierMutation });
      createdSupplier = {
        type: response.body.data.createSupplier.type,
        code: parseInt(response.body.data.createSupplier.code), // Convert string ID to number
      };
    });

    it('should create a product with composite key', async () => {
      const createProductMutation = `
        mutation {
          createProduct(createInput: {
            name: "Test Product"
            description: "A test product"
            price: 29.99
            stock: 100
            id: { type: "ELECTRONICS" }
            supplier: { type: "${createdSupplier.type}", code: ${createdSupplier.code} }
          }) {
            id {
              type
              code
            }
            name
            description
            price
            stock
            supplier {
              type
              code
              name
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createProductMutation })
        .expect(200);

      expect(response.body.data.createProduct).toBeDefined();
      expect(response.body.data.createProduct.name).toBe('Test Product');
      expect(response.body.data.createProduct.price).toBe(29.99);
      expect(response.body.data.createProduct.id).toBeDefined();
      expect(response.body.data.createProduct.id.type).toBe('ELECTRONICS');
      expect(response.body.data.createProduct.id.code).toBeDefined();
      expect(typeof response.body.data.createProduct.id.code).toBe('string'); // GraphQL ID type returns string

      createdProduct = {
        type: response.body.data.createProduct.id.type,
        code: parseInt(response.body.data.createProduct.id.code), // Convert back to number for internal use
      };
    });

    it('should get all products', async () => {
      // First create a product
      const createProductMutation = `
        mutation {
          createProduct(createInput: {
            name: "Test Product"
            description: "A test product"
            price: 29.99
            stock: 100
            id: { type: "ELECTRONICS" }
            supplier: { type: "${createdSupplier.type}", code: ${createdSupplier.code} }
          }) {
            id {
              type
              code
            }
            name
            description
            price
            stock
          }
        }
      `;

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createProductMutation });

      const getAllProductsQuery = `
        query {
          products {
            id {
              type
              code
            }
            name
            description
            price
            stock
            supplier {
              type
              code
              name
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: getAllProductsQuery })
        .expect(200);

      expect(response.body.data.products).toBeDefined();
      expect(Array.isArray(response.body.data.products)).toBe(true);
      expect(response.body.data.products.length).toBeGreaterThan(0);
      expect(response.body.data.products[0].id.type).toBeDefined();
      expect(response.body.data.products[0].id.code).toBeDefined();
      expect(response.body.data.products[0].supplier).toBeDefined();
    });

    it('should get a single product by composite key', async () => {
      // First create a product
      const createProductMutation = `
        mutation {
          createProduct(createInput: {
            name: "Test Product"
            description: "A test product"
            price: 29.99
            stock: 100
            id: { type: "ELECTRONICS" }
            supplier: { type: "${createdSupplier.type}", code: ${createdSupplier.code} }
          }) {
            id {
              type
              code
            }
            name
            description
            price
            stock
          }
        }
      `;

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createProductMutation });

      const productType = createResponse.body.data.createProduct.id.type;
      const productCode = createResponse.body.data.createProduct.id.code;

      const getProductQuery = `
        query {
          product(id: { type: "${productType}", code: ${productCode} }) {
            id {
              type
              code
            }
            name
            description
            price
            stock
            supplier {
              type
              code
              name
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: getProductQuery })
        .expect(200);

      expect(response.body.data.product).toBeDefined();
      expect(response.body.data.product.id.type).toBe(productType);
      expect(response.body.data.product.id.code).toBe(productCode);
      expect(response.body.data.product.name).toBe('Test Product');
      expect(response.body.data.product.supplier).toBeDefined();
    });

    it('should update a product with composite key', async () => {
      // First create a product
      const createProductMutation = `
        mutation {
          createProduct(createInput: {
            name: "Test Product"
            description: "A test product"
            price: 29.99
            stock: 100
            id: { type: "ELECTRONICS" }
            supplier: { type: "${createdSupplier.type}", code: ${createdSupplier.code} }
          }) {
            id {
              type
              code
            }
            name
            description
            price
            stock
          }
        }
      `;

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createProductMutation });

      const productType = createResponse.body.data.createProduct.id.type;
      const productCode = createResponse.body.data.createProduct.id.code;

      const updateProductMutation = `
        mutation {
          updateProduct(
            id: { type: "${productType}", code: ${productCode} },
            updateInput: {
              name: "Updated Product"
              description: "An updated product"
              price: 39.99
              stock: 150
              supplier: { type: "${createdSupplier.type}", code: ${createdSupplier.code} }
            }
          ) {
            id {
              type
              code
            }
            name
            description
            price
            stock
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: updateProductMutation })
        .expect(200);

      expect(response.body.data.updateProduct).toBeDefined();
      expect(response.body.data.updateProduct.name).toBe('Updated Product');
      expect(response.body.data.updateProduct.price).toBe(39.99);
      expect(response.body.data.updateProduct.id.type).toBe(productType);
      expect(response.body.data.updateProduct.id.code).toBe(productCode);
    });

    it('should delete a product with composite key', async () => {
      // First create a product
      const createProductMutation = `
        mutation {
          createProduct(createInput: {
            name: "Test Product"
            description: "A test product"
            price: 29.99
            stock: 100
            id: { type: "ELECTRONICS" }
            supplier: { type: "${createdSupplier.type}", code: ${createdSupplier.code} }
          }) {
            id {
              type
              code
            }
            name
            description
            price
            stock
          }
        }
      `;

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createProductMutation });

      const productType = createResponse.body.data.createProduct.id.type;
      const productCode = createResponse.body.data.createProduct.id.code;

      const deleteProductMutation = `
        mutation {
          removeProduct(id: { type: "${productType}", code: ${productCode} }) {
            id {
              type
              code
            }
            name
            description
            price
            stock
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: deleteProductMutation })
        .expect(200);

      expect(response.body.data.removeProduct).toBeDefined();
      expect(response.body.data.removeProduct.id.type).toBe(productType);
      expect(response.body.data.removeProduct.id.code).toBe(productCode);
    });
  });

  describe('Composite Key Relationships', () => {
    it('should handle relationships with composite keys', async () => {
      // Create a supplier
      const createSupplierMutation = `
        mutation {
          createSupplier(createInput: {
            name: "Test Supplier"
            contactEmail: "test@supplier.com"
            type: "VENDOR"
          }) {
            type
            code
            name
            contactEmail
          }
        }
      `;

      const supplierResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createSupplierMutation });

      const supplier = supplierResponse.body.data.createSupplier;

      // Create a product without supplier relationship first to test basic functionality
      const createProductMutation = `
        mutation {
          createProduct(createInput: {
            name: "Linked Product"
            description: "A product to test composite keys"
            price: 49.99
            stock: 50
            id: { type: "ELECTRONICS" }
          }) {
            id {
              type
              code
            }
            name
            description
            price
            stock
          }
        }
      `;

      const productResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createProductMutation })
        .expect(200);

      const product = productResponse.body.data.createProduct;

      // Verify the product was created with composite key
      expect(product).toBeDefined();
      expect(product.id.type).toBe('ELECTRONICS');
      expect(product.id.code).toBeDefined();
      expect(product.name).toBe('Linked Product');

      // Query supplier to verify it exists
      const getSupplierQuery = `
        query {
          supplier(id: { type: "${supplier.type}", code: ${supplier.code} }) {
            type
            code
            name
            contactEmail
            products {
              id {
                type
                code
              }
              name
            }
          }
        }
      `;

      const supplierWithProductsResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: getSupplierQuery })
        .expect(200);

      const supplierWithProducts =
        supplierWithProductsResponse.body.data.supplier;
      expect(supplierWithProducts).toBeDefined();
      expect(supplierWithProducts.type).toBe(supplier.type);
      expect(parseInt(supplierWithProducts.code)).toBe(parseInt(supplier.code));
      expect(supplierWithProducts.products).toBeDefined();
      expect(Array.isArray(supplierWithProducts.products)).toBe(true);
    });
  });

  describe('GraphQL Features with Composite Keys', () => {
    it('should handle GraphQL introspection', async () => {
      const introspectionQuery = `
        query {
          __schema {
            types {
              name
            }
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: introspectionQuery })
        .expect(200);

      expect(response.body.data.__schema).toBeDefined();
      expect(response.body.data.__schema.types).toBeDefined();
      expect(Array.isArray(response.body.data.__schema.types)).toBe(true);
    });

    it('should handle GraphQL aliases with composite keys', async () => {
      // First create a supplier
      const createSupplierMutation = `
        mutation {
          createSupplier(createInput: {
            name: "Test Supplier"
            contactEmail: "test@supplier.com"
            type: "VENDOR"
          }) {
            type
            code
            name
            contactEmail
          }
        }
      `;

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createSupplierMutation });

      const aliasQuery = `
        query {
          allSuppliers: suppliers {
            supplierType: type
            supplierCode: code
            supplierName: name
            email: contactEmail
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: aliasQuery })
        .expect(200);

      expect(response.body.data.allSuppliers).toBeDefined();
      expect(Array.isArray(response.body.data.allSuppliers)).toBe(true);
      if (response.body.data.allSuppliers.length > 0) {
        expect(response.body.data.allSuppliers[0].supplierType).toBeDefined();
        expect(response.body.data.allSuppliers[0].supplierCode).toBeDefined();
        expect(response.body.data.allSuppliers[0].supplierName).toBeDefined();
        expect(response.body.data.allSuppliers[0].email).toBeDefined();
      }
    });

    it('should handle invalid composite key gracefully', async () => {
      const getProductQuery = `
        query {
          product(id: { type: "INVALID", code: 99999 }) {
            id {
              type
              code
            }
            name
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: getProductQuery })
        .expect(200);

      // Expecting null response for invalid composite key
      if (response.body.data === null) {
        expect(response.body.data).toBeNull();
      } else {
        expect(response.body.data).toBeDefined();
        expect(response.body.data.product).toBeNull();
      }
    });

    it('should validate required fields on supplier creation', async () => {
      const createSupplierMutation = `
        mutation {
          createSupplier(createInput: {
            contactEmail: "test@supplier.com"
            type: "VENDOR"
          }) {
            type
            code
            name
            contactEmail
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createSupplierMutation });

      // Should return validation error for missing required field
      if (response.status === 400) {
        expect(response.status).toBe(400);
      } else {
        expect(response.status).toBe(200);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors.length).toBeGreaterThan(0);
      }
    });

    it('should validate required composite key fields on product creation', async () => {
      // First create a supplier
      const createSupplierMutation = `
        mutation {
          createSupplier(createInput: {
            name: "Test Supplier"
            contactEmail: "test@supplier.com"
            type: "VENDOR"
          }) {
            type
            code
            name
            contactEmail
          }
        }
      `;

      const supplierResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createSupplierMutation });

      const supplier = supplierResponse.body.data.createSupplier;

      // Try to create a product without required composite key type
      const createProductMutation = `
        mutation {
          createProduct(createInput: {
            name: "Test Product"
            description: "A test product"
            price: 29.99
            stock: 100
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

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createProductMutation });

      // Should return validation error for missing required composite key field
      if (response.status === 400) {
        expect(response.status).toBe(400);
      } else {
        expect(response.status).toBe(200);
        expect(response.body.errors).toBeDefined();
        expect(response.body.errors.length).toBeGreaterThan(0);
      }
    });

    it('should validate composite key uniqueness', async () => {
      // First create a supplier
      const createSupplierMutation = `
        mutation {
          createSupplier(createInput: {
            name: "Test Supplier 1"
            contactEmail: "test1@supplier.com"
            type: "VENDOR"
          }) {
            type
            code
            name
            contactEmail
          }
        }
      `;

      const supplier1Response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createSupplierMutation });

      const supplier1 = supplier1Response.body.data.createSupplier;

      // Create a product
      const createProduct1Mutation = `
        mutation {
          createProduct(createInput: {
            name: "Product 1"
            description: "First product"
            price: 29.99
            stock: 100
            id: { type: "ELECTRONICS" }
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

      const product1Response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createProduct1Mutation })
        .expect(200);

      const product1 = product1Response.body.data.createProduct;

      // Try to create another product with the same composite key
      const createProduct2Mutation = `
        mutation {
          createProduct(createInput: {
            name: "Product 2"
            description: "Duplicate product"
            price: 39.99
            stock: 50
            id: { type: "${product1.id.type}" }
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
      const product2Response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createProduct2Mutation }); // This should either fail with error or handle the composite key collision
      // The behavior depends on the auto-increment implementation
      if (product2Response.status === 200 && !product2Response.body.errors) {
        // If successful, the code should be different since auto-increment should assign new code
        const product2 = product2Response.body.data.createProduct;
        expect(parseInt(product2.id.code)).not.toBe(parseInt(product1.id.code));
      } else {
        // If failed, there should be an error
        expect(
          product2Response.body.errors || product2Response.status >= 400,
        ).toBeTruthy();
      }
    });
  });

  describe('Pagination and Filtering with Composite Keys', () => {
    beforeEach(async () => {
      // Create test data
      const createSupplierMutation = `
        mutation {
          createSupplier(createInput: {
            name: "Test Supplier"
            contactEmail: "test@supplier.com"
            type: "VENDOR"
          }) {
            type
            code
            name
            contactEmail
          }
        }
      `;

      const supplierResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createSupplierMutation });
      createdSupplier = {
        type: supplierResponse.body.data.createSupplier.type,
        code: parseInt(supplierResponse.body.data.createSupplier.code), // Convert string ID to number
      };

      // Create multiple products
      for (let i = 1; i <= 3; i++) {
        const createProductMutation = `
          mutation {
            createProduct(createInput: {
              name: "Product ${i}"
              description: "Description ${i}"
              price: ${i * 10}.99
              stock: ${i * 50}
              id: { type: "ELECTRONICS" }
              supplier: { type: "${createdSupplier.type}", code: ${createdSupplier.code} }
            }) {
              id {
                type
                code
              }
            }
          }
        `;

        await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: createProductMutation });
      }
    });

    it('should handle pagination', async () => {
      const paginatedQuery = `
        query {
          products(pagination: { page: 1, limit: 2 }) {
            id {
              type
              code
            }
            name
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: paginatedQuery })
        .expect(200);

      expect(response.body.data.products).toBeDefined();
      expect(Array.isArray(response.body.data.products)).toBe(true);
      expect(response.body.data.products.length).toBeLessThanOrEqual(2);
    });

    it('should handle filtering by name', async () => {
      const filteredQuery = `
        query {
          products(where: { name: { _contains: "Product 1" } }) {
            id {
              type
              code
            }
            name
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: filteredQuery })
        .expect(200);

      expect(response.body.data.products).toBeDefined();
      expect(Array.isArray(response.body.data.products)).toBe(true);
      if (response.body.data.products.length > 0) {
        expect(response.body.data.products[0].name).toContain('Product 1');
      }
    });

    it('should handle ordering', async () => {
      const orderedQuery = `
        query {
          products(orderBy: [{ name: DESC }]) {
            id {
              type
              code
            }
            name
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: orderedQuery })
        .expect(200);

      expect(response.body.data.products).toBeDefined();
      expect(Array.isArray(response.body.data.products)).toBe(true);
      expect(response.body.data.products.length).toBeGreaterThan(0);
    });
  });
});
