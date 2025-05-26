import { EntityManager } from "typeorm";
import { Context as CommonContext } from "@nestjz/common";

export interface Context extends CommonContext {
    transactionManager?:EntityManager;
}