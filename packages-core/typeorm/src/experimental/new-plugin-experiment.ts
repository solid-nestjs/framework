import { helloWorldPlugin } from './crud-plugins/hello-world.plugin';
import { CrudServiceStructureEx, DataServiceStructureEx } from '../interfaces';
import { CrudProviderStructure } from '@solid-nestjs/common';

class MyEntity {
  id!: string;
  name!: string;
}

class MyEntityCreateDto {
  name!: string;
}

class MyEntityUpdateDto {
  name?: string;
}

const providerStructure = CrudProviderStructure({
  entityType: MyEntity,
  createInputType: MyEntityCreateDto,
  updateInputType: MyEntityUpdateDto,
});

const dataServiceStructure = DataServiceStructureEx({
  ...providerStructure,
  plugins: [helloWorldPlugin(providerStructure)],
  hwMessage: 'america',
});

const crudServiceStructure = CrudServiceStructureEx({
  ...providerStructure,
  plugins: [helloWorldPlugin(providerStructure)],
  hwMessage: 'america',
});
