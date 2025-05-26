import { DeepPartial } from '../../types'
import { Context, IdTypeFrom, Entity } from "../misc";
import { DataService } from "./data-service.interface";

export interface CudService<
        IdType extends IdTypeFrom<EntityType>,
        EntityType extends Entity<unknown>,
        CreateInputType extends DeepPartial<EntityType>,
        UpdateInputType extends DeepPartial<EntityType>,
        ContextType extends Context = Context
        > {
           
            create(
                context:ContextType,
                createInput: CreateInputType
                ): Promise<EntityType>;

            update(
                context:ContextType,
                id: IdType, 
                updateInput: UpdateInputType
                ): Promise<EntityType>;

            remove(
                context:ContextType,
                id: IdType
                ): Promise<EntityType>;
            
            hardRemove(
                context:ContextType,
                id: IdType
                ): Promise<EntityType>; 

        }

export interface CrudService<
        IdType extends IdTypeFrom<EntityType>,
        EntityType extends Entity<unknown>,
        CreateInputType extends DeepPartial<EntityType>,
        UpdateInputType extends DeepPartial<EntityType>,
        ContextType extends Context = Context
        > extends DataService<IdType,EntityType,ContextType>,
                    CudService<IdType,EntityType,CreateInputType,UpdateInputType,ContextType>{
           

        }