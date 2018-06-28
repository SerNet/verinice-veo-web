import Vuex from 'vuex';

export default {
  namespaced: true,
  state: {
    items: [],
  },
  mutations: {
    setItems(state: any, value: any) {
      state.items = value;
    }
  },
  getters: {
    items: (state: any) => state.items
  },
  actions: {
    getItems({commit}: any) {
      commit('setItems', [
        {
          active: true,
          icon: 'folder',
          title: 'Beispieleintrag I',
        },
        {
          active: false,
          icon: 'settings',
          title: 'Einstellungen',
        },
      ]);
    },
  }
};
