import { CrudServiceFrom, CrudServiceStructure } from '@nestjz/typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto, FindSupplierArgs, UpdateSupplierDto } from './dto';

export const serviceStructure= CrudServiceStructure({
  entityType: Supplier,
  createInputType: CreateSupplierDto,
  updateInputType: UpdateSupplierDto,
  findArgsType: FindSupplierArgs,
  functions:{
      findOne:{ relationsConfig:{ relations:{
        products:true
      } } }  
      ,findAll:{ relationsConfig:{ relations:{
        products:true
      } } }  
  },
});

export class SuppliersService extends CrudServiceFrom(serviceStructure){
  
}