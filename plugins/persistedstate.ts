import createPersistedState from "vuex-persistedstate";
import { Middleware } from "@nuxt/vue-app";
import { useStore } from "vuex-typesafe-class";
import auth from "~/store/auth";

export default (({ store, app }) => {
  const $auth = useStore(auth, store);
  createPersistedState({
    paths: ["auth.token"],
    storage: {
      getItem: key => {
        const value = app.$cookies.get(key);
        return value;
      },

      setItem: (key, value) => {
        const existing = app.$cookies.get(key);
        if (existing != value) {
          const persist = $auth.persist;
          app.$cookies.set(key, value, { secure: false, path: "/", maxAge: persist ? 24 * 60 * 1000 : 0 });
        }
      },
      removeItem: key => {
        app.$cookies.remove(key);
      }
    }
  })(store);
}) as Middleware;
