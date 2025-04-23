import { EntityManager } from "typeorm";

export interface Context {
    transactionManager?:EntityManager;
}