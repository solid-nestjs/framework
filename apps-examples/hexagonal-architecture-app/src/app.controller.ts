import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get()
  // @ApiOperation({ summary: 'Get application info' })
  // getHello(): string {
  //   return this.appService.getHello();
  // }

  // @Get('health')
  // @ApiOperation({ summary: 'Health check' })
  // getHealth(): { status: string; timestamp: string } {
  //   return this.appService.getHealth();
  // }
}
