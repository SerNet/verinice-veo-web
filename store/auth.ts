import { createModule, useStore } from "vuex-typesafe-class";

import jsonwebtoken from "jsonwebtoken";
import { ApiUserTokenPayload } from "~/types/api";

import HTTPError from "~/exceptions/HTTPError";
import root from "~/store/index";
import BaseStore from "~/lib/BaseStore";

class Auth extends BaseStore {
  token?: string;
  error?: string;
  redirection?: string;
  persist: boolean = false;

  get isAuthorized() {
    return !!this.token;
  }

  get authorizationHeader() {
    return "Bearer " + this.token;
  }

  get payload() {
    return (this.token && (jsonwebtoken.decode(this.token) as ApiUserTokenPayload)) || undefined;
  }

  get username() {
    return this.payload && this.payload.sub;
  }

  set setToken(value: string | undefined) {
    this.token = value;
  }
  set setError(value: string | undefined) {
    this.error = value;
  }
  set setRedirection(path: string) {
    this.redirection = path;
  }
  set setPersist(value: boolean) {
    this.persist = value;
  }

  async login({ username, password, persist }: { username: string; password: string; persist?: boolean }) {
    const response = await this.$axios.post("/api/login", { username, password }).catch(e => {
      throw new HTTPError("AUTH_LOGIN_FAILED", e);
    });

    const header = response.headers["authorization"];
    const [, token] = header.split(/\s+/);
    await this.useToken({ token, persist });
    return token;
  }
  async useToken({ token, persist }: { token: string; persist?: boolean }) {
    this.setPersist = persist || false;
    this.setToken = token;
  }
  async redirect({ path }: { path: string }) {
    this.setRedirection = path;
  }
  async logout() {
    this.setToken = undefined;
  }
}
export default createModule(Auth, "auth");
