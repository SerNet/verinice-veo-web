import Vue from "vue";
import NuxtError from "~/components/Error.vue";

function toAsyncComponent(component: any) {
  return () => ({
    component,
    timeout: 3000,
    error: NuxtError
  });
}

export default function(instance: Vue, route: string, context: Object = {}) {
  if (instance && instance.$router && route) {
    const router = instance.$router;
    const matched = router.getMatchedComponents(route);

    if (matched && matched.length && matched[0]) {
      const first: any = matched[0];
      const cmp: any = typeof first == "function" ? first() : first;
      if (cmp) {
        return toAsyncComponent(
          Promise.resolve(cmp).then(async (l: any) => {
            const options = l && l.options;

            if (options) {
              const _context = {
                ...instance["$nuxt"].$options.context,
                ...context
              };

              if (typeof options.validate == "function") {
                await options.validate(_context);
              }
              if (typeof options.fetch == "function") {
                await options.fetch(_context);
              }
              if (typeof options.asyncData == "function") {
                const asyncData = await options.asyncData(_context);
                if (typeof options.data == "function") {
                  const syncData = options.data;
                  const patchedData = function() {
                    const data = syncData();
                    return { ...data, ...asyncData };
                  };

                  return Vue.extend({ extends: l, data: patchedData });
                }
              }
            }
            return l;
          })
        );
      }
    }
  }
  //throw new Error(`Could not find route "${route}"`);
  return toAsyncComponent(import("~/components/" + "Error.vue"));
}
