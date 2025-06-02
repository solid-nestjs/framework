import {
  CrudControllerFrom,
  CrudControllerStructure,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { ClientsService, serviceStructure } from './clients.service';

const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: ClientsService,
});

export class ClientsController extends CrudControllerFrom(
  controllerStructure,
) {}
