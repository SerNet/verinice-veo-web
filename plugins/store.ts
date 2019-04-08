export const test = 123;

export default ({ store }: any) => {
  const modules = store._modulesNamespaceMap;
  Object.keys(modules).forEach(name => {
    const m = modules[name];
    if (m._rawModule && m._rawModule.state && "$register" in m._rawModule.state) {
      m._rawModule.state.$register(store);
    }
  });

  // const instance = new Test();

  // console.log(Object.getOwnPropertyDescriptors(instance));
  // console.log(Object.getOwnPropertyDescriptors(Object.getPrototypeOf(instance)));
  // console.log(Object.getOwnPropertyDescriptors(Test.prototype));
};
