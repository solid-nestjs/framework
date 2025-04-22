import { CrudControllerFrom, CrudControllerStructure } from '@nestjz/typeorm-crud';
import { ProductsService, serviceStructure } from './products.service';

const controllerStructure = CrudControllerStructure({
    ...serviceStructure,
    serviceType:ProductsService,
    create:{ name:"create" },
    update:{ name:"update" },
    remove:{ name:"remove" },
    findOne:{ name:"findOne" },
    findAll:{ name:"findAll" }
});

export class ProductsController extends CrudControllerFrom(controllerStructure) {

}
