import { PipeTransform, Type } from "@nestjs/common";
import { getPipeTransformForType, getPropertyType } from "../../helpers";
import { Constructable } from "../../types";
import { Entity, IdTypeFrom } from "../misc";

export interface IdStructure<IdType>
{
    type:Constructable<IdType>,
    pipeTransforms?:Type<PipeTransform>[]
}

export interface EntityManagerStructure<
                            IdType extends IdTypeFrom<EntityType>,
                            EntityType extends Entity<unknown>,
                        > {    
    entityType:Constructable<EntityType>
    entityId?:IdStructure<IdType>,
}

export function fillEntityId<
                        IdType extends IdTypeFrom<EntityType>,
                        EntityType extends Entity<unknown>,
                        >(entityManager:EntityManagerStructure<IdType,EntityType>)
{
    if(entityManager.entityId)
        return;

    const idType = getPropertyType(entityManager.entityType,"id");
    const idPipeTransform = getPipeTransformForType(idType);

    entityManager.entityId = {
        type:idType,
        pipeTransforms:(idPipeTransform)?[idPipeTransform]:[]
    };
}