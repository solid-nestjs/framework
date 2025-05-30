import {
  CrudControllerFrom,
  CrudControllerStructure,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { InvoicesService, serviceStructure } from './invoices.service';

const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: InvoicesService,
});

export class InvoicesController extends CrudControllerFrom(
  controllerStructure,
) {}
