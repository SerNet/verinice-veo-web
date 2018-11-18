import Vue from "Vue";

module.exports = function() {
  this.nuxt.hook("render:errorMiddleware", app =>
    app.use(function(error, req, res, next) {
      const instance = Vue.prototype.$nuxt;
      if (typeof error.getPlaceholders == "function") {
        debugger;
        error.message = instance.$i18n.t.call(instance.$i18n, "errors." + error.code, error.getPlaceholders());
      }
      next(error);
    })
  );
};
