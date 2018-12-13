<script lang="ts">
import Vue, { VNode, Component, ComponentOptions } from "vue";
import ErrorComponent from "~/components/Error.vue";

export default Vue.extend({
  props: {
    route: String,
    context: {
      default: () => ({}),
      type: Object
    }
  },
  data() {
    return {
      loading: false,
      error: undefined as Error | undefined
    };
  },
  methods: {
    async loadMatchedComponent(): Promise<Component> {
      const router = this.$router;
      const matched = router.getMatchedComponents(this.route);
      if (matched && matched.length) {
        const first: any = matched[matched.length - 1];
        const cmp: any = !first.options ? first() : first;
        if (cmp) {
          return await Promise.resolve(cmp);
        } else {
          throw new Error("Component could not be loaded!");
        }
      } else {
        throw new Error("Component not found!");
      }
    },
    getContext() {
      return {
        ...this["$nuxt"].$options.context,
        ...this.context
      };
    },
    async loadComponent() {
      this.loading = true;
      try {
        const cmp = (this["cmp"] = await this.loadMatchedComponent());
        if (cmp && cmp["options"]) {
          const options: ComponentOptions<Vue> = cmp["options"];
          const context = this.getContext();
          //Check validate function:
          if (typeof options.validate == "function") {
            const validateResult = await options.validate(context);
            if (validateResult === false) {
              throw new Error("Validate failed!");
            }
          }
          //Execute fetch function
          if (typeof options.fetch == "function") {
            await options.fetch(context);
          }
          //Set asyncData
          if (typeof options.asyncData == "function") {
            const asyncData = await options.asyncData(context);
            if (asyncData) {
              const _data = options.data;
              if (typeof _data == "function") {
                options.data = function() {
                  return { ..._data.call(this), ...asyncData };
                };
              } else {
                options.data = function() {
                  return asyncData;
                };
              }
            }
          }
        }
      } catch (e) {
        this.error = e;
      } finally {
        this.loading = false;
      }
    },
    getComponent() {
      return this["cmp"];
    }
  },
  watch: {
    route: {
      handler() {
        this.loadComponent();
      },
      immediate: true
    }
  },
  render(h): VNode {
    if (this.loading) {
      return h("div", this.$slots.loading || "Loading...");
    } else {
      if (this.error) {
        return h(ErrorComponent, { props: { error: this.error } });
      } else {
        return h(this.getComponent());
      }
    }
  }
});
</script>
