import {
  CrudControllerFrom,
  CrudControllerStructure,
} from '@solid-nestjs/typeorm-crud';
import { ProductsService, serviceStructure } from './products.service';
import { GroupedProductArgs } from './dto';

const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  groupByArgsType: GroupedProductArgs,
  operations: {
    findAll: true,
    findOne: true,
    pagination: true,
    findAllPaginated: true,
    findAllGrouped: true,
    create: true,
    update: true,
    remove: true,
  },
});

export class ProductsController extends CrudControllerFrom(
  controllerStructure,
) {}
