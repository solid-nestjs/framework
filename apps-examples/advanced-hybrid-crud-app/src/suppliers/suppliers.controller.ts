import {
  CrudControllerFrom,
  CrudControllerStructure,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { SuppliersService, serviceStructure } from './suppliers.service';

const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: SuppliersService,
  operations: {
    recover: true,
    hardRemove: true,
  },
});

export class SuppliersController extends CrudControllerFrom(
  controllerStructure,
) {}
