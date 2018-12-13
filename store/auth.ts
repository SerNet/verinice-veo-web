import jsonwebtoken from "jsonwebtoken";
import HTTPError from "~/exceptions/HTTPError";
import Vue from "vue";
import { VeoUserTokenPayload } from "~/types/api";
import { RootState, RootGetters, RootMutations, RootActions } from "~/store/index";
import { createNamespace, DefineGetters, DefineMutations, DefineActions } from "~/types/store";

export interface State {
  token: null | string;
  username: null | string;
  error: null | string;
  redirection: { path: string } | null;
}

export const state = () =>
  ({
    token: null,
    username: null,
    error: null,
    redirection: null
  } as State);

//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Getters {
  isAuthorized: boolean;
  authorizationHeader: string;
}

export const getters: DefineGetters<Getters, State> = {
  isAuthorized: state => !!state.token,
  authorizationHeader: state => "Bearer " + state.token
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Mutations {
  setToken: string | null;
  setTokenPayload: VeoUserTokenPayload | null;
  setError: string;
  setRedirection: { path: string };
}

export const mutations: DefineMutations<Mutations, State> = {
  setToken(state, value) {
    state.token = value;
  },
  setTokenPayload(state, value) {
    state.username = value ? value.sub : "";
  },
  setError(state, value) {
    state.error = value;
  },
  setRedirection(state, value) {
    state.redirection = value;
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
    commit("setToken", token);
    const user = jsonwebtoken.decode(token) as VeoUserTokenPayload;
    commit("setTokenPayload", user);
    /*if (persist) {
      this.$cookies.set("token", token, { path: "/", maxAge: user.exp - user.iat });
    }*/
    await dispatch("init", {}, { root: true });
  },
  async redirect(this: Vue, { commit }, { path }) {
    commit("setRedirection", { path });
  },
  async logout(this: Vue, { commit, dispatch }) {
    commit("setToken", null);
    commit("setTokenPayload", null);
    this.$cookies.remove("token");
    await dispatch("init", {}, { root: true });
  }
};
//----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export const helpers = createNamespace<State, Getters, Mutations, Actions>("auth");
