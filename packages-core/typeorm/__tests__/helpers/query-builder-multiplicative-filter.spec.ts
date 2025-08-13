import { Repository, SelectQueryBuilder, Brackets } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { QueryBuilderHelper } from '../../src/helpers/query-builder.helper';
import { Entity, FindArgs, Constructable } from '@solid-nestjs/common';
import { ExtendedRelationInfo } from '../../src/interfaces';

// Mock dependencies
jest.mock('../../src/helpers/entity-relations.helper');
jest.mock('../../src/helpers/columns.helper', () => ({
  getEntityPrimaryColumns: jest.fn().mockReturnValue(['id']),
  getEntityColumns: jest.fn().mockReturnValue([]),
}));

// Test entities
interface Invoice extends Entity<number> {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  details: InvoiceDetail[];
  client?: Client;
}

interface Client extends Entity<number> {
  id: number;
  name: string;
}

interface InvoiceDetail extends Entity<number> {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  invoiceId: number;
  invoice: Invoice;
}

class InvoiceClass implements Invoice {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  details: InvoiceDetail[];
  client?: Client;
}

class InvoiceDetailClass implements InvoiceDetail {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  invoiceId: number;
  invoice: Invoice;
}

describe('QueryBuilderHelper - Multiplicative Relation Filtering', () => {
  let helper: QueryBuilderHelper<number, Invoice>;
  let repository: jest.Mocked<Repository<Invoice>>;
  let queryBuilder: jest.Mocked<SelectQueryBuilder<Invoice>>;
  let subQueryBuilder: jest.Mocked<SelectQueryBuilder<any>>;

  const mockRelationsInfo: ExtendedRelationInfo[] = [
    {
      path: ['invoiceclass', 'details'],
      propertyName: 'details',
      relationType: 'one-to-many',
      aggregatedCardinality: 'one-to-many',
      target: 'InvoiceDetailClass',
      targetClass: InvoiceDetailClass,
      isNullable: false,
      isCascade: true,
      isEager: false,
      isLazy: false,
      isExtended: true,
    },
  ];

  beforeEach(() => {
    helper = new QueryBuilderHelper(
      InvoiceClass as Constructable<Invoice>,
      class NumberId {} as any,
    );

    queryBuilder = {
      alias: 'invoice',
      leftJoin: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      subQuery: jest.fn(),
      getMany: jest.fn(),
      getOne: jest.fn(),
      expressionMap: {
        mainAlias: {
          metadata: {
            name: 'Invoice',
            primaryColumns: [{ databaseName: 'id', propertyName: 'id' }],
            relations: [
              {
                propertyName: 'details',
                isOneToMany: true,
                isManyToMany: false,
                inverseRelation: {
                  joinColumns: [{ databaseName: 'invoice_id', propertyName: 'invoiceId' }],
                },
                inverseEntityMetadata: {
                  primaryColumns: [{ databaseName: 'id', propertyName: 'id' }],
                },
              },
            ],
          },
        },
        joinAttributes: [],
      },
    } as any;

    subQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getQuery: jest.fn().mockReturnValue('SELECT 1 FROM invoice_detail WHERE ...'),
      getParameters: jest.fn().mockReturnValue({}),
    } as any;

    queryBuilder.subQuery.mockReturnValue(subQueryBuilder);

    repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      metadata: {
        name: 'Invoice',
        columns: [],
        relations: [],
      },
    } as any;

    // Mock getRelationsInfo
    jest.spyOn(helper, 'getRelationsInfo').mockReturnValue(mockRelationsInfo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Filtering by multiplicative relation fields', () => {
    it('should use EXISTS subquery for one-to-many relation filters', () => {
      const args: FindArgs<Invoice> = {
        where: {
          details: {
            productId: 123,
          }, // No type assertion needed anymore!
        },
      };

      const qb = helper.getQueryBuilder(repository, args);

      // Should create a subquery
      expect(queryBuilder.subQuery).toHaveBeenCalled();
      
      // Should not create a direct JOIN for the multiplicative relation
      expect(queryBuilder.leftJoin).not.toHaveBeenCalledWith('invoice.details', expect.any(String));
      
      // Should use EXISTS with the subquery
      expect(queryBuilder.where).toHaveBeenCalled();
      const whereCall = queryBuilder.where.mock.calls[0];
      expect(whereCall[0]).toBeInstanceOf(Brackets);
    });

    it('should handle nested conditions in multiplicative relations', () => {
      const args: FindArgs<Invoice> = {
        where: {
          details: {
            productId: { _in: [123, 456] },
            quantity: { _gt: 5 },
          }, // No type assertion needed anymore!
        },
      };

      const qb = helper.getQueryBuilder(repository, args);

      // Should create subquery for the multiplicative relation
      expect(queryBuilder.subQuery).toHaveBeenCalled();
      
      // Should apply conditions to the subquery
      expect(subQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should handle both multiplicative and non-multiplicative relations', () => {
      // Add a non-multiplicative relation to the mock
      const extendedRelationsInfo: ExtendedRelationInfo[] = [
        ...mockRelationsInfo,
        {
          path: ['invoiceclass', 'client'],
          propertyName: 'client',
          relationType: 'many-to-one',
          aggregatedCardinality: 'many-to-one',
          target: 'ClientClass',
          targetClass: class ClientClass {} as any,
          isNullable: false,
          isCascade: false,
          isEager: false,
          isLazy: false,
          isExtended: true,
        },
      ];
      
      jest.spyOn(helper, 'getRelationsInfo').mockReturnValue(extendedRelationsInfo);

      const args: FindArgs<Invoice> = {
        where: {
          client: { name: 'John' } as any, // Non-multiplicative (still needs assertion for test)
          details: { productId: 123 }, // Multiplicative - now works without assertion!
        },
      };

      const qb = helper.getQueryBuilder(repository, args);

      // Should create JOIN for non-multiplicative relation
      expect(queryBuilder.leftJoin).toHaveBeenCalledWith('invoice.client', expect.any(String));
      
      // Should create subquery for multiplicative relation
      expect(queryBuilder.subQuery).toHaveBeenCalled();
    });

    it('should work with paginated queries', () => {
      const args: FindArgs<Invoice> = {
        where: {
          details: { productId: 123 },
        },
        pagination: {
          skip: 10,
          take: 20,
        },
      };

      // Test getNonMultiplyingPaginatedQueryBuilder
      const paginatedQb = helper.getNonMultiplyingPaginatedQueryBuilder(
        repository,
        args,
      );

      expect(paginatedQb).not.toBe(false);
      
      // The paginated query should include the WHERE conditions with EXISTS
      expect(queryBuilder.where).toHaveBeenCalled();
      
      // Should select only IDs for the first query
      expect(queryBuilder.select).toHaveBeenCalledWith(['invoiceclass.id', 'invoiceclass.id']);
    });

    it('should handle _and and _or operators with multiplicative relations', () => {
      const args: FindArgs<Invoice> = {
        where: {
          _or: [
            { details: { productId: 123 } },
            { details: { quantity: { _gt: 10 } } },
          ],
        },
      };

      const qb = helper.getQueryBuilder(repository, args);

      // Should create subqueries for each condition
      expect(queryBuilder.subQuery).toHaveBeenCalled();
      expect(queryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should throw error when relation metadata is not found', () => {
      queryBuilder.expressionMap.mainAlias!.metadata.relations = [];

      const args: FindArgs<Invoice> = {
        where: {
          details: { productId: 123 },
        },
      };

      expect(() => helper.getQueryBuilder(repository, args)).toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw error for ordering by multiplicative relations', () => {
      const args: FindArgs<Invoice> = {
        orderBy: {
          details: { productId: 'ASC' as any }, // OrderBy still needs type assertion for primitive fields
        },
      };

      // Ordering by multiplicative relations should still throw an error
      expect(() => helper.getQueryBuilder(repository, args)).toThrow(
        InternalServerErrorException,
      );
    });
  });
});