import { RootDefined } from "~/store/index";
import { createNamespace, DefineGetters, DefineMutations, DefineActions } from "~/types/store";
import { ID_FIELD, PARENT_FIELD, TITLE_FIELD, TYPE_FIELD } from "~/config/api";
import HTTPError from "~/exceptions/HTTPError";

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export interface State {}
export const state = () => ({} as State);
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export interface Getters {}

export const getters: RootDefined.Getters<Getters, State> = {};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Mutations {}

export const mutations: DefineMutations<Mutations, State> = {};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Actions {
  remove: { id: string };
}

export const actions: RootDefined.Actions<Actions, State, Getters, Mutations> = {
  async remove({}, { id }) {
    await this.$axios.$delete(`/api/links/${id}`).catch(e => {
      throw new HTTPError("REMOVE_LINK_FAILED", { id }, e);
    });
  }
};

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export const helpers = createNamespace<State, Getters, Mutations, Actions>("links");
