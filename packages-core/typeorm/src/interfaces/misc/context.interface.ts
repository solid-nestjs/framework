import { EntityManager } from 'typeorm';
import { Context as CommonContext } from '@solid-nestjs/common';

export interface Context extends CommonContext {
  transactionManager?: EntityManager;
}
