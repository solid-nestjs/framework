import { ExecutionContext } from '@nestjs/common';

export class ContextUtils {
  static getRequest(context: ExecutionContext) {
    let request = context.switchToHttp().getRequest();

    return request;
  }
}
