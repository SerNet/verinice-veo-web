import Vue from "vue";
import { RootState, RootActions } from "~/store/index";
import { Module } from "vuex";
import { AxiosError } from "axios";
import jsonwebtoken from "jsonwebtoken";
import { DefineModule, createNamespacedHelpers } from "vuex";

export interface State {
  token: null | string;
  username: null | string;
  error: null | string;
}

export interface Getters {
  authorizationHeader: string;
}

export interface Mutations {
  setToken: string | null;
  setTokenPayload: UserTokenPayload | null;
  setError: string | null;
}

export interface Actions {
  init: {};
  login: { username: string; password: string; persist?: boolean };
  useToken: { token: string; persist?: boolean };
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

const module: DefineModule<
  State,
  Getters,
  Mutations,
  Actions,
  {},
  {},
  {},
  {},
  {},
  {},
  RootActions
> = {
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
    setError(state, value) {
      state.error = value;
    }
  },
  getters: {
    authorizationHeader: (state: any) => "Bearer " + state.token
  },
  actions: {
    async init(this: Vue, { state, dispatch, commit }, payload) {
      const token = this.$cookies.get("token");
      if (token) {
        await dispatch("useToken", { token });
      }
    },
    async login(
      this: Vue,
      { commit, dispatch },
      { username, password, persist }
    ) {
      commit("setError", null);
      try {
        const response = await this.$axios.post("/api/login", {
          username,
          password
        });

        const header = response.headers["authorization"];
        const [type, token] = header.split(/\s+/);
        dispatch("useToken", { token, persist });
      } catch (e) {
        if (e.response) {
          const { response } = e as AxiosError;
          const err = new this.$error("AUTH_LOGIN_FAILED", {
            status: response!.status,
            cause: e
          });
          commit("setError", err.message);
          return false;
        }
        throw e;
      }
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
    async logout(this: Vue, { commit, dispatch }) {
      commit("setToken", null);
      commit("setTokenPayload", null);
      this.$cookies.remove("token");
      await dispatch("init", {}, { root: true });
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
