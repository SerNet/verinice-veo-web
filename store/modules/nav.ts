import Vue from "vue";
import { RootState } from "~/store/index";
import { Module } from "vuex";
import { DefineModule, createNamespacedHelpers } from "vuex";

export interface NavItem {
  active: boolean;
  icon: string;
  title: string;
  to?: string;
}

const state = {
  items: [
    {
      active: true,
      icon: "folder",
      title: "Arbeitsbereich 1",
      to: "/elements"
    },
    {
      active: false,
      icon: "folder",
      title: "Arbeitsbereich 2",
      to: "/test"
    },
    {
      active: false,
      icon: "settings",
      title: "Einstellungen",
      to: "/settings"
    }
  ] as NavItem[]
};

export type NavState = typeof state;

const module: Module<NavState, RootState> = {
  namespaced: true,
  state,
  mutations: {
    setItems(state, value) {
      state.items = value;
    }
  }
};

export const helpers = createNamespacedHelpers("nav");

export default module;
