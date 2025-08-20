import { PartialType, SolidInput } from '@solid-nestjs/typeorm-hybrid-crud';
import { CreateClientDto } from './create-client.dto';

@SolidInput()
export class UpdateClientDto extends PartialType(CreateClientDto) {}
