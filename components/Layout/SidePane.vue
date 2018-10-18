<script lang="ts">
import Vue, { VNode } from "vue";
//@ts-ignore
import VNavigationDrawer from "vuetify/es5/components/VNavigationDrawer";
import Resizeable from "~/mixins/Resizeable";
import SidePaneContent from "~/components/Layout/SidePaneContent.vue";

export default Vue.extend({
  extends: VNavigationDrawer as any,
  name: "SidePane",
  mixins: [Resizeable()],
  props: {
    items: { type: Array, default: () => [] },
    query: { type: String, default: "" },
    expanded: { type: Boolean, default: true }
  },
  computed: {
    calculatedWidth(this: any) {
      if (!this.expanded) return 64;
      return (
        this.resizeWidth ||
        VNavigationDrawer.computed.calculatedWidth.apply(this, arguments)
      );
    }
  },
  render(h) {
    const data = {
      class: this["classes"],
      style: this["styles"],
      directives: this["genDirectives"](),
      on: {
        click: () => {
          if (!this["miniVariant"]) return;

          this.$emit("update:miniVariant", false);
        },
        transitionend: (e: Event) => {
          if (e.target !== e.currentTarget) return;
          this.$emit("transitionend", e);

          // IE11 does not support new Event('resize')
          const resizeEvent = document.createEvent("UIEvents");
          resizeEvent.initUIEvent("resize", true, false, window, 0);
          window.dispatchEvent(resizeEvent);
        }
      }
    };

    return h("aside", data, [
      h(
        SidePaneContent,
        {
          props: {
            query: this["query"],
            items: this["items"],
            right: this["right"],
            value: this["expanded"]
          },
          on: {
            input: ($event: Boolean) => {
              this.$emit("update:expanded", $event);
            }
          }
        },
        this.$slots.default
      ),
      h("div", { class: "v-navigation-drawer__border" })
    ]);
  }
});
</script>
