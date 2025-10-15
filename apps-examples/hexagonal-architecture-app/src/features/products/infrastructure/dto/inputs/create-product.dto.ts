import { GenerateDtoFromEntity, SolidInput } from '@solid-nestjs/typeorm-hybrid-crud'; 
import { Product } from '../../entities/product.entity'; 

@SolidInput() 
export class CreateProductDto extends GenerateDtoFromEntity(Product) {}