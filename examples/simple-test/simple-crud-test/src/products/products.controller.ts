import { CrudControllerFrom, CrudControllerStructure } from '@nestjz/typeorm-crud';
import { ProductsService, serviceStructure } from './products.service';

const controllerStructure = CrudControllerStructure({
    ...serviceStructure,
    serviceType:ProductsService,
    update:false
});

export class ProductsController extends CrudControllerFrom(controllerStructure) {

}
