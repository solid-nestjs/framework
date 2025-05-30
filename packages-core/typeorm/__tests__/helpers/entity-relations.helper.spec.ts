import { Repository, EntityMetadata } from 'typeorm';
import { getTypeName } from '@solid-nestjs/common';
import {
  getEntityRelations,
  getEntityRelationsExtended,
} from '../../src/helpers/entity-relations.helper';
import { RelationInfo, ExtendedRelationInfo } from '../../src/interfaces';

// Mock RelationType since it's internal to TypeORM
type RelationType =
  | 'one-to-one'
  | 'one-to-many'
  | 'many-to-one'
  | 'many-to-many';

// Test entity interfaces
interface TestEntity {
  id: number;
  name: string;
  profile?: ProfileEntity;
  tags?: TagEntity[];
  posts?: PostEntity[];
}

interface ProfileEntity {
  id: number;
  bio: string;
  user?: TestEntity;
  avatar?: AvatarEntity;
}

interface TagEntity {
  id: number;
  name: string;
  users?: TestEntity[];
}

interface PostEntity {
  id: number;
  title: string;
  author?: TestEntity;
  comments?: CommentEntity[];
  category?: CategoryEntity;
}

interface CommentEntity {
  id: number;
  content: string;
  post?: PostEntity;
}

interface CategoryEntity {
  id: number;
  name: string;
  posts?: PostEntity[];
}

interface AvatarEntity {
  id: number;
  url: string;
  profile?: ProfileEntity;
}

// Mock the getTypeName function
jest.mock('@solid-nestjs/common', () => ({
  getTypeName: jest.fn(),
}));

const mockGetTypeName = getTypeName as jest.MockedFunction<typeof getTypeName>;

// Helper function to create mock relation
const createMockRelation = (
  propertyName: string,
  relationType: RelationType,
  type: string,
  options: {
    isNullable?: boolean;
    isCascadeInsert?: boolean;
    isCascadeUpdate?: boolean;
    isCascadeRemove?: boolean;
    isEager?: boolean;
    isLazy?: boolean;
    inverseEntityMetadata?: EntityMetadata;
  } = {},
) => ({
  propertyName,
  relationType,
  type,
  isNullable: options.isNullable ?? false,
  isCascadeInsert: options.isCascadeInsert ?? false,
  isCascadeUpdate: options.isCascadeUpdate ?? false,
  isCascadeRemove: options.isCascadeRemove ?? false,
  isEager: options.isEager ?? false,
  isLazy: options.isLazy ?? false,
  inverseEntityMetadata: options.inverseEntityMetadata,
});

describe('entity-relations.helper', () => {
  let repository: jest.Mocked<Repository<TestEntity>>;
  let metadata: jest.Mocked<EntityMetadata>;

  beforeEach(() => {
    jest.clearAllMocks();

    metadata = {
      name: 'TestEntity',
      relations: [],
    } as any;

    repository = {
      metadata,
    } as any;

    mockGetTypeName.mockImplementation((type: any) => {
      if (typeof type === 'function') {
        return type.name;
      }
      if (typeof type === 'string') {
        return type;
      }
      return 'UnknownType';
    });
  });

  describe('getEntityRelations', () => {
    it('should return empty array when no relations exist', () => {
      metadata.relations = [];

      const result = getEntityRelations(repository);

      expect(result).toEqual([]);
    });

    it('should return basic relation info for single relation', () => {
      const mockRelation: any = {
        propertyName: 'profile',
        relationType: 'one-to-one',
        type: 'ProfileEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
      };

      (metadata as any).relations = [mockRelation];
      mockGetTypeName.mockReturnValue('ProfileEntity');

      const result = getEntityRelations(repository);

      expect(result).toEqual([
        {
          propertyName: 'profile',
          relationType: 'one-to-one',
          target: 'ProfileEntity',
          isNullable: false,
          isCascade: false,
          isEager: false,
          isLazy: false,
        },
      ]);
      expect(mockGetTypeName).toHaveBeenCalledWith('ProfileEntity');
    });

    it('should return multiple relations info', () => {
      const mockRelations: any[] = [
        {
          propertyName: 'profile',
          relationType: 'one-to-one',
          type: 'ProfileEntity',
          isNullable: true,
          isCascadeInsert: false,
          isCascadeUpdate: false,
          isCascadeRemove: false,
          isEager: false,
          isLazy: false,
        },
        {
          propertyName: 'tags',
          relationType: 'many-to-many',
          type: 'TagEntity',
          isNullable: false,
          isCascadeInsert: true,
          isCascadeUpdate: false,
          isCascadeRemove: false,
          isEager: true,
          isLazy: false,
        },
        {
          propertyName: 'posts',
          relationType: 'one-to-many',
          type: 'PostEntity',
          isNullable: false,
          isCascadeInsert: false,
          isCascadeUpdate: true,
          isCascadeRemove: true,
          isEager: false,
          isLazy: true,
        },
      ];

      metadata.relations = mockRelations as any[];
      mockGetTypeName
        .mockReturnValueOnce('ProfileEntity')
        .mockReturnValueOnce('TagEntity')
        .mockReturnValueOnce('PostEntity');

      const result = getEntityRelations(repository);

      expect(result).toEqual([
        {
          propertyName: 'profile',
          relationType: 'one-to-one',
          target: 'ProfileEntity',
          isNullable: true,
          isCascade: false,
          isEager: false,
          isLazy: false,
        },
        {
          propertyName: 'tags',
          relationType: 'many-to-many',
          target: 'TagEntity',
          isNullable: false,
          isCascade: true,
          isEager: true,
          isLazy: false,
        },
        {
          propertyName: 'posts',
          relationType: 'one-to-many',
          target: 'PostEntity',
          isNullable: false,
          isCascade: true,
          isEager: false,
          isLazy: true,
        },
      ]);
    });

    it('should handle cascade insert, update, and remove flags', () => {
      const mockRelations: any[] = [
        {
          propertyName: 'relation1',
          relationType: 'one-to-one',
          type: 'Entity1',
          isNullable: false,
          isCascadeInsert: true,
          isCascadeUpdate: false,
          isCascadeRemove: false,
          isEager: false,
          isLazy: false,
        },
        {
          propertyName: 'relation2',
          relationType: 'one-to-many',
          type: 'Entity2',
          isNullable: false,
          isCascadeInsert: false,
          isCascadeUpdate: true,
          isCascadeRemove: false,
          isEager: false,
          isLazy: false,
        },
        {
          propertyName: 'relation3',
          relationType: 'many-to-one',
          type: 'Entity3',
          isNullable: false,
          isCascadeInsert: false,
          isCascadeUpdate: false,
          isCascadeRemove: true,
          isEager: false,
          isLazy: false,
        },
      ];

      metadata.relations = mockRelations as any[];
      mockGetTypeName
        .mockReturnValueOnce('Entity1')
        .mockReturnValueOnce('Entity2')
        .mockReturnValueOnce('Entity3');

      const result = getEntityRelations(repository);

      expect(result[0].isCascade).toBe(true); // insert cascade
      expect(result[1].isCascade).toBe(true); // update cascade
      expect(result[2].isCascade).toBe(true); // remove cascade
    });
  });

  describe('getEntityRelationsExtended', () => {
    let profileMetadata: jest.Mocked<EntityMetadata>;
    let tagMetadata: jest.Mocked<EntityMetadata>;
    let postMetadata: jest.Mocked<EntityMetadata>;
    let commentMetadata: jest.Mocked<EntityMetadata>;
    let avatarMetadata: jest.Mocked<EntityMetadata>;

    beforeEach(() => {
      profileMetadata = {
        name: 'ProfileEntity',
        relations: [],
      } as any;

      tagMetadata = {
        name: 'TagEntity',
        relations: [],
      } as any;

      postMetadata = {
        name: 'PostEntity',
        relations: [],
      } as any;

      commentMetadata = {
        name: 'CommentEntity',
        relations: [],
      } as any;

      avatarMetadata = {
        name: 'AvatarEntity',
        relations: [],
      } as any;
    });

    it('should return empty array when no relations exist', () => {
      metadata.relations = [];

      const result = getEntityRelationsExtended(repository);

      expect(result).toEqual([]);
    });

    it('should return direct relations only', () => {
      const mockRelation: any = {
        propertyName: 'profile',
        relationType: 'one-to-one',
        type: 'ProfileEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: profileMetadata,
      };

      metadata.relations = [mockRelation as any];
      profileMetadata.relations = [];
      mockGetTypeName.mockReturnValue('ProfileEntity');

      const result = getEntityRelationsExtended(repository);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        propertyName: 'profile',
        relationType: 'one-to-one',
        aggregatedCardinality: 'one-to-one',
        target: 'ProfileEntity',
        isNullable: false,
        isCascade: false,
        isEager: false,
        isLazy: false,
        path: ['TestEntity', 'profile'],
        isExtended: false,
      });
    });

    it('should include extended relations up to maxDepth', () => {
      // Setup main entity -> profile relation
      const profileRelation: any = {
        propertyName: 'profile',
        relationType: 'one-to-one',
        type: 'ProfileEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: profileMetadata,
      };

      // Setup profile -> avatar relation
      const avatarRelation: any = {
        propertyName: 'avatar',
        relationType: 'one-to-one',
        type: 'AvatarEntity',
        isNullable: true,
        isCascadeInsert: true,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: avatarMetadata,
      };

      metadata.relations = [profileRelation as any];
      profileMetadata.relations = [avatarRelation as any];
      avatarMetadata.relations = [];

      mockGetTypeName
        .mockReturnValueOnce('ProfileEntity')
        .mockReturnValueOnce('AvatarEntity')
        .mockReturnValueOnce('AvatarEntity');

      const result = getEntityRelationsExtended(repository, 2);

      expect(result).toHaveLength(2);

      // Direct relation
      expect(result[0]).toEqual({
        propertyName: 'profile',
        relationType: 'one-to-one',
        aggregatedCardinality: 'one-to-one',
        target: 'ProfileEntity',
        isNullable: false,
        isCascade: false,
        isEager: false,
        isLazy: false,
        path: ['TestEntity', 'profile'],
        isExtended: false,
      });

      // Extended relation
      expect(result[1]).toEqual({
        propertyName: 'profile.avatar',
        relationType: 'one-to-one',
        aggregatedCardinality: 'one-to-one',
        target: 'AvatarEntity',
        isNullable: true,
        isCascade: true,
        isEager: false,
        isLazy: false,
        path: ['TestEntity', 'profile', 'avatar'],
        isExtended: true,
      });
    });

    it('should respect maxDepth parameter', () => {
      // Create a chain: TestEntity -> Profile -> Avatar
      const profileRelation: any = {
        propertyName: 'profile',
        relationType: 'one-to-one',
        type: 'ProfileEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: profileMetadata,
      };

      const avatarRelation: any = {
        propertyName: 'avatar',
        relationType: 'one-to-one',
        type: 'AvatarEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: avatarMetadata,
      };

      metadata.relations = [profileRelation as any];
      profileMetadata.relations = [avatarRelation as any];
      avatarMetadata.relations = [];

      mockGetTypeName
        .mockReturnValueOnce('ProfileEntity')
        .mockReturnValue('AvatarEntity');

      const result = getEntityRelationsExtended(repository, 1);

      // Should only include direct relations, not extended ones
      expect(result).toHaveLength(1);
      expect(result[0].isExtended).toBe(false);
      expect(result[0].propertyName).toBe('profile');
    });

    it('should avoid cycles by tracking visited entities', () => {
      // Create a cycle: TestEntity -> Profile -> User (back to TestEntity)
      const profileRelation: any = {
        propertyName: 'profile',
        relationType: 'one-to-one',
        type: 'ProfileEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: profileMetadata,
      };

      const userRelation: any = {
        propertyName: 'user',
        relationType: 'one-to-one',
        type: 'TestEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: metadata,
      };

      metadata.relations = [profileRelation as any];
      profileMetadata.relations = [userRelation as any];

      mockGetTypeName
        .mockReturnValueOnce('ProfileEntity')
        .mockReturnValue('TestEntity');

      const result = getEntityRelationsExtended(repository, 3);

      // Should not create infinite recursion
      expect(result).toHaveLength(1);
      expect(result[0].propertyName).toBe('profile');
      expect(result[0].isExtended).toBe(false);
    });

    it('should aggregate cardinality correctly across relation chains', () => {
      // TestEntity (one-to-many) -> Post (one-to-many) -> Comment
      const postsRelation: any = {
        propertyName: 'posts',
        relationType: 'one-to-many',
        type: 'PostEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: postMetadata,
      };

      const commentsRelation: any = {
        propertyName: 'comments',
        relationType: 'one-to-many',
        type: 'CommentEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: commentMetadata,
      };

      metadata.relations = [postsRelation as any];
      postMetadata.relations = [commentsRelation as any];
      commentMetadata.relations = [];

      mockGetTypeName
        .mockReturnValueOnce('PostEntity')
        .mockReturnValueOnce('CommentEntity')
        .mockReturnValueOnce('CommentEntity');

      const result = getEntityRelationsExtended(repository, 2);

      expect(result).toHaveLength(2);

      // Direct relation
      expect(result[0].aggregatedCardinality).toBe('one-to-many');

      // Extended relation: one-to-many + one-to-many = one-to-many
      expect(result[1].aggregatedCardinality).toBe('one-to-many');
      expect(result[1].propertyName).toBe('posts.comments');
    });

    it('should handle many-to-many aggregated cardinality', () => {
      // TestEntity (one-to-many) -> Post (many-to-one) -> Author = many-to-many
      const postsRelation: any = {
        propertyName: 'posts',
        relationType: 'one-to-many',
        type: 'PostEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: postMetadata,
      };

      const authorRelation: any = {
        propertyName: 'author',
        relationType: 'many-to-one',
        type: 'TestEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: metadata,
      };

      metadata.relations = [postsRelation as any];
      postMetadata.relations = [authorRelation as any];

      mockGetTypeName
        .mockReturnValueOnce('PostEntity')
        .mockReturnValue('TestEntity');

      const result = getEntityRelationsExtended(repository, 2);

      expect(result).toHaveLength(1); // Only direct relation (cycle prevention)
      expect(result[0].aggregatedCardinality).toBe('one-to-many');
    });

    it('should handle nullable and cascade properties in extended relations', () => {
      const profileRelation: any = {
        propertyName: 'profile',
        relationType: 'one-to-one',
        type: 'ProfileEntity',
        isNullable: true,
        isCascadeInsert: true,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: profileMetadata,
      };

      const avatarRelation: any = {
        propertyName: 'avatar',
        relationType: 'one-to-one',
        type: 'AvatarEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: avatarMetadata,
      };

      metadata.relations = [profileRelation as any];
      profileMetadata.relations = [avatarRelation as any];
      avatarMetadata.relations = [];

      mockGetTypeName
        .mockReturnValueOnce('ProfileEntity')
        .mockReturnValueOnce('AvatarEntity')
        .mockReturnValueOnce('AvatarEntity');

      const result = getEntityRelationsExtended(repository, 2);

      expect(result).toHaveLength(2);

      // Extended relation should inherit nullable from parent
      expect(result[1].isNullable).toBe(true); // true OR false = true
      expect(result[1].isCascade).toBe(true); // cascade from parent
    });

    it('should handle eager and lazy properties correctly', () => {
      const profileRelation: any = {
        propertyName: 'profile',
        relationType: 'one-to-one',
        type: 'ProfileEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: true,
        isLazy: false,
        inverseEntityMetadata: profileMetadata,
      };

      const avatarRelation: any = {
        propertyName: 'avatar',
        relationType: 'one-to-one',
        type: 'AvatarEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: true,
        isLazy: false,
        inverseEntityMetadata: avatarMetadata,
      };

      metadata.relations = [profileRelation as any];
      profileMetadata.relations = [avatarRelation as any];
      avatarMetadata.relations = [];

      mockGetTypeName
        .mockReturnValueOnce('ProfileEntity')
        .mockReturnValueOnce('AvatarEntity')
        .mockReturnValueOnce('AvatarEntity');

      const result = getEntityRelationsExtended(repository, 2);

      expect(result).toHaveLength(2);

      // Extended relation should be eager only if both are eager
      expect(result[1].isEager).toBe(true); // true AND true = true
      expect(result[1].isLazy).toBe(false); // lazy from parent
    });

    it('should skip duplicate paths', () => {
      // Create scenario where same path could be visited multiple times
      const profileRelation: any = {
        propertyName: 'profile',
        relationType: 'one-to-one',
        type: 'ProfileEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: profileMetadata,
      };

      const tagsRelation: any = {
        propertyName: 'tags',
        relationType: 'many-to-many',
        type: 'TagEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: tagMetadata,
      };

      // Both profile and tags point to same user relations
      const userRelation1: any = {
        propertyName: 'users',
        relationType: 'many-to-many',
        type: 'TestEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: metadata,
      };

      metadata.relations = [profileRelation, tagsRelation] as any[];
      profileMetadata.relations = [];
      tagMetadata.relations = [userRelation1 as any];

      mockGetTypeName
        .mockReturnValueOnce('ProfileEntity')
        .mockReturnValueOnce('TagEntity')
        .mockReturnValue('TestEntity');

      const result = getEntityRelationsExtended(repository, 2);

      // Should not have duplicate paths
      const paths = result.map(r => r.path.join('.'));
      const uniquePaths = [...new Set(paths)];
      expect(paths.length).toBe(uniquePaths.length);
    });

    it('should use default maxDepth of 2', () => {
      const profileRelation: any = {
        propertyName: 'profile',
        relationType: 'one-to-one',
        type: 'ProfileEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: profileMetadata,
      };

      metadata.relations = [profileRelation as any];
      profileMetadata.relations = [];
      mockGetTypeName.mockReturnValue('ProfileEntity');

      const result = getEntityRelationsExtended(repository); // No maxDepth specified

      expect(result).toHaveLength(1);
      expect(result[0].isExtended).toBe(false);
    });
  });

  describe('getAggregatedCardinality (internal function testing through getEntityRelationsExtended)', () => {
    let profileMetadata: jest.Mocked<EntityMetadata>;
    let postMetadata: jest.Mocked<EntityMetadata>;

    beforeEach(() => {
      profileMetadata = {
        name: 'ProfileEntity',
        relations: [],
      } as any;

      postMetadata = {
        name: 'PostEntity',
        relations: [],
      } as any;
    });

    it('should return many-to-many for one-to-many + many-to-one', () => {
      // Create: TestEntity (one-to-many) -> Posts (many-to-one) -> Author
      const postsRelation: any = {
        propertyName: 'posts',
        relationType: 'one-to-many',
        type: 'PostEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: postMetadata,
      };

      const authorRelation: any = {
        propertyName: 'author',
        relationType: 'many-to-one',
        type: 'TestEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: metadata,
      };

      metadata.relations = [postsRelation as any];
      postMetadata.relations = [authorRelation as any];

      mockGetTypeName
        .mockReturnValueOnce('PostEntity')
        .mockReturnValue('TestEntity');

      const result = getEntityRelationsExtended(repository, 2);

      // Should only have direct relation due to cycle prevention
      expect(result).toHaveLength(1);
      expect(result[0].aggregatedCardinality).toBe('one-to-many');
    });

    it('should return one-to-many for one-to-many + one-to-many', () => {
      const postsRelation: any = {
        propertyName: 'posts',
        relationType: 'one-to-many',
        type: 'PostEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: postMetadata,
      };

      const commentsRelation: any = {
        propertyName: 'comments',
        relationType: 'one-to-many',
        type: 'CommentEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: {} as EntityMetadata,
      };

      metadata.relations = [postsRelation as any];
      postMetadata.relations = [commentsRelation as any];

      mockGetTypeName
        .mockReturnValueOnce('PostEntity')
        .mockReturnValueOnce('CommentEntity')
        .mockReturnValueOnce('CommentEntity');

      const result = getEntityRelationsExtended(repository, 2);

      expect(result).toHaveLength(2);
      expect(result[1].aggregatedCardinality).toBe('one-to-many');
    });

    it('should return many-to-one for many-to-one + many-to-one', () => {
      const profileRelation: any = {
        propertyName: 'profile',
        relationType: 'many-to-one',
        type: 'ProfileEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: profileMetadata,
      };

      const userRelation: any = {
        propertyName: 'user',
        relationType: 'many-to-one',
        type: 'TestEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: metadata,
      };

      metadata.relations = [profileRelation as any];
      profileMetadata.relations = [userRelation as any];

      mockGetTypeName
        .mockReturnValueOnce('ProfileEntity')
        .mockReturnValue('TestEntity');

      const result = getEntityRelationsExtended(repository, 2);

      // Only direct relation due to cycle prevention
      expect(result).toHaveLength(1);
      expect(result[0].aggregatedCardinality).toBe('many-to-one');
    });

    it('should return many-to-many when any relation is many-to-many', () => {
      const tagsRelation: any = {
        propertyName: 'tags',
        relationType: 'many-to-many',
        type: 'TagEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: {} as EntityMetadata,
      };

      const usersRelation: any = {
        propertyName: 'users',
        relationType: 'one-to-many',
        type: 'TestEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: metadata,
      };

      metadata.relations = [tagsRelation as any];
      const tagMetadata = {
        name: 'TagEntity',
        relations: [usersRelation as any],
      } as any;

      (tagsRelation as any).inverseEntityMetadata = tagMetadata;

      mockGetTypeName
        .mockReturnValueOnce('TagEntity')
        .mockReturnValue('TestEntity');

      const result = getEntityRelationsExtended(repository, 2);

      // Only direct relation due to cycle prevention
      expect(result).toHaveLength(1);
      expect(result[0].aggregatedCardinality).toBe('many-to-many');
    });

    it('should handle one-to-one relations correctly', () => {
      const profileRelation: any = {
        propertyName: 'profile',
        relationType: 'one-to-one',
        type: 'ProfileEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: profileMetadata,
      };

      const avatarRelation: any = {
        propertyName: 'avatar',
        relationType: 'one-to-many',
        type: 'AvatarEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: {} as EntityMetadata,
      };

      metadata.relations = [profileRelation as any];
      profileMetadata.relations = [avatarRelation as any];

      mockGetTypeName
        .mockReturnValueOnce('ProfileEntity')
        .mockReturnValueOnce('AvatarEntity')
        .mockReturnValueOnce('AvatarEntity');

      const result = getEntityRelationsExtended(repository, 2);

      expect(result).toHaveLength(2);
      // one-to-one should return the second cardinality (one-to-many)
      expect(result[1].aggregatedCardinality).toBe('one-to-many');
    });
  });
  describe('edge cases and error scenarios', () => {
    let profileMetadata: jest.Mocked<EntityMetadata>;

    beforeEach(() => {
      profileMetadata = {
        name: 'ProfileEntity',
        relations: [],
      } as any;
    });

    it('should handle empty entity metadata gracefully', () => {
      metadata.relations = [];
      metadata.name = '';

      const result = getEntityRelations(repository);

      expect(result).toEqual([]);
    });

    it('should handle relations with undefined type', () => {
      const mockRelation: any = {
        propertyName: 'invalidRelation',
        relationType: 'one-to-one',
        type: undefined,
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
      };

      metadata.relations = [mockRelation as any];
      mockGetTypeName.mockReturnValue('UnknownType');

      const result = getEntityRelations(repository);

      expect(result).toHaveLength(1);
      expect(result[0].target).toBe('UnknownType');
      expect(mockGetTypeName).toHaveBeenCalledWith(undefined);
    });

    it('should handle missing inverse entity metadata', () => {
      const mockRelation: any = {
        propertyName: 'profile',
        relationType: 'one-to-one',
        type: 'ProfileEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: undefined,
      };

      metadata.relations = [mockRelation as any];
      mockGetTypeName.mockReturnValue('ProfileEntity');

      // Should not crash when inverseEntityMetadata is undefined
      expect(() => getEntityRelationsExtended(repository)).not.toThrow();
    });

    it('should handle very deep relation chains without stack overflow', () => {
      // Create a long chain but limited by maxDepth
      const profileRelation: any = {
        propertyName: 'profile',
        relationType: 'one-to-one',
        type: 'ProfileEntity',
        isNullable: false,
        isCascadeInsert: false,
        isCascadeUpdate: false,
        isCascadeRemove: false,
        isEager: false,
        isLazy: false,
        inverseEntityMetadata: profileMetadata,
      };

      metadata.relations = [profileRelation as any];
      profileMetadata.relations = [];
      mockGetTypeName.mockReturnValue('ProfileEntity');

      // Should complete without issues even with high maxDepth
      const result = getEntityRelationsExtended(repository, 10);

      expect(result).toHaveLength(1);
      expect(result[0].isExtended).toBe(false);
    });
  });
});
