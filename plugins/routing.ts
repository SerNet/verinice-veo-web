import { Route, RawLocation } from "vue-router";
import { Context, InjectFunction } from "~/types/nuxt";

export default ({ app }: Context, inject: InjectFunction) => {
  const _resolve = app.router.resolve;
  app.router.resolve = function(to: RawLocation, current?: Route, append?: boolean) {
    const isStandalone = (current && current.query && current.query.standalone !== undefined) || false;
    if (isStandalone) {
      if (typeof to == "object") {
        to.query = { ...to.query, standalone: "1" };
      } else {
        to = (to || "") + "?standalone=1";
      }
    }
    const resolved = _resolve.call(this, to, current, append);

    if (typeof to == "object") {
      if ("prefer" in to) {
        const isMobile = window.$nuxt.$vuetify.breakpoint.xs;
        if (isMobile || isStandalone) {
          return resolved;
        } else {
          const newTo = { ...to, query: { ...(to.query || {}) } };
          if (current) {
            newTo.path = current.path;
          }
          if (to.path) {
            const queryName = to.prefer == "left" ? "l" : "r";
            const paths = String(to.path)
              .split("/")
              .slice(1);
            newTo.query[queryName] = paths.shift() || "";
          }
          return _resolve.call(this, newTo, current, append);
        }
      }
    }
    return resolved;
  };
};

declare module "vue-router/types/router" {
  export interface Route {
    prefer?: "left" | "right";
  }
  export interface Location {
    prefer?: "left" | "right";
  }
}
