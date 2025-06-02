import {
  CrudControllerFrom,
  CrudControllerStructure,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { ProductsService, serviceStructure } from './products.service';

const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ProductsService,
  operations: {
    recover: true,
    hardRemove: true,
  },
});

export class ProductsController extends CrudControllerFrom(
  controllerStructure,
) {}
