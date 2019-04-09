import url from "url";
import os from "os";

import { Middleware } from "@nuxt/vue-app";
import { AxiosRequestConfig } from "axios";
import { useStore } from "vuex-typesafe-class";
import auth from "~/store/auth";
import error from "~/store/error";

const interfaces = os.networkInterfaces();
const addresses = ["localhost"];
for (var k in interfaces) {
  for (var k2 in interfaces[k]) {
    var address = interfaces[k][k2];

    addresses.push(address.address);
  }
}

function useProxy(config: AxiosRequestConfig) {
  const parsed = config.url && url.parse(config.url);
  if (!parsed || parsed.hostname === null || parsed.hostname === undefined) return false;
  return addresses.indexOf(parsed.hostname) === -1;
}

const plugin: Middleware = (context, inject) => {
  const { $axios, store } = context;
  const authStore = useStore(auth, store);
  const errorStore = useStore(error, store);

  $axios.setHeader("Content-Type", "application/json", ["post"]);

  $axios.onRequest(config => {
    if (process.server) {
      const consola = require("consola");
      consola.withScope("axios").debug((config.method ? config.method.toUpperCase() : "GET") + " " + config.url);
    }

    if (!useProxy(config)) {
      config.proxy = false;
    }

    //config.retry = false;

    //Authorization:

    const authorizationHeader = authStore.authorizationHeader;
    if (authorizationHeader) {
      config.headers.common["Authorization"] = authorizationHeader;
    } else {
      delete config.headers.common["Authorization"];
    }
  });

  $axios.onError(async err => {
    /* if (err.config && typeof err.config.error == "object") {
      throw err.config.error;
    }*/
    err.message = `Error while requesting '${err.config.url}': ` + err.message;
    await errorStore.handle(err);
  });
};

export default plugin;
