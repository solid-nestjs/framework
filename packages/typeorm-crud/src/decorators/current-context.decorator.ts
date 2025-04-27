import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { Context } from "../interfaces";

export const CurrentContext = createParamDecorator(
    ( data: unknown,context: ExecutionContext ) =>{

        const currentContext:Context = { };

        return currentContext;
    })