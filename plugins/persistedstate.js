import createPersistedState from "vuex-persistedstate";

export default ({ store, app }) => {
  createPersistedState({
    paths: ["auth.token"],
    storage: {
      getItem: key => app.$cookies.get(key),

      setItem: (key, value) => {
        const existing = app.$cookies.get(key);
        if (existing != value) {
          const persist = store.state.auth.persist;
          app.$cookies.set(key, value, { secure: false, path: "/", maxAge: persist ? 24 * 60 * 1000 : 0 });
        }
      },
      removeItem: key => {
        app.$cookies.remove(key);
      }
    }
  })(store);
};
