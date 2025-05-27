import { CrudControllerFrom, CrudControllerStructure } from '@solid-nestjs/rest-api';
import { ProductsService, serviceStructure } from './products.service';

const controllerStructure = CrudControllerStructure({
    ...serviceStructure,
    serviceType:ProductsService,
});

export class ProductsController extends CrudControllerFrom(controllerStructure) {
    
}
