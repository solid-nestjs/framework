import { EntityManager } from "typeorm";

export interface IContext {
    transactionManager?:EntityManager;
}