import Vue from 'vue';
import Vuex from 'vuex';
import nav from './modules/nav';
import tree from './modules/tree';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default () => new Vuex.Store({
  modules: {
    nav,
    tree,
  },
  strict: debug,
});
