import { CrudControllerFrom, CrudControllerStructure, CrudServiceStructure } from '@nestjz/typeorm-crud';
import { ProductsService, serviceStructure } from './products.service';

const controllerStructure = CrudControllerStructure({
    ...serviceStructure,
    serviceType:ProductsService,
});

export class ProductsController extends CrudControllerFrom(controllerStructure) {

}
