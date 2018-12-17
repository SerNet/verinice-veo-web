import Vue from "vue";
import LocalizedError from "~/exceptions/LocalizedError";

export default ({ app }, inject) => {
  Vue.config.errorHandler = function(error: Error | LocalizedError<Error, any>) {
    const instance = Vue.prototype.$nuxt;
    return instance.$i18nError(error);
  };

  inject("i18nError", (error: Error | LocalizedError<Error, any>) => {
    if (typeof error["getPlaceholders"] == "function") {
      const le = error as LocalizedError<Error, any>;
      return app.$i18n.t.call(app.$i18n, "errors." + le.code, le.getPlaceholders());
    }
    return String(error);
  });
};
