import { SolidInput } from '@solid-nestjs/typeorm-hybrid-crud';
import { GenerateDtoFromEntity } from '@solid-nestjs/rest-graphql';
import { Client } from '../../entities/client.entity';

@SolidInput()
export class CreateClientDto extends GenerateDtoFromEntity(Client) {}
