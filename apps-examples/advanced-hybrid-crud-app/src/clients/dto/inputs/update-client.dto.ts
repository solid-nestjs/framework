import { InputType } from '@nestjs/graphql';
import { PartialType } from '@solid-nestjs/typeorm-hybrid-crud';
import { CreateClientDto } from './create-client.dto';

@InputType()
export class UpdateClientDto extends PartialType(CreateClientDto) {}
