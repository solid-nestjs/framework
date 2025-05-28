import { IsUUID } from "class-validator";
import { Field, ID, InputType } from "@nestjs/graphql";
import { PartialType } from "@solid-nestjs/typeorm-hybrid-crud";
import { CreateProductDto } from "./create-product.dto";

@InputType()
export class UpdateProductDto extends PartialType(CreateProductDto) {

    @Field(() => ID)
    @IsUUID()
    id?: string;
}