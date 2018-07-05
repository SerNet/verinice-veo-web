import Vue from 'vue';
import Vuex from 'vuex';
import auth from './modules/auth';
import nav from './modules/nav';
import tree from './modules/tree';
import form from './modules/form';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

const state = {
  version: '1.0.0'
}
export type RootState = typeof state;

export default () => new Vuex.Store<RootState>({
  modules: {
    auth,
    nav,
    tree,
    form
  },
  strict: debug,
  actions: {
    async nuxtServerInit({dispatch}) {
      await dispatch('auth/init')
    }
  }
});
