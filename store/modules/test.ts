// State
export interface CounterState {
  count: number;
}

// Getters
// key: getter name
// value: return type of getter
export interface CounterGetters {
  power: number;
}

// Mutations
// key: mutation name
// value: payload type of mutation
export interface CounterMutations {
  increment: { amount: number };
}

// Actions
// key: action name
// value: payload type of action
export interface CounterActions {
  incrementAsync: { amount: number; delay: number };
}

import { DefineModule } from "../../types/vuex/utils.d";

const counter: DefineModule<
  CounterState,
  CounterGetters,
  CounterMutations,
  CounterActions
> = {
  namespaced: true,

  state: {
    count: 0
  },

  getters: {
    power: state => state.count * state.count
  },

  mutations: {
    increment(state, payload) {
      state.count += payload.amount;
    }
  },

  actions: {
    incrementAsync({ commit }, payload) {
      setTimeout(() => {
        commit("increment", { amount: payload.amount });
      }, payload.delay);
    }
  }
};
