import {
  CrudControllerFrom,
  CrudControllerStructure,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { SuppliersService, providerStructure } from './suppliers.service';

const controllerStructure = CrudControllerStructure({
  ...providerStructure,
  serviceType: SuppliersService,
});

export class SuppliersController extends CrudControllerFrom(
  controllerStructure,
) {}
