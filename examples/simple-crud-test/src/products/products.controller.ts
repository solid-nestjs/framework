import { CrudControllerFrom, CrudControllerStructure } from '@nestjz/rest-api';
import { ProductsService, serviceStructure } from './products.service';

const controllerStructure = CrudControllerStructure({
    ...serviceStructure,
    serviceType:ProductsService
});

export class ProductsController extends CrudControllerFrom(controllerStructure) {
    
}
