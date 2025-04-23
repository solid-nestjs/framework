import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { ContextUtils } from "../utils";
import { Context } from "../interfaces";

export const CurrentContext = createParamDecorator(
    ( data: unknown,context: ExecutionContext ) =>{

        const request = ContextUtils.getRequest(context);
        if (!request) {
            throw new Error('Request not found in the context');
        }
        const transactionManager = request.transactionManager;

        const currentContext:Context = { transactionManager };

        return currentContext;
    })