import { CrudControllerFrom } from '@nestjz/typeorm-crud';
import { ProductsService, serviceStructure } from './products.service';
import { CrudControllerStructure } from '@nestjz/typeorm-crud/dist/interfaces';

const controllerStructure = CrudControllerStructure({
    ...serviceStructure,
    serviceType:ProductsService,
    update:false
});

export class ProductsController extends CrudControllerFrom(controllerStructure) {

}
