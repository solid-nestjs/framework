import { IsOptional } from "class-validator";
import { ArgsType, Field } from "@nestjs/graphql";
import { FindArgs } from "@solid-nestjs/common";
import { PaginationRequest } from "../inputs";

@ArgsType()
export class DefaultArgs<EntityType> implements FindArgs<EntityType> {
        @Field(() => PaginationRequest, { nullable: true })
        @IsOptional()
        pagination?: PaginationRequest;
}