import { CrudControllerFrom, CrudControllerStructure } from '@nestjz/rest-api';
import { SuppliersService, serviceStructure } from './suppliers.service';

const controllerStructure = CrudControllerStructure({
    ...serviceStructure,
    serviceType:SuppliersService,
});

export class SuppliersController extends CrudControllerFrom(controllerStructure) {
    
}
