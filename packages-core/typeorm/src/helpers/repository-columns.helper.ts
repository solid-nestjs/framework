import { EntityMetadata, ObjectLiteral, Repository } from 'typeorm';

export function hasDeleteDateColumn<T extends ObjectLiteral>(
  repository: Repository<T>,
): boolean {
  const metadata: EntityMetadata = repository.metadata;
  return metadata.deleteDateColumn !== undefined;
}
