import { createModule, useStore, Mutation } from "vuex-typesafe-class";
import BaseStore from "~/lib/BaseStore";
import LocalizedError from "~/exceptions/LocalizedError";

class ErrorStore extends BaseStore {
  items: string[] = [];

  set nextError(value: string) {
    this.items.push(value);
  }

  async handle(error: Error | LocalizedError<Error, any>) {
    this.nextError = error.message;
  }
}

export default createModule(ErrorStore, "error");
