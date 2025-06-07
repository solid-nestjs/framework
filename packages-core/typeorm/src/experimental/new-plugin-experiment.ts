import { helloWorldPlugin } from './crud-plugins/hello-world.plugin';
import { CrudServiceStructureEx, DataServiceStructureEx } from '../interfaces';

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

const dataServiceStructure = DataServiceStructureEx({
  entityType: MyEntity,
  plugins: [helloWorldPlugin<string, MyEntity>()],
  hwMessage: 'america',
});

const crudServiceStructure = CrudServiceStructureEx({
  entityType: MyEntity,
  createInputType: MyEntityCreateDto,
  updateInputType: MyEntityUpdateDto,
  plugins: [
    helloWorldPlugin<string, MyEntity, MyEntityCreateDto, MyEntityUpdateDto>(),
  ],
  hwMessage: 'america',
});
