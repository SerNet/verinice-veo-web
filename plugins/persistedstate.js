import createPersistedState from "vuex-persistedstate";

export default ({ store, app }) => {
  createPersistedState({
    paths: ["auth.token"],
    storage: {
      getItem: key => app.$cookies.get(key),

      setItem: (key, value) => {
        const existing = app.$cookies.get(key);
        if (existing != value) {
          app.$cookies.set(key, value, { secure: false, path: "/", maxAge: 24 * 60 * 1000 });
        }
      },
      removeItem: key => {
        app.$cookies.remove(key);
      }
    }
  })(store);
};
