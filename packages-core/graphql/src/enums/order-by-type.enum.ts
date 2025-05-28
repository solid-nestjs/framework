import { registerEnumType } from "@nestjs/graphql";
import { OrderByTypes } from "@solid-nestjs/common";

registerEnumType(OrderByTypes,{name:'OrderTypes'})