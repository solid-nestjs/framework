import { UnionToIntersection } from '@solid-nestjs/common';

abstract class ServicePlugin<T, U> {
  property: string = 'hola';

  function() {
    return 1;
  }
}

class MyPlugin1 extends ServicePlugin<{ myprop1: string }, number> {}
class MyPlugin2 extends ServicePlugin<{ myprop2: number }, string> {}
class MyPlugin3 extends ServicePlugin<{ myprop3: Date }, string> {}

type PluginFirstGenericArg<C> =
  C extends ServicePlugin<infer T, any> ? T : never;

const plugin1: ServicePlugin<{ myprop1: string }, number> = new MyPlugin1();
const plugin2: ServicePlugin<{ myprop2: number }, string> = new MyPlugin2();
const plugin3: ServicePlugin<{ myprop3: Date }, string> = new MyPlugin3();

const plugins = { plugin1, plugin2, plugin3 };

type arrType = typeof plugins;

type ExtractPluginOptions<PluginBundleType> = UnionToIntersection<
  PluginFirstGenericArg<PluginBundleType[keyof PluginBundleType]>
>;

type PluginOptions = ExtractPluginOptions<arrType>;

interface MyBaseStructure<T = {}> {
  anything: string;

  plugins?: T;
}

type MyStructure<T> = MyBaseStructure<T> & ExtractPluginOptions<T>;

function GetMyStructure<T>(input: MyStructure<T>): MyStructure<T> {
  return input;
}

const str = GetMyStructure({
  anything: 'hola',
  plugins: plugins,
  myprop1: 'myprop',
  myprop2: 1,
  myprop3: new Date(),
});
