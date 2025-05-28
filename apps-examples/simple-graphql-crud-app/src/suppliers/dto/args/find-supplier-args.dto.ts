import { ArgsType, Field, InputType } from "@nestjs/graphql";
import { FindArgsFrom, StringFilter, Where } from "@solid-nestjs/typeorm-graphql-crud";
import { Supplier } from "../../entities/supplier.entity";

@InputType({ isAbstract: true })
class FindSupplierWhere implements Where<Supplier>
{
    @Field(() => StringFilter)
    name: StringFilter;

    @Field(() => StringFilter)
    contactEmail: StringFilter;
}

@ArgsType()
export class FindSupplierArgs extends FindArgsFrom<Supplier>({ whereType:FindSupplierWhere })
{
    
}