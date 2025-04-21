import { IContext } from "./context.interface";

export interface IAuditService {

    Audit(
        context:IContext,
        serviceName:string,
        action:string,
        objectId?:any,
        valueBefore?:object,
        valueAfter?:object,
    ):Promise<void>;
}

export const IAuditService = Symbol("IAuditService");