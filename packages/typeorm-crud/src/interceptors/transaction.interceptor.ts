import { EntityManager } from "typeorm";
import { Observable, catchError, tap } from "rxjs";
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { ContextUtils } from "../utils";

@Injectable()
export class TransactionInterceptor implements NestInterceptor {

    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager
    ) { }

    async intercept(
        context: ExecutionContext,
        next: CallHandler
    ): Promise<Observable<any>> {

        const req = ContextUtils.getRequest(context);
        
        const queryRunner = this.entityManager.connection.createQueryRunner();

        await queryRunner.startTransaction();

        req.transactionManager = queryRunner.manager;

        return next.handle().pipe(
            tap(async () => {
                await queryRunner.commitTransaction();
                await queryRunner.release();
            }),
            catchError(async err => {
                await queryRunner.rollbackTransaction();
                await queryRunner.release();
                throw err;
            })
        );
    }
}