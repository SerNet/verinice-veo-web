import Vue from "vue";
import { RootState, RootActions } from "~/store/index";
import { Module } from "vuex";
import { AxiosError } from "axios";
import jsonwebtoken from "jsonwebtoken";
import { DefineModule, createNamespacedHelpers } from "vuex";
import HTTPError from "../../exceptions/HTTPError";

export interface State {
  token: null | string;
  username: null | string;
  error: null | string;
  redirection: Redirection | null;
}

export interface Getters {
  isAuthorized: boolean;
  authorizationHeader: string;
}

export interface Mutations {
  setToken: string | null;
  setRedirection: Redirection | null;
  setTokenPayload: UserTokenPayload | null;
  setError: string | null;
}

export interface Actions {
  init: {};
  login: { username: string; password: string; persist?: boolean };
  useToken: { token: string; persist?: boolean };
  redirect: { path: string };
  logout: {};
}

interface Redirection {
  path: string;
}

interface UserTokenPayload {
  exp: number;
  sub: string;
  iss: string;
  iat: number;
  aud: string;
  profiles: string[];
}

const module: DefineModule<State, Getters, Mutations, Actions, {}, {}, {}, {}, {}, {}, RootActions> = {
  namespaced: true,
  state: {
    token: null,
    username: null,
    error: null,
    redirection: null
  },
  mutations: {
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
  },
  getters: {
    isAuthorized: (state: any) => !!state.token,
    authorizationHeader: (state: any) => "Bearer " + state.token
  },
  actions: {
    async init(this: Vue, { state, dispatch, commit }, payload) {
      const token = this.$cookies.get("token");
      if (token) {
        await dispatch("useToken", { token });
      }
    },
    async login(this: Vue, { commit, dispatch }, { username, password, persist }) {
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
      const user = jsonwebtoken.decode(token) as UserTokenPayload;
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
  }
};

export const helpers = createNamespacedHelpers<State, Getters, Mutations, Actions>("auth");

export default module;
