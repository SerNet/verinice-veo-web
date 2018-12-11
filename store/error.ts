import { RootDefined } from "~/store/index";
import { createNamespace, DefineGetters, DefineMutations, DefineActions } from "~/types/store";

export interface State {
  items: string[];
}

export const state = () => ({ items: [] } as State);
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Getters {}
export const getters: RootDefined.Getters<Getters, State> = {};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Mutations {
  addError: string;
}

export const mutations: DefineMutations<Mutations, State> = {
  addError(state, value) {
    state.items.push(value);
  }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Actions {
  handle: Error;
}

export const actions: RootDefined.Actions<Actions, State, Getters, Mutations> = {
  async handle({ commit }, error) {
    commit("addError", error.message);
  }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export const helpers = createNamespace<State, Getters, Mutations, Actions>("error");
