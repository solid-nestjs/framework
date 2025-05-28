import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IsString } from "class-validator";
import { CreateProductDto } from "./create-product.dto";

@InputType()
export class UpdateProductDto extends PartialType(CreateProductDto) {

    @Field(() => ID)
    @IsString()
    id: string;
}