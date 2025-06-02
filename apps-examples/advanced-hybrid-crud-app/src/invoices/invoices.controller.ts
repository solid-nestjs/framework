import {
  CrudControllerFrom,
  CrudControllerStructure,
} from '@solid-nestjs/typeorm-hybrid-crud';
import { InvoicesService, serviceStructure } from './invoices.service';

const controllerStructure = CrudControllerStructure({
  ...serviceStructure,
  serviceType: InvoicesService,
  operations: {
    recover: true,
    hardRemove: true,
  },
});

export class InvoicesController extends CrudControllerFrom(
  controllerStructure,
) {}
