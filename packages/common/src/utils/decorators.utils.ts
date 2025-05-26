import { applyDecorators } from "@nestjs/common";

export function applyMethodDecorators(decorators:(() => MethodDecorator)[])
{
    if(!decorators)
        return applyDecorators();

    return applyDecorators(...(decorators?.map((decorator) => decorator())));
}

export function applyClassDecorators(decorators:(() => ClassDecorator)[])
{
    if(!decorators)
        return applyDecorators();

    return applyDecorators(...(decorators?.map((decorator) => decorator())));
}