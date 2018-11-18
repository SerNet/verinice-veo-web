import Vue from "vue";

Vue.config.errorHandler = function(error) {
  const instance = Vue.prototype.$nuxt;
  if (typeof error.getPlaceholders == "function") {
    error.message = instance.$i18n.t.call(instance.$i18n, "errors." + error.code, error.getPlaceholders());
  }
};
