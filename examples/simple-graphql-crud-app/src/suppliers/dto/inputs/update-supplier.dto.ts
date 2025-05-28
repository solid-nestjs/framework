import { IsUUID } from "class-validator";
import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { CreateSupplierDto } from "./create-supplier.dto";

@InputType()
export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {

    @Field(() => ID)
    @IsUUID()
    id: string;
}