import { ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

export class ContextUtils {
    static getRequest(context: ExecutionContext){

        let request: any;

        if((context as any)?.contextType === 'graphql')
            request = GqlExecutionContext.create( context ).getContext().req;
        else
            request = context.switchToHttp().getRequest();

        return request;
    }
}