import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

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
    async getItems({commit}: any) {
      const response = await axios.get('https://v2020-rest.cpmsys.io/elements/aac77d09-15e2-41ed-9faf-2cbc98ee3b51');
      console.log(response);
      commit('setItems', response.data.properties);
    },
  }
};
