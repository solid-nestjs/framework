import { Injectable } from '@nestjs/common';
import { FindArgs } from '@nestjz/typeorm-crud';

class FindArgsClass extends FindArgs()
{}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
