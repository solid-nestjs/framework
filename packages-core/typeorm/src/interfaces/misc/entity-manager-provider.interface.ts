import { EntityManager } from 'typeorm';
import { Context } from './context.interface';

export interface EntityManagerProvider<ContextType extends Context> {
  getEntityManager(context: ContextType): EntityManager;
}
