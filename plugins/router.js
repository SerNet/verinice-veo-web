import * as URL from "url-parse";

export default ({ app, route }, inject) => {
  // Set `i18n` instance on `app`
  // This way we can use it in middleware and pages `asyncData`/`fetch`
  const store = app.store;
  const resolve = app.router.resolve;

  function patchQuery(href, obj) {
    const parsed = new URL(href);
    parsed.set("query", { ...parsed.query, ...obj });
    return parsed.href;
  }

  app.router.resolve = function() {
    const result = resolve.apply(this, arguments);
    const isExpedientView = store.getters.expedientView;
    if (isExpedientView) {
      const location = {
        ...result.location,
        query: { ...result.location.query, expedient: true }
      };
      const route = {
        ...result.route,
        query: { ...result.route.query, expedient: true }
      };
      const href = patchQuery(result.href, { expedient: [] });
      return {
        location,
        route,
        href: href,
        // for backwards compat
        normalizedTo: location,
        resolved: route
      };
    }
    return result;
  };
};
