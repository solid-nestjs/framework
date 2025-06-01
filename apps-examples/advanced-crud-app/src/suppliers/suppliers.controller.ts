import {
  CrudControllerFrom,
  CrudControllerStructure,
} from '@solid-nestjs/typeorm-crud';
import { Post, Body, HttpCode, HttpStatus, Controller } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CurrentContext } from '@solid-nestjs/common';
import { SuppliersService, serviceStructure } from './suppliers.service';
import { CreateSupplierDto } from './dto/inputs/create-supplier.dto';
import { Supplier } from './entities/supplier.entity';
import { DeepPartial } from 'typeorm';
import { Context } from 'vm';

const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: SuppliersService,
});

export class SuppliersController extends CrudControllerFrom(
  controllerStructure,
) {
  @Post('bulk')
  @ApiOperation({
    summary: 'Bulk create suppliers',
    description: 'Create multiple suppliers in a single operation',
  })
  @ApiBody({
    description: 'Array of supplier creation data',
    type: CreateSupplierDto,
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      'Suppliers created successfully - returns array of created supplier IDs',
    type: String,
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @HttpCode(HttpStatus.CREATED)
  async bulkInsert(
    @CurrentContext() context: Context,
    @Body() createInputs: CreateSupplierDto[],
  ): Promise<string[]> {
    return this.service.bulkInsert(
      context,
      createInputs as DeepPartial<Supplier>[],
    );
  }
}
