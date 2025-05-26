import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const IgnoreArg = createParamDecorator(
    ( data: unknown,context: ExecutionContext ) =>{
        return undefined;
    })