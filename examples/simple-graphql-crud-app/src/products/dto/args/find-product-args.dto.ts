import { ArgsType, Field, InputType } from "@nestjs/graphql";
import { FindArgsFrom, getWhereClass, StringFilter, Where } from "@solid-nestjs/typeorm-graphql-crud";
import { FindSupplierArgs } from "../../../suppliers/dto";
import { Supplier } from "../../../suppliers/entities/supplier.entity";
import { Product } from "../../entities/product.entity";

const SupplierWhere = getWhereClass(FindSupplierArgs);

@InputType({ isAbstract: true })
class FindProductWhere implements Where<Product>
{
    @Field(() => StringFilter)
    name: StringFilter;

    @Field(() => SupplierWhere)
    supplier: Where<Supplier> | undefined;
}

@ArgsType()
export class FindProductArgs extends FindArgsFrom<Product>({ whereType:FindProductWhere })
{
    
}