import { Plugin } from '@nuxt/types';

import LocalStorage from '~/util/LocalStorage';

/**
 * This class / plugin aims to reduce the amount of clicks the user has to take while navigation the app.
 */
class NavigationAssistant {
  private _lastDomain: string | null = null;

  private _lastUnit: string | null = null;

  constructor() {
    this._lastDomain = LocalStorage.lastDomain;
    this._lastUnit = LocalStorage.lastUnit;
  }

  public updateLastDomain(newDomain: string | undefined) {
    this._lastDomain = newDomain ?? null;
    LocalStorage.lastDomain = this._lastDomain;
  }

  public updateLastUnit(newUnit: string | undefined) {
    this._lastUnit = newUnit ?? null;
    LocalStorage.lastUnit = this._lastUnit;
  }

  get lastDomain(): string | undefined {
    return this._lastDomain ?? undefined;
  }

  get lastUnit(): string | undefined {
    return this._lastUnit ?? undefined;
  }
}

/**
 * Default export of the plugin, injects auth in the nuxt context after initializing auth.
 */
export default (function ({ app, route }, inject) {
  const $navigationAssistant = new NavigationAssistant();

  app.router?.beforeEach((to, from, next) => {
    console.log(to, from);
    next();
  });

  console.log(route);

  inject('navigationAssistant', $navigationAssistant);
} as Plugin);
