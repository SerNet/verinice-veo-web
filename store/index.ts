import { createModule, useStore, Mutation } from "vuex-typesafe-class";
import BaseStore from "~/lib/BaseStore";

class RootStore extends BaseStore {
  version = "1.0.0";
  errors = [];

  async nuxtServerInit() {
    await this.init({});
  }

  async init({}) {}
}

export default createModule(RootStore);
