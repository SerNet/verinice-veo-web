const DECORATORS_KEY = "__decorators__";

import { ModuleTree, Plugin, Store } from "vuex";
import { registerModule, useModule } from "vuex-simple";

interface VuexModuleConstructor {
  new (): any & { [DECORATORS_KEY]: any };
}

export function Module(...namespace: string[]) {
  return function Module<T extends VuexModuleConstructor>(constructor: T): T & any {
    const m: any = new constructor();

    const state: any = {};
    Object.keys(m).forEach(key => (state[key] = m[key]));

    const out = {
      state: () => state,
      actions: {}
    };

    Object.defineProperty(out.state, "$register", {
      enumerable: false,
      value: (store: Store<any>) => {
        registerModule(store, namespace, m);
      }
    });

    return out;
  };
}
