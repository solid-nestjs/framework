import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('GraphQL CRUD App (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/graphql (POST) - create product', () => {
    const createProductMutation = `
      mutation {
        createProduct(createProductInput: {
          name: "Test Product"
          description: "A test product"
          price: 29.99
          stock: 100
        }) {
          id
          name
          description
          price
          stock
        }
      }
    `;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: createProductMutation })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.createProduct).toBeDefined();
        expect(res.body.data.createProduct.name).toBe('Test Product');
        expect(res.body.data.createProduct.price).toBe(29.99);
      });
  });

  it('/graphql (POST) - get all products', () => {
    const getAllProductsQuery = `
      query {
        products {
          id
          name
          description
          price
          stock
        }
      }
    `;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ query: getAllProductsQuery })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.products).toBeDefined();
        expect(Array.isArray(res.body.data.products)).toBe(true);
      });
  });
});
