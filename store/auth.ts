import jsonwebtoken from "jsonwebtoken";
import HTTPError from "~/exceptions/HTTPError";
import Vue from "vue";
import { createNamespacedHelpers, MutationTree, GetterTree, ActionTree } from "vuex";
import { RootState } from "~/store/index";
import { VeoUserTokenPayload } from "~/types/api";

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

export const mutations: MutationTree<State> = {
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

export const getters: GetterTree<State, RootState> = {
  isAuthorized: state => !!state.token,
  authorizationHeader: state => "Bearer " + state.token
};

export const actions: ActionTree<State, RootState> = {
  async init({ state, dispatch, commit }, payload) {
    const token = this.$cookies.get("token");
    if (token) {
      await dispatch("useToken", { token });
    }
  },
  async login({ commit, dispatch }, { username, password, persist }) {
    const response = await this.$axios
      .post("/api/login", {
        username,
        password
      })
      .catch(e => {
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
    if (persist) {
      this.$cookies.set("token", token, {
        path: "/",
        maxAge: user.exp - user.iat
      });
    }
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

export const helpers = createNamespacedHelpers("auth");
