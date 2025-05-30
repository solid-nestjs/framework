import { Context } from './context.interface';

export interface AuditService {
  Audit(
    context: Context,
    serviceName: string,
    action: string,
    objectId?: any,
    valueBefore?: object,
    valueAfter?: object,
  ): Promise<void>;
}

export const AuditService = Symbol('AuditService');
