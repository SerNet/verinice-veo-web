import jsonwebtoken from "jsonwebtoken";
import HTTPError from "~/exceptions/HTTPError";
import Vue from "vue";
import { ApiUserTokenPayload } from "~/types/api";
import { RootState, RootGetters, RootMutations, RootActions } from "~/store/index";
import { createNamespace, DefineGetters, DefineMutations, DefineActions } from "~/types/store";

export interface State {
  token: null | string;
  error: null | string;
  redirection: { path: string } | null;
  persist: boolean;
}

export const state = () =>
  ({
    token: null,
    error: null,
    redirection: null,
    persist: false
  } as State);

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Getters {
  isAuthorized: boolean;
  authorizationHeader: string;
  payload?: ApiUserTokenPayload;
  username?: string;
}

export const getters: DefineGetters<Getters, State> = {
  isAuthorized: state => !!state.token,
  authorizationHeader: state => "Bearer " + state.token,
  payload: state => (state.token && <ApiUserTokenPayload>jsonwebtoken.decode(state.token)) || undefined,
  username: (state, getters) => getters.payload && getters.payload.sub
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Mutations {
  setToken: string | null;
  setError: string;
  setRedirection: { path: string };
  setPersist: boolean;
}

export const mutations: DefineMutations<Mutations, State> = {
  setToken(state, value) {
    state.token = value;
  },
  setError(state, value) {
    state.error = value;
  },
  setRedirection(state, value) {
    state.redirection = value;
  },
  setPersist(state, value) {
    state.persist = value;
  }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Actions {
  init: {};
  login: { username: string; password: string; persist: boolean };
  useToken: { token: string; persist?: boolean };
  redirect: { path: string };
  logout: {};
}

export const actions: DefineActions<
  Actions,
  State,
  Getters,
  Mutations,
  {},
  RootState,
  RootGetters,
  RootMutations,
  RootActions
> = {
  async init({ state, dispatch, commit }, payload) {},
  async login({ commit, dispatch }, { username, password, persist }) {
    const response = await this.$axios.post("/api/login", { username, password }).catch(e => {
      throw new HTTPError("AUTH_LOGIN_FAILED", e);
    });

    const header = response.headers["authorization"];
    const [type, token] = header.split(/\s+/);
    await dispatch("useToken", { token, persist });
    return token;
  },
  async useToken(this: Vue, { commit, dispatch }, { token, persist }) {
    commit("setPersist", persist || false);
    commit("setToken", token);
    await dispatch("init", {}, { root: true });
  },
  async redirect(this: Vue, { commit }, { path }) {
    commit("setRedirection", { path });
  },
  async logout(this: Vue, { commit, dispatch }) {
    commit("setToken", null);
    await dispatch("init", {}, { root: true });
  }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export const helpers = createNamespace<State, Getters, Mutations, Actions>("auth");
