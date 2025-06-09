import {
  CrudControllerExFrom,
  CrudControllerStructureEx,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { SuppliersService, providerStructure } from './suppliers.service';
import { helloWorldControllerPlugin } from '../plugins';

const controllerStructure = CrudControllerStructureEx({
  ...providerStructure,
  serviceType: SuppliersService,
  plugins: [helloWorldControllerPlugin(providerStructure)],
});

export class SuppliersController extends CrudControllerExFrom(
  controllerStructure,
) {}
