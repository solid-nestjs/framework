import { Repository, SelectQueryBuilder, Brackets, And, In, Like, MoreThan, LessThan, Between, Not, EntityMetadata } from 'typeorm';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { QueryBuilderHelper } from '../../src/helpers/query-builder.helper';
import { getEntityRelationsExtended } from '../../src/helpers/entity-relations.helper';
import { Entity, FindArgs, OrderBy, Where, OrderByTypes } from '@solid-nestjs/common';
import { DataRetrievalOptions, ExtendedRelationInfo, QueryBuilderConfig } from '../../src/interfaces';

// Mock dependencies
jest.mock('../../src/helpers/entity-relations.helper');

// Test entity interface
interface TestEntity extends Entity<string> {
  id: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  createdAt: Date;
  profile?: ProfileEntity;
  tags?: TagEntity[];
  posts?: PostEntity[];
}

interface ProfileEntity extends Entity<string> {
  id: string;
  bio: string;
  userId: string;
  user: TestEntity;
}

interface TagEntity extends Entity<string> {
  id: string;
  name: string;
  users: TestEntity[];
}

interface PostEntity extends Entity<string> {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: TestEntity;
}

class TestEntityClass implements TestEntity {
  id: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
  createdAt: Date;
  profile?: ProfileEntity;
  tags?: TagEntity[];
  posts?: PostEntity[];
}

describe('QueryBuilderHelper', () => {
  let helper: QueryBuilderHelper<string, TestEntity>;
  let repository: jest.Mocked<Repository<TestEntity>>;
  let queryBuilder: jest.Mocked<SelectQueryBuilder<TestEntity>>;
  let metadata: jest.Mocked<EntityMetadata>;
    const mockRelationsInfo: ExtendedRelationInfo[] = [
    {
      path: ['testentityclass', 'profile'],
      propertyName: 'profile',
      relationType: 'one-to-one',
      aggregatedCardinality: 'one-to-one',
      target: 'ProfileEntity',
      isNullable: false,
      isCascade: false,
      isEager: false,
      isLazy: false,
      isExtended: false,
    },
    {
      path: ['testentityclass', 'tags'],
      propertyName: 'tags',
      relationType: 'many-to-many',
      aggregatedCardinality: 'many-to-many',
      target: 'TagEntity',
      isNullable: false,
      isCascade: false,
      isEager: false,
      isLazy: false,
      isExtended: false,
    },
    {
      path: ['testentityclass', 'posts'],
      propertyName: 'posts',
      relationType: 'one-to-many',
      aggregatedCardinality: 'one-to-many',
      target: 'PostEntity',
      isNullable: false,
      isCascade: false,
      isEager: false,
      isLazy: false,
      isExtended: false,
    },
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup metadata mock
    metadata = {
      name: 'TestEntity',
      primaryColumns: [{ propertyName: 'id' }],
    } as any;

    // Setup query builder mock
    queryBuilder = {
      alias: 'testentityclass',
      createQueryBuilder: jest.fn(),
      leftJoin: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      withDeleted: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getOne: jest.fn().mockResolvedValue(null),
      getCount: jest.fn().mockResolvedValue(0),
      expressionMap: {
        joinAttributes: [],
      },
    } as any;

    // Setup repository mock
    repository = {
      metadata,
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    } as any;

    // Setup entity relations mock
    (getEntityRelationsExtended as jest.Mock).mockReturnValue(mockRelationsInfo);

    // Create helper instance
    helper = new QueryBuilderHelper(TestEntityClass);
  });

  describe('constructor', () => {
    it('should create instance with entity type', () => {
      expect(helper).toBeInstanceOf(QueryBuilderHelper);
    });

    it('should create instance with entity type and default options', () => {
      const defaultOptions: QueryBuilderConfig<TestEntity> = {
        relationsConfig: {
          mainAlias: 'customAlias',
          relations: { profile: true },
        },
      };

      const helperWithOptions = new QueryBuilderHelper(TestEntityClass, defaultOptions);
      expect(helperWithOptions).toBeInstanceOf(QueryBuilderHelper);
    });
  });

  describe('getRelationsInfo', () => {
    it('should return relations info from cache if available', () => {
      // First call
      const result1 = helper.getRelationsInfo(repository);
      expect(getEntityRelationsExtended).toHaveBeenCalledWith(repository);
      expect(result1).toBe(mockRelationsInfo);

      // Second call should use cache
      const result2 = helper.getRelationsInfo(repository);
      expect(getEntityRelationsExtended).toHaveBeenCalledTimes(1);
      expect(result2).toBe(mockRelationsInfo);
    });

    it('should call getEntityRelationsExtended when cache is empty', () => {
      const result = helper.getRelationsInfo(repository);
      
      expect(getEntityRelationsExtended).toHaveBeenCalledWith(repository);
      expect(result).toBe(mockRelationsInfo);
    });
  });

  describe('getQueryBuilder', () => {
    it('should create query builder without arguments', () => {
      const result = helper.getQueryBuilder(repository);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('testentityclass');
      expect(result).toBe(queryBuilder);
    });

    it('should create query builder with find arguments', () => {      const args: FindArgs<TestEntity> = {
        where: { name: 'John' },
        orderBy: { name: OrderByTypes.ASC },
        pagination: { take: 10, skip: 0 },
      };

      const result = helper.getQueryBuilder(repository, args);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('testentityclass');
      expect(result).toBe(queryBuilder);
    });

    it('should create query builder with data retrieval options', () => {
      const options: DataRetrievalOptions<TestEntity> = {
        mainAlias: 'customAlias',
        relations: [{ property: 'customAlias.profile', alias: 'customAlias_profile' }],
        ignoreMultiplyingJoins: true,
      };

      const result = helper.getQueryBuilder(repository, undefined, options);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('customAlias');
      expect(result).toBe(queryBuilder);
    });    it('should apply lock mode when provided in options', () => {
      const options: DataRetrievalOptions<TestEntity> = {
        lockMode: {
          lockMode: 'pessimistic_read',
          lockVersion: undefined,
        },
      };

      helper.getQueryBuilder(repository, undefined, options);

      expect(queryBuilder.setLock).toHaveBeenCalledWith('pessimistic_read', undefined, undefined);
    });

    it('should apply optimistic lock when provided', () => {
      const options: DataRetrievalOptions<TestEntity> = {
        lockMode: {
          lockMode: 'optimistic',
          lockVersion: 1,
        },
      };

      helper.getQueryBuilder(repository, undefined, options);

      expect(queryBuilder.setLock).toHaveBeenCalledWith('optimistic', 1);
    });

    it('should include deleted records when withDeleted is true', () => {
      const options: DataRetrievalOptions<TestEntity> = {
        withDeleted: true,
      };

      helper.getQueryBuilder(repository, undefined, options);

      expect(queryBuilder.withDeleted).toHaveBeenCalled();
    });
  });

  describe('getNonMultiplyingPaginatedQueryBuilder', () => {
    it('should return false when no pagination is provided', () => {
      const args: FindArgs<TestEntity> = {
        where: { name: 'John' },
      };

      const result = helper.getNonMultiplyingPaginatedQueryBuilder(repository, args);

      expect(result).toBe(false);
    });

    it('should return false when pagination values are zero', () => {
      const args: FindArgs<TestEntity> = {
        pagination: { skip: 0, take: 0 },
      };

      const result = helper.getNonMultiplyingPaginatedQueryBuilder(repository, args);

      expect(result).toBe(false);
    });    it('should return false when no multiplying relations exist', () => {
      // Mock relations with no multiplying cardinality
      const nonMultiplyingRelations: ExtendedRelationInfo[] = [
        {
          path: ['testentityclass', 'profile'],
          propertyName: 'profile',
          relationType: 'one-to-one',
          aggregatedCardinality: 'one-to-one',
          target: 'ProfileEntity',
          isNullable: false,
          isCascade: false,
          isEager: false,
          isLazy: false,
          isExtended: false,
        },
      ];
      (getEntityRelationsExtended as jest.Mock).mockReturnValue(nonMultiplyingRelations);

      const args: FindArgs<TestEntity> = {
        pagination: { take: 10 },
      };

      const result = helper.getNonMultiplyingPaginatedQueryBuilder(repository, args);

      expect(result).toBe(false);
    });    it('should return query builder selecting only id when pagination and multiplying relations exist', () => {
      const options: DataRetrievalOptions<TestEntity> = {
        relations: [
          { property: 'testentityclass.posts', alias: 'posts' }, // This has multiplying cardinality
        ],
      };

      const args: FindArgs<TestEntity> = {
        pagination: { take: 10 },
        where: { name: 'John' },
      };

      const result = helper.getNonMultiplyingPaginatedQueryBuilder(repository, args, options);

      expect(result).toBe(queryBuilder);
      expect(queryBuilder.select).toHaveBeenCalledWith('testentityclass.id');
    });

    it('should return false when no multiplying relations are found in query', () => {
      const args: FindArgs<TestEntity> = {
        pagination: { take: 10 },
      };

      // Mock the implGetQueryBuilder to return false through validRelations
      jest.spyOn(helper as any, 'implGetQueryBuilder').mockReturnValue(false);

      const result = helper.getNonMultiplyingPaginatedQueryBuilder(repository, args);

      expect(result).toBe(false);
    });
  });

  describe('protected methods', () => {
    describe('getRelationsArray', () => {
      it('should convert relations object to array format', () => {
        const relations = {
          profile: true,
          tags: {
            posts: true,
          },
        };

        const result = (helper as any).getRelationsArray('testentityclass', relations);

        expect(result).toEqual([
          { property: 'testentityclass.profile', alias: 'testentityclass_profile' },
          { property: 'testentityclass.tags', alias: 'testentityclass_tags' },
          { property: 'testentityclass_tags.posts', alias: 'testentityclass_tags_posts' },
        ]);
      });

      it('should handle nested relations', () => {
        const relations = {
          profile: {
            user: {
              posts: true,
            },
          },
        };

        const result = (helper as any).getRelationsArray('testentityclass', relations);

        expect(result).toEqual([
          { property: 'testentityclass.profile', alias: 'testentityclass_profile' },
          { property: 'testentityclass_profile.user', alias: 'testentityclass_profile_user' },
          { property: 'testentityclass_profile_user.posts', alias: 'testentityclass_profile_user_posts' },
        ]);
      });

      it('should skip false relations', () => {
        const relations = {
          profile: true,
          tags: false,
          posts: true,
        };

        const result = (helper as any).getRelationsArray('testentityclass', relations);

        expect(result).toEqual([
          { property: 'testentityclass.profile', alias: 'testentityclass_profile' },
          { property: 'testentityclass.posts', alias: 'testentityclass_posts' },
        ]);
      });
    });

    describe('addRelation', () => {
      let queryContext: any;

      beforeEach(() => {
        queryContext = {
          queryBuilder,
          relations: [],
          relationsInfo: mockRelationsInfo,
          ignoreMultiplyingJoins: false,
          ignoreSelects: false,
        };
      });

      it('should add new relation and perform leftJoinAndSelect', () => {
        const result = (helper as any).addRelation(queryContext, 'profile', 'profile_alias', true);

        expect(result).toEqual({
          property: 'testentityclass.profile',
          alias: 'profile_alias',
          relationInfo: mockRelationsInfo[0],
        });
        expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('testentityclass.profile', 'profile_alias');
        expect(queryContext.relations).toHaveLength(1);
      });

      it('should add new relation and perform leftJoin when andSelect is false', () => {
        const result = (helper as any).addRelation(queryContext, 'profile', 'profile_alias', false);

        expect(queryBuilder.leftJoin).toHaveBeenCalledWith('testentityclass.profile', 'profile_alias');
        expect(queryBuilder.leftJoinAndSelect).not.toHaveBeenCalled();
      });

      it('should return existing relation if already added', () => {
        const existingRelation = {
          property: 'testentityclass.profile',
          alias: 'existing_alias',
          relationInfo: mockRelationsInfo[0],
        };
        queryContext.relations.push(existingRelation);

        const result = (helper as any).addRelation(queryContext, 'profile', 'new_alias', true);

        expect(result).toBe(existingRelation);
        expect(queryBuilder.leftJoinAndSelect).not.toHaveBeenCalled();
      });

      it('should generate alias from property when not provided', () => {
        const result = (helper as any).addRelation(queryContext, 'profile', undefined, true);

        expect(result.alias).toBe('testentityclass_profile');
      });

      it('should add alias prefix when property does not contain dot', () => {
        const result = (helper as any).addRelation(queryContext, 'profile', 'profile_alias', true);

        expect(result.property).toBe('testentityclass.profile');
      });

      it('should throw error for invalid relation path', () => {
        const result = () => (helper as any).addRelation(queryContext, 'invalidRelation', 'alias', true);

        expect(result).toThrow(BadRequestException);
        expect(result).toThrow('invalid relation to property: invalidRelation');
      });

      it('should skip join when ignoreMultiplyingJoins is true and relation has multiplying cardinality', () => {
        queryContext.ignoreMultiplyingJoins = true;

        const result = (helper as any).addRelation(queryContext, 'tags', 'tags_alias', true);

        expect(result.relationInfo?.aggregatedCardinality).toBe('many-to-many');
        expect(queryBuilder.leftJoinAndSelect).not.toHaveBeenCalled();
        expect(queryBuilder.leftJoin).not.toHaveBeenCalled();
      });

      it('should skip select when ignoreSelects is true', () => {
        queryContext.ignoreSelects = true;

        (helper as any).addRelation(queryContext, 'profile', 'profile_alias', true);

        expect(queryBuilder.leftJoin).toHaveBeenCalledWith('testentityclass.profile', 'profile_alias');
        expect(queryBuilder.leftJoinAndSelect).not.toHaveBeenCalled();
      });
    });

    describe('getRelationPath', () => {
      it('should return empty array when relation is undefined', () => {
        const result = (helper as any).getRelationPath([], undefined, 0);

        expect(result).toEqual([]);
      });

      it('should return single field for first level property', () => {
        const relation = { property: 'profile', alias: 'profile_alias' };

        const result = (helper as any).getRelationPath([], relation, 0);

        expect(result).toEqual(['profile']);
      });

      it('should handle nested relation path', () => {
        const relations = [
          { property: 'testentityclass.profile', alias: 'testentityclass_profile' },
        ];
        const relation = { property: 'testentityclass_profile.user', alias: 'user_alias' };

        const result = (helper as any).getRelationPath(relations, relation, 0);

        expect(result).toEqual(['profile', 'user']);
      });

      it('should throw error when max recursive depth is exceeded', () => {
        const relation = { property: 'profile', alias: 'profile_alias' };

        const result = () => (helper as any).getRelationPath([], relation, 25);

        expect(result).toThrow(InternalServerErrorException);
        expect(result).toThrow('Max recursive depth reached');
      });

      it('should throw error for invalid property format', () => {
        const relation = { property: 'invalid.property.format', alias: 'alias' };

        const result = () => (helper as any).getRelationPath([], relation, 0);

        expect(result).toThrow(BadRequestException);
        expect(result).toThrow('bad relation property format: invalid.property.format');
      });
    });

    describe('applyArgs', () => {
      let queryContext: any;

      beforeEach(() => {
        queryContext = {
          queryBuilder,
          relations: [],
          relationsInfo: mockRelationsInfo,
        };
      });

      it('should apply where conditions', () => {
        const args: FindArgs<TestEntity> = {
          where: { name: 'John' },
        };

        (helper as any).applyArgs(queryContext, args);

        expect(queryBuilder.where).toHaveBeenCalled();
      });      it('should apply order by', () => {
        const args: FindArgs<TestEntity> = {
          orderBy: { name: OrderByTypes.ASC },
        };

        const applyOrderBySpy = jest.spyOn(helper as any, 'applyOrderBy');

        (helper as any).applyArgs(queryContext, args);

        expect(applyOrderBySpy).toHaveBeenCalled();
      });

      it('should apply pagination', () => {
        const args: FindArgs<TestEntity> = {
          pagination: { take: 10, skip: 5 },
        };

        (helper as any).applyArgs(queryContext, args);

        expect(queryBuilder.offset).toHaveBeenCalledWith(5);
        expect(queryBuilder.limit).toHaveBeenCalledWith(10);
      });

      it('should handle page-based pagination', () => {
        const args: FindArgs<TestEntity> = {
          pagination: { page: 2, limit: 10 },
        };

        (helper as any).applyArgs(queryContext, args);

        expect(queryBuilder.offset).toHaveBeenCalledWith(10);
        expect(queryBuilder.limit).toHaveBeenCalledWith(10);
      });
    });

    describe('applyOrderBy', () => {
      let queryContext: any;

      beforeEach(() => {
        queryContext = {
          queryBuilder,
          relations: [],
          relationsInfo: mockRelationsInfo,
          alias: 'testentityclass',
          recusirveDepth: 0,
        };
      });      it('should apply simple field ordering', () => {
        const orderBy: OrderBy<TestEntity> = { name: OrderByTypes.ASC, age: OrderByTypes.DESC };

        (helper as any).applyOrderBy(queryContext, orderBy);

        expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('testentityclass.name', OrderByTypes.ASC);
        expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('testentityclass.age', OrderByTypes.DESC);
      });

      it('should handle array of order by objects', () => {
        const orderBy: OrderBy<TestEntity>[] = [
          { name: OrderByTypes.ASC },
          { age: OrderByTypes.DESC },
        ];

        (helper as any).applyOrderBy(queryContext, orderBy);

        expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('testentityclass.name', OrderByTypes.ASC);
        expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('testentityclass.age', OrderByTypes.DESC);
      });

      it('should handle relation ordering', () => {
        const orderBy = {
          profile: { bio: OrderByTypes.ASC },
        };

        const addRelationSpy = jest.spyOn(helper as any, 'addRelationForConditionOrSorting')
          .mockReturnValue('profile_alias');

        (helper as any).applyOrderBy(queryContext, orderBy);

        expect(addRelationSpy).toHaveBeenCalledWith(queryContext, 'profile');
      });

      it('should throw error when max recursive depth is exceeded', () => {
        queryContext.recusirveDepth = 25;
        const orderBy: OrderBy<TestEntity> = { name: OrderByTypes.ASC };

        const result = () => (helper as any).applyOrderBy(queryContext, orderBy);

        expect(result).toThrow(InternalServerErrorException);
        expect(result).toThrow('Max recursive depth reached');
      });      it('should skip null or undefined order values', () => {
        const orderBy = { name: OrderByTypes.ASC, age: null };

        (helper as any).applyOrderBy(queryContext, orderBy);

        expect(queryBuilder.addOrderBy).toHaveBeenCalledWith('testentityclass.name', OrderByTypes.ASC);
        expect(queryBuilder.addOrderBy).toHaveBeenCalledTimes(1);
      });
    });

    describe('getWhereCondition', () => {
      let whereContext: any;

      beforeEach(() => {
        whereContext = {
          queryBuilder,
          relations: [],
          relationsInfo: mockRelationsInfo,
          alias: 'testentityclass',
          recusirveDepth: 0,
          constructField: (fieldName: string, value: any) => ({ [fieldName]: value }),
        };
      });

      it('should handle simple field conditions', () => {
        const where: Where<TestEntity> = { name: 'John' };

        const result = (helper as any).getWhereCondition(whereContext, where);

        expect(result).toBeInstanceOf(Brackets);
      });

      it('should handle _and conditions', () => {
        const where = {
          _and: [
            { name: 'John' },
            { age: 25 },
          ],
        };

        const result = (helper as any).getWhereCondition(whereContext, where);

        expect(result).toBeInstanceOf(Brackets);
      });

      it('should handle _or conditions', () => {
        const where = {
          _or: [
            { name: 'John' },
            { name: 'Jane' },
          ],
        };

        const result = (helper as any).getWhereCondition(whereContext, where);

        expect(result).toBeInstanceOf(Brackets);
      });

      it('should handle combined _and and _or conditions', () => {
        const where = {
          name: 'John',
          _or: [
            { age: 25 },
            { age: 30 },
          ],
        };

        const result = (helper as any).getWhereCondition(whereContext, where);

        expect(result).toBeInstanceOf(Brackets);
      });

      it('should throw error when max recursive depth is exceeded', () => {
        whereContext.recusirveDepth = 25;
        const where: Where<TestEntity> = { name: 'John' };

        const result = () => (helper as any).getWhereCondition(whereContext, where);

        expect(result).toThrow(InternalServerErrorException);
        expect(result).toThrow('Max recursive depth reached');
      });

      it('should skip null or undefined values', () => {
        const where = { name: 'John', age: null };

        const result = (helper as any).getWhereCondition(whereContext, where);

        expect(result).toBeInstanceOf(Brackets);
      });
    });

    describe('getFieldConditions', () => {
      let whereContext: any;

      beforeEach(() => {
        whereContext = {
          constructField: (fieldName: string, value: any) => ({ [fieldName]: value }),
        };
      });

      it('should handle string values', () => {
        const result = (helper as any).getFieldConditions(whereContext, 'name', 'John');

        expect(result).toEqual({ name: 'John' });
      });

      it('should handle number values', () => {
        const result = (helper as any).getFieldConditions(whereContext, 'age', 25);

        expect(result).toEqual({ age: 25 });
      });

      it('should handle boolean values', () => {
        const result = (helper as any).getFieldConditions(whereContext, 'isActive', true);

        expect(result).toEqual({ isActive: true });
      });

      it('should handle Date values', () => {
        const date = new Date('2023-01-01');
        const result = (helper as any).getFieldConditions(whereContext, 'createdAt', date);

        expect(result).toEqual({ createdAt: date });
      });

      it('should handle array values with In operator', () => {
        const result = (helper as any).getFieldConditions(whereContext, 'name', ['John', 'Jane']);

        expect(result).toEqual({ name: In(['John', 'Jane']) });
      });

      it('should handle object with comparison operators', () => {
        const fieldCondition = { _gt: 18, _lt: 65 };

        const result = (helper as any).getFieldConditions(whereContext, 'age', fieldCondition);

        expect(result).toEqual({ age: And(MoreThan(18), LessThan(65)) });
      });

      it('should handle single comparison operator', () => {
        const fieldCondition = { _like: '%john%' };

        const result = (helper as any).getFieldConditions(whereContext, 'name', fieldCondition);

        expect(result).toEqual({ name: Like('%john%') });
      });

      it('should throw error for invalid object condition', () => {
        const result = () => (helper as any).getFieldConditions(whereContext, 'name', {});

        expect(result).toThrow(BadRequestException);
        expect(result).toThrow('key name must have a valid condition');
      });

      it('should throw error for non-object when expected', () => {
        const result = () => (helper as any).getFieldConditions(whereContext, 'name', Symbol('test'));

        expect(result).toThrow(InternalServerErrorException);
        expect(result).toThrow('name must be an object');
      });

      it('should skip undefined values in object conditions', () => {
        const fieldCondition = { _gt: 18, _lt: undefined };

        const result = (helper as any).getFieldConditions(whereContext, 'age', fieldCondition);

        expect(result).toEqual({ age: MoreThan(18) });
      });
    });

    describe('getComplexConditions', () => {
      let whereContext: any;

      beforeEach(() => {
        whereContext = {
          queryBuilder,
          relations: [],
          relationsInfo: mockRelationsInfo,
          alias: 'testentityclass',
          recusirveDepth: 0,
          constructField: (fieldName: string, value: any) => ({ [fieldName]: value }),
        };
      });

      it('should handle single condition', () => {
        const condition = { name: 'John' };

        const result = (helper as any).getComplexConditions(whereContext, condition);

        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(Brackets);
      });

      it('should handle array of conditions', () => {
        const conditions = [
          { name: 'John' },
          { age: 25 },
        ];

        const result = (helper as any).getComplexConditions(whereContext, conditions);

        expect(result).toHaveLength(2);
        expect(result[0]).toBeInstanceOf(Brackets);
        expect(result[1]).toBeInstanceOf(Brackets);
      });
    });

    describe('hasFieldConditions', () => {
      it('should return true for string values', () => {
        const result = (helper as any).hasFieldConditions('name', 'John');

        expect(result).toBe(true);
      });

      it('should return true for number values', () => {
        const result = (helper as any).hasFieldConditions('age', 25);

        expect(result).toBe(true);
      });

      it('should return true for boolean values', () => {
        const result = (helper as any).hasFieldConditions('isActive', true);

        expect(result).toBe(true);
      });

      it('should return true for Date values', () => {
        const result = (helper as any).hasFieldConditions('createdAt', new Date());

        expect(result).toBe(true);
      });

      it('should return true for array values', () => {
        const result = (helper as any).hasFieldConditions('names', ['John', 'Jane']);

        expect(result).toBe(true);
      });

      it('should return true for objects with condition keys', () => {
        const result = (helper as any).hasFieldConditions('age', { _gt: 18 });

        expect(result).toBe(true);
      });

      it('should return false for objects without condition keys', () => {
        const result = (helper as any).hasFieldConditions('profile', { bio: 'test' });

        expect(result).toBe(false);
      });

      it('should throw error for null values', () => {
        const result = () => (helper as any).hasFieldConditions('name', null);

        expect(result).toThrow(BadRequestException);
        expect(result).toThrow('field name cannot be null or undefined');
      });

      it('should throw error for undefined values', () => {
        const result = () => (helper as any).hasFieldConditions('name', undefined);

        expect(result).toThrow(BadRequestException);
        expect(result).toThrow('field name cannot be null or undefined');
      });

      it('should throw error for empty objects', () => {
        const result = () => (helper as any).hasFieldConditions('name', {});

        expect(result).toThrow(BadRequestException);
        expect(result).toThrow('field name cannot be empty');
      });
    });

    describe('addRelationForConditionOrSorting', () => {
      let context: any;

      beforeEach(() => {
        context = {
          queryBuilder,
          relations: [],
          relationsInfo: mockRelationsInfo,
          alias: 'testentityclass',
          recusirveDepth: 0,
        };
      });

      it('should add relation and return alias for non-multiplying relations', () => {
        const addRelationSpy = jest.spyOn(helper as any, 'addRelation').mockReturnValue({
          alias: 'profile_alias',
          relationInfo: { aggregatedCardinality: 'one-to-one' },
        });

        const result = (helper as any).addRelationForConditionOrSorting(context, 'profile');

        expect(addRelationSpy).toHaveBeenCalledWith(context, 'testentityclass.profile');
        expect(result).toBe('profile_alias');
      });

      it('should throw error when relation has no aggregatedCardinality', () => {
        jest.spyOn(helper as any, 'addRelation').mockReturnValue({
          alias: 'profile_alias',
          relationInfo: {},
        });

        const result = () => (helper as any).addRelationForConditionOrSorting(context, 'profile');

        expect(result).toThrow(InternalServerErrorException);
        expect(result).toThrow('no aggregatedCardinality for testentityclass.profile');
      });

      it('should throw error for multiplying cardinality relations', () => {
        jest.spyOn(helper as any, 'addRelation').mockReturnValue({
          alias: 'tags_alias',
          relationInfo: { aggregatedCardinality: 'many-to-many' },
        });

        const result = () => (helper as any).addRelationForConditionOrSorting(context, 'tags');

        expect(result).toThrow(InternalServerErrorException);
        expect(result).toThrow('invalid aggregatedCardinality (many-to-many) for condition in property (testentityclass.tags), it will cause a multiplying join');
      });
    });

    describe('relationCondition', () => {
      let whereContext: any;

      beforeEach(() => {
        whereContext = {
          queryBuilder,
          relations: [],
          relationsInfo: mockRelationsInfo,
          alias: 'testentityclass',
          recusirveDepth: 0,
          constructField: (fieldName: string, value: any) => ({ [fieldName]: value }),
        };
      });

      it('should create relation condition with updated context', () => {
        const addRelationSpy = jest.spyOn(helper as any, 'addRelationForConditionOrSorting')
          .mockReturnValue('profile_alias');
        const getWhereConditionSpy = jest.spyOn(helper as any, 'getWhereCondition')
          .mockReturnValue('mock_condition');

        const condition = { bio: 'Test bio' };
        const result = (helper as any).relationCondition(whereContext, 'profile', condition);

        expect(addRelationSpy).toHaveBeenCalledWith(whereContext, 'profile');
        expect(getWhereConditionSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            alias: 'profile_alias',
            recusirveDepth: 1,
          }),
          condition
        );
        expect(result).toBe('mock_condition');
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle complex nested where conditions', () => {
      const args: FindArgs<TestEntity> = {
        where: {
          _and: [
            { name: 'John' },
            {
              _or: [
                { age: { _gt: 18 } },
                { isActive: true },
              ],
            },
          ],
        },
      };

      const result = helper.getQueryBuilder(repository, args);

      expect(result).toBe(queryBuilder);
      expect(queryBuilder.where).toHaveBeenCalled();
    });    it('should handle complex ordering with nested relations', () => {
      const args: FindArgs<TestEntity> = {
        orderBy: [
          { name: OrderByTypes.ASC },
          { profile: { bio: OrderByTypes.DESC } },
        ],
      };

      const result = helper.getQueryBuilder(repository, args);

      expect(result).toBe(queryBuilder);
    });    it('should handle multiple relation joins', () => {
      const options: DataRetrievalOptions<TestEntity> = {
        relations: [
          { property: 'testentityclass.profile', alias: 'profile' },
          { property: 'testentityclass.tags', alias: 'tags' },
          { property: 'testentityclass.posts', alias: 'posts' },
        ],
        ignoreMultiplyingJoins: true, // This should ignore multiplying cardinality relations
      };

      const result = helper.getQueryBuilder(repository, undefined, options);

      expect(result).toBe(queryBuilder);
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(1); // Only profile (non-multiplying) should be joined
    });
  });
});
