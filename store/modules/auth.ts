import Vue from "vue";
import { RootState } from "~/store/index";
import { Module } from "vuex";
import { AxiosError } from "axios";
import jsonwebtoken from "jsonwebtoken";
import { DefineModule, createNamespacedHelpers } from "vuex";

export interface State {
  token: null | string;
  username: null | string;
  error: null | Error;
}

export interface Getters {
  authorizationHeader: (state: any) => string;
  errorMessage: string;
}

export interface Mutations {
  setToken: string | null;
  setTokenPayload: UserTokenPayload | null;
  setError: Error | null;
}

export interface Actions {
  init: {};
  login: { username: string; password: string };
  logout: {};
}

interface UserTokenPayload {
  exp: number;
  sub: string;
  iss: string;
  iat: number;
  aud: string;
  profiles: string[];
}

const module: DefineModule<State, Getters, Mutations, Actions> = {
  namespaced: true,
  state: {
    token: null,
    username: null,
    error: null
  },
  mutations: {
    setToken(state, value) {
      state.token = value;
    },
    setTokenPayload(state, value) {
      state.username = value ? value.sub : "";
    },
    setError(state, value) {}
  },
  getters: {
    authorizationHeader: (state: any) => state.token,
    errorMessage: (state: any) => (state.error && state.error.message) || ""
  },
  actions: {
    async init({ state, dispatch }, payload) {
      if (!state.token)
        return await dispatch("login", {
          username: "admin",
          password: "password"
        });
    },
    async login(this: Vue, { commit }, payload) {
      commit("setError", null);
      try {
        const response = await this.$axios.post("/api/login", payload);
        commit("setToken", response.headers["authorization"]);
        const header = response.headers["authorization"];
        const [type, token] = header.split(/\s+/);
        const user = jsonwebtoken.decode(token) as UserTokenPayload;
        commit("setTokenPayload", user);
      } catch (e) {
        if (e.response) {
          const { response } = e as AxiosError;
          const err = new this.$error("AUTH_LOGIN_FAILED", {
            status: response!.status,
            cause: e
          });
          commit("setError", err);
          //throw err;
          return false;
        }
        throw e;
      }
    },
    async logout({ commit }) {
      commit("setToken", null);
      commit("setTokenPayload", null);
    }
  }
};

export const helpers = createNamespacedHelpers<
  State,
  Getters,
  Mutations,
  Actions
>("auth");

export default module;
