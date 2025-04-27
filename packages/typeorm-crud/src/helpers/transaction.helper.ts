import { DataSource, QueryRunner } from "typeorm";
import { IsolationLevel } from "typeorm/driver/types/IsolationLevel";
import { Context, EntityManagerProvider } from "../interfaces";
import { InternalServerErrorException } from "@nestjs/common";

export async function injectTransaction(
    options:any,
    next: (...args:any[]) => Promise<any>,
    args:any[]
): Promise<any>
{
    if(typeof(options?.injectable?.getEntityManager) !== 'function')
        throw new InternalServerErrorException("cannot injectTransaction, function getEntityManager is needed in the service class",{ cause:{ obj: options, args } });

    const service = options.injectable as EntityManagerProvider<Context>;
    const isolationLevel = options.isolationLevel as IsolationLevel

    const [ context, ...otherArgs ] = args as [ Context, ...any[] ];
    
    const manager = service.getEntityManager(context);

    return runInTransaction(context,manager.connection,(context) => next(context,...otherArgs),isolationLevel);
}

export async function runInTransaction<ContextType extends Context,ReturnType>(
    context:ContextType,
    dataSource:DataSource,
    fn:(context:ContextType) => Promise<ReturnType>,
    isolationLevel?: IsolationLevel
):Promise<ReturnType>{

    //If there is a transactionManager already, do not start a new transaction
    if(context.transactionManager)      //If a different transaction is needed, then remove the transactionManager from the context before calling this function
        return fn(context);

    const queryRunner: QueryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();
   
    await queryRunner.startTransaction(isolationLevel);

    try {

        const transactionManager = queryRunner.manager;

        const newContext = {...context, transactionManager };

        const result = await fn(newContext);

        await queryRunner.commitTransaction();

        return result;
    } catch (error) {

        await queryRunner.rollbackTransaction();
        throw error;
    } finally {

        await queryRunner.release();
    }
}