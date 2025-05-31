import { Repository, EntityMetadata } from 'typeorm';
import { hasDeleteDateColumn } from '../../src/helpers/repository-columns.helper';

describe('repository-columns.helper', () => {
  describe('hasDeleteDateColumn', () => {
    let repository: jest.Mocked<Repository<any>>;
    let metadata: jest.Mocked<EntityMetadata>;

    beforeEach(() => {
      metadata = {
        deleteDateColumn: undefined,
      } as any;

      repository = {
        metadata,
      } as any;
    });

    it('should return true when entity has delete date column', () => {
      metadata.deleteDateColumn = {
        propertyName: 'deletedAt',
        databaseName: 'deleted_at',
      } as any;

      const result = hasDeleteDateColumn(repository);

      expect(result).toBe(true);
    });

    it('should return false when entity has no delete date column', () => {
      metadata.deleteDateColumn = undefined;

      const result = hasDeleteDateColumn(repository);

      expect(result).toBe(false);
    });

    it('should handle different delete date column configurations', () => {
      // Test with a different column configuration
      metadata.deleteDateColumn = {
        propertyName: 'removedAt',
        databaseName: 'removed_at',
      } as any;

      const result = hasDeleteDateColumn(repository);

      expect(result).toBe(true);
    });
  });
});
