//@ts-ignore
import Vue from "vue";
import interact from "interactjs";

export default () =>
  Vue.extend({
    data() {
      return { resizeWidth: null };
    },
    props: {
      minWidth: { type: Number, default: 10 },
      collapseWidth: { type: Number, default: 0 }
    },
    mounted(this: any) {
      const me = this;
      const right = !!this["right"];
      interact(this.$el)
        .resizable({
          edges: {
            left: right,
            right: !right
          },
          inertia: true
        })
        .on("resizemove", (event: any) => {
          const w = event.rect.width;
          if (w >= this["minWidth"]) {
            Vue.set(me, "resizeWidth", event.rect.width);
            //me.resizeWidth = event.rect.width;
          }
          if (w < this["minWidth"] + (this["collapseWidth"] || 0)) {
            //me.resizeWidth = opts.minWidth;
            Vue.set(me, "resizeWidth", this["minWidth"]);
          }
        })
        .on("resizeend", event => {
          this["callUpdate"].call();
        });
    }
  });
