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
  operations: {
    saySimpleHello: { route: 'say/good-day' },
    saySimpleBye: false,
    sayHelloToCreate: { route: 'say/good-day' },
    sayByeToUpdate: { route: 'say/good-bye/:id' },
  },
});

export class SuppliersController extends CrudControllerExFrom(
  controllerStructure,
) {}
